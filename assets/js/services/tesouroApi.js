// Integração com os dados oficiais do Tesouro Direto.
//
// Fonte: https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json
// (mesma base usada pela página "Rendimento dos títulos" do site oficial).
//
// De cada título são extraídos os dados de INVESTIMENTO (PU e Rentabilidade Anual
// de compra) e de RESGATE (PU e Rentabilidade Anual de venda). A "Rentabilidade
// Anual" de RESGATE é a taxa atual de mercado usada na marcação a mercado.
//
// Estratégia de resiliência: proxy do próprio Apps Script (sem CORS, quando
// configurado) -> chamada direta -> proxies CORS públicos -> último cache válido
// em localStorage. Cada busca bem-sucedida alimenta o histórico diário de taxas.

import { load, save, KEYS } from './storage.js';
import { logOk, logErro } from './logger.js';

export const TESOURO_API_URL =
  'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json';

// Monta a lista de estratégias de busca em ordem de preferência. Quando o
// endpoint do Apps Script está configurado, ele entra na frente: roda no
// servidor do Google (UrlFetchApp), então não sofre bloqueio de CORS e é a
// fonte mais confiável. Os proxies públicos ficam como último recurso.
function estrategiasFetch() {
  const estrategias = [];
  const bridge = load(KEYS.BRIDGE, { url: '', token: '' });
  if (bridge && bridge.url) {
    const sep = bridge.url.includes('?') ? '&' : '?';
    const alvo = `${bridge.url}${sep}modulo=tesouro` +
      (bridge.token ? `&token=${encodeURIComponent(bridge.token)}` : '');
    estrategias.push({ nome: 'apps-script', build: () => alvo });
  }
  estrategias.push(
    { nome: 'direto', build: (url) => url },
    { nome: 'corsproxy', build: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}` },
    { nome: 'allorigins', build: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  );
  return estrategias;
}

export function normalizeTituloKey(nome) {
  return (nome || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBond(bd) {
  const venc = bd.mtrtyDt ? new Date(bd.mtrtyDt) : null;
  return {
    nome: bd.nm,
    puCompra: Number(bd.untrInvstmtVal) || null,   // dados de investimento
    taxaCompra: Number(bd.anulInvstmtRate),        // rentabilidade anual (investimento)
    puVenda: Number(bd.untrRedVal) || null,        // dados de resgate
    taxaVenda: Number(bd.anulRedRate),             // rentabilidade anual (resgate) => taxa de mercado
    vencimento: venc && !Number.isNaN(venc.getTime()) ? venc.toISOString() : null,
    indexador: bd.FinIndxs && bd.FinIndxs.nm ? bd.FinIndxs.nm : null,
  };
}

async function fetchRaw() {
  let lastError;
  for (const estrategia of estrategiasFetch()) {
    try {
      const resp = await fetch(estrategia.build(TESOURO_API_URL), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // O proxy do Apps Script pode devolver { erro } (token, API fora do ar):
      // nesse caso, cai para a próxima estratégia.
      if (data && data.erro) throw new Error(data.erro);
      const list = data?.response?.TrsrBdTradgList || [];
      if (!list.length) throw new Error('Lista de títulos vazia');
      return { list, via: estrategia.nome };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Falha ao consultar a API do Tesouro');
}

// Busca os dados na API oficial. Em caso de sucesso atualiza cache + histórico;
// em caso de falha lança erro (o chamador decide usar o cache via obterCache()).
export async function atualizarTesouro() {
  try {
    const { list, via } = await fetchRaw();
    const bonds = {};
    list.forEach((entry) => {
      const bd = entry?.TrsrBd;
      if (!bd || !bd.nm) return;
      bonds[normalizeTituloKey(bd.nm)] = parseBond(bd);
    });
    const cache = { fetchedAt: Date.now(), bonds, fonte: via };
    save(KEYS.TD_API_CACHE, cache);
    registrarHistorico(bonds);
    const rotuloFonte = via === 'apps-script' ? 'via sua planilha (Apps Script)' : `via ${via}`;
    logOk('tesouro-api', `${Object.keys(bonds).length} títulos atualizados na API oficial (${rotuloFonte}).`);
    return cache;
  } catch (err) {
    logErro('tesouro-api', `Falha na consulta: ${err.message}. Usando último dado válido, se houver.`);
    throw err;
  }
}

export function obterCache() {
  return load(KEYS.TD_API_CACHE, null);
}

// Histórico diário de taxas (uma entrada por dia, sobrescrevendo a do mesmo dia).
function registrarHistorico(bonds) {
  const hist = load(KEYS.TD_RATE_HISTORY, []);
  const hoje = new Date().toISOString().slice(0, 10);
  const taxas = {};
  Object.values(bonds).forEach((b) => {
    if (b.nome && (Number.isFinite(b.taxaVenda) || Number.isFinite(b.puVenda))) {
      taxas[b.nome] = { taxaVenda: b.taxaVenda, puVenda: b.puVenda, taxaCompra: b.taxaCompra };
    }
  });
  const idx = hist.findIndex((h) => h.date === hoje);
  const entry = { date: hoje, taxas };
  if (idx >= 0) hist[idx] = entry; else hist.unshift(entry);
  if (hist.length > 120) hist.length = 120; // ~4 meses de histórico local
  save(KEYS.TD_RATE_HISTORY, hist);
}

export function obterHistoricoTaxas() {
  return load(KEYS.TD_RATE_HISTORY, []);
}

// Localiza os dados de mercado de um título tolerando variações de nome.
export function dadosDoTitulo(cache, titulo) {
  if (!cache || !cache.bonds) return null;
  const key = normalizeTituloKey(titulo);
  if (cache.bonds[key]) return cache.bonds[key];
  const found = Object.keys(cache.bonds).find((k) => k.includes(key) || key.includes(k));
  return found ? cache.bonds[found] : null;
}

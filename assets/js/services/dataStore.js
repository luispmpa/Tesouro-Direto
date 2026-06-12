// Estado central da aplicação: carteira Tesouro, preços, IBOV, alertas e PGBL.
// Une três camadas de dados, nesta ordem de prioridade:
//   1. ajustes manuais do usuário (localStorage),
//   2. endpoint do Apps Script (planilha como backend),
//   3. seeds migrados da planilha (fallback estático).

import { CARTEIRA_SEED, IBOV_SEED, ALERTAS_SEED } from '../data/seeds.js';
import { load, save, KEYS } from './storage.js';
import { marcarPosicao } from '../utils/finance.js';
import { obterCache, dadosDoTitulo } from './tesouroApi.js';
import { obterCacheBridge } from './sheetsBridge.js';
import { logInfo } from './logger.js';

// ---------------------------------------------------------------------------
// Carteira Tesouro (CRUD preservado do app original)
// ---------------------------------------------------------------------------

export function generateId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') {
    return 'aporte-' + crypto.randomUUID();
  }
  return 'aporte-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function sanitizePortfolio(list) {
  const seen = new Set();
  const result = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    if (!item || typeof item !== 'object') return;
    if (!item.id) item.id = generateId();
    if (seen.has(item.id)) return;
    seen.add(item.id);
    result.push(item);
  });
  return result;
}

export function obterCarteira() {
  const saved = load(KEYS.PORTFOLIO, null);
  if (saved) {
    const clean = sanitizePortfolio(saved);
    if (clean.length !== saved.length) save(KEYS.PORTFOLIO, clean);
    return clean;
  }
  const seed = sanitizePortfolio(structuredClone(CARTEIRA_SEED));
  save(KEYS.PORTFOLIO, seed);
  logInfo('carteira', 'Carteira inicializada com os dados migrados da planilha.');
  return seed;
}

export function salvarCarteira(portfolio) {
  save(KEYS.PORTFOLIO, sanitizePortfolio(portfolio));
  document.dispatchEvent(new CustomEvent('app:carteira-alterada'));
}

export function restaurarCarteiraInicial() {
  save(KEYS.PORTFOLIO, sanitizePortfolio(structuredClone(CARTEIRA_SEED)));
  save(KEYS.MARKET_PRICES, {});
  document.dispatchEvent(new CustomEvent('app:carteira-alterada'));
}

// ---------------------------------------------------------------------------
// Preços manuais (override da API) — funcionalidade preservada
// ---------------------------------------------------------------------------

export function obterPrecosManuais() {
  return load(KEYS.MARKET_PRICES, {});
}

export function salvarPrecosManuais(prices) {
  save(KEYS.MARKET_PRICES, prices || {});
  document.dispatchEvent(new CustomEvent('app:carteira-alterada'));
}

// ---------------------------------------------------------------------------
// Premissas de projeção (IPCA/Selic projetados) e preferências
// ---------------------------------------------------------------------------

export function obterPrefs() {
  return load(KEYS.PREFS, { tema: 'dark', ipcaProjetado: 4.5, selicProjetada: 12.0, alertaVencimentoDias: 365 });
}

export function salvarPrefs(prefs) {
  save(KEYS.PREFS, { ...obterPrefs(), ...prefs });
}

// ---------------------------------------------------------------------------
// Carteira enriquecida com marcação a mercado
// ---------------------------------------------------------------------------

export function carteiraMarcada() {
  const carteira = obterCarteira();
  const apiCache = obterCache();
  const overrides = obterPrecosManuais();
  const prefs = obterPrefs();
  const premissas = { ipcaProjetado: prefs.ipcaProjetado, selicProjetada: prefs.selicProjetada };

  const posicoes = carteira.map((item) => {
    const mercadoRaw = dadosDoTitulo(apiCache, item.titulo);
    const mercado = mercadoRaw
      ? { ...mercadoRaw, vencimento: mercadoRaw.vencimento ? new Date(mercadoRaw.vencimento) : null }
      : null;
    return marcarPosicao(item, mercado, overrides, premissas);
  });

  const totais = posicoes.reduce(
    (acc, p) => {
      acc.investido += p.investidoCalc;
      acc.bruto += p.valorAtual;
      acc.liquido += p.valorLiquido;
      acc.ir += p.irValor;
      acc.b3 += p.b3Valor;
      return acc;
    },
    { investido: 0, bruto: 0, liquido: 0, ir: 0, b3: 0 }
  );
  totais.rentRS = totais.bruto - totais.investido;
  totais.rentPct = totais.investido > 0 ? (totais.rentRS / totais.investido) * 100 : 0;

  return { posicoes, totais, apiAtualizadaEm: apiCache ? apiCache.fetchedAt : null };
}

// Agrupa posições por título (cards de resumo) e por dimensões para gráficos.
export function agruparPosicoes(posicoes, chave) {
  const grupos = {};
  posicoes.forEach((p) => {
    let k;
    if (chave === 'titulo') k = p.titulo;
    else if (chave === 'tipo') k = p.tipo;
    else if (chave === 'indexador') k = p.indexador;
    else if (chave === 'vencimento') k = p.vencimento ? String(p.vencimento.getFullYear()) : 's/ data';
    else k = 'todos';
    if (!grupos[k]) grupos[k] = { chave: k, investido: 0, bruto: 0, liquido: 0, qtd: 0 };
    grupos[k].investido += p.investidoCalc;
    grupos[k].bruto += p.valorAtual;
    grupos[k].liquido += p.valorLiquido;
    grupos[k].qtd += 1;
  });
  return Object.values(grupos).sort((a, b) => b.bruto - a.bruto);
}

// ---------------------------------------------------------------------------
// IBOV — snapshot migrado da aba + cotações ao vivo via endpoint
// ---------------------------------------------------------------------------

export function obterIbov() {
  const bridge = obterCacheBridge();
  const live = bridge?.data?.ibov;
  if (Array.isArray(live) && live.length) {
    return { ativos: live, fonte: 'planilha', atualizadoEm: bridge.fetchedAt };
  }
  const cacheLocal = load(KEYS.IBOV_LIVE, null);
  if (cacheLocal?.ativos?.length) {
    return { ativos: cacheLocal.ativos, fonte: 'cache', atualizadoEm: cacheLocal.fetchedAt };
  }
  return { ativos: IBOV_SEED.ativos, fonte: 'seed', atualizadoEm: null, snapshotLabel: IBOV_SEED.snapshotLabel };
}

// Mapa código -> dados do ativo (para o motor de alertas).
export function mapaCotacoes() {
  const { ativos } = obterIbov();
  const mapa = {};
  ativos.forEach((a) => { if (a.codigo) mapa[a.codigo.toUpperCase()] = a; });
  return mapa;
}

// ---------------------------------------------------------------------------
// PGBL — somente local/endpoint (dados sensíveis nunca são versionados)
// ---------------------------------------------------------------------------

const PGBL_DEFAULT = {
  fundo: '',
  anos: {}, // { '2026': { renda: 0, aliquota: 27.5, metaManual: null, meses: {1: 500, ...} } }
  importLog: [],
  atualizadoEm: null,
};

export function obterPGBL() {
  const local = load(KEYS.PGBL, structuredClone(PGBL_DEFAULT));
  const bridge = obterCacheBridge();
  const remoto = bridge?.data?.pgbl;
  if (remoto && remoto.anos) {
    // Dados da planilha têm prioridade; parâmetros locais completam o que faltar.
    return {
      ...local,
      ...remoto,
      anos: { ...local.anos, ...remoto.anos },
      fonte: 'planilha',
      sincronizadoEm: bridge.fetchedAt,
    };
  }
  return { ...local, fonte: 'local' };
}

export function salvarPGBLLocal(pgbl) {
  const { fonte, sincronizadoEm, ...rest } = pgbl;
  save(KEYS.PGBL, rest);
  document.dispatchEvent(new CustomEvent('app:pgbl-alterado'));
}

export function totalAportadoAno(pgbl, ano) {
  const meses = pgbl.anos?.[String(ano)]?.meses || {};
  return Object.values(meses).reduce((s, v) => s + (Number(v) || 0), 0);
}

// ---------------------------------------------------------------------------
// Status das fontes de dados (página Dados & Integrações e Dashboard)
// ---------------------------------------------------------------------------

export function statusFontes() {
  const api = obterCache();
  const bridge = obterCacheBridge();
  const ibov = obterIbov();
  return {
    tesouroApi: { conectado: Boolean(api), atualizadoEm: api?.fetchedAt || null },
    appsScript: { conectado: Boolean(bridge), atualizadoEm: bridge?.fetchedAt || null },
    ibov: { fonte: ibov.fonte, atualizadoEm: ibov.atualizadoEm },
  };
}

export { ALERTAS_SEED };

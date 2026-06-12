// Motor de alertas — espelha as regras da aba "Alertas" da planilha e as
// estende para Tesouro Direto, vencimentos, meta PGBL e saúde dos dados.
//
// Tipos suportados:
//   acao      : Preço acima | Preço abaixo | Variação ≥ | Variação ≤ (base: Hoje, 7 dias, 30 dias)
//   tesouro   : Taxa de resgate ≥ | Taxa de resgate ≤ (parametrizável por título)
//   vencimento: título da carteira vence em até N dias (automático)
//   pgbl      : meta anual de aporte em atraso (automático)
//   dados     : fontes de dados desatualizadas (automático)
//
// O envio de E-MAIL permanece no Apps Script (verificarAlertas), que continua
// rodando por gatilho na planilha. Aqui o painel exibe, avalia e historiza.

import { load, save, KEYS } from './storage.js';
import { ALERTAS_SEED, mapaCotacoes, carteiraMarcada, obterPGBL, totalAportadoAno, obterPrefs, statusFontes } from './dataStore.js';
import { obterCache, dadosDoTitulo } from './tesouroApi.js';
import { calcularPainelPGBL } from '../utils/finance.js';
import { logInfo } from './logger.js';

export const TIPOS_ACAO = ['Preço acima', 'Preço abaixo', 'Variação ≥', 'Variação ≤'];
export const BASES_VARIACAO = ['Hoje', '7 dias', '30 dias'];
export const TIPOS_TESOURO = ['Taxa ≥', 'Taxa ≤'];

export function obterAlertas() {
  let alertas = load(KEYS.ALERTS, null);
  if (!alertas) {
    // Primeira execução: migra os alertas configurados na aba "Alertas".
    alertas = ALERTAS_SEED.map((a) => ({
      id: a.id,
      categoria: 'acao',
      ativo: a.ativo,
      tipo: a.tipo,
      valorAlvo: Number(a.valorAlvo),
      base: a.base || '',
      status: a.status || 'Ativo',
      obs: a.obs || '',
    }));
    save(KEYS.ALERTS, alertas);
    logInfo('alertas', `${alertas.length} alertas migrados da planilha.`);
  }
  return alertas;
}

export function salvarAlertas(alertas) {
  save(KEYS.ALERTS, alertas);
  document.dispatchEvent(new CustomEvent('app:alertas-alterados'));
}

export function adicionarAlerta(alerta) {
  const alertas = obterAlertas();
  alertas.push({ id: 'al-' + Date.now().toString(36), status: 'Ativo', ...alerta });
  salvarAlertas(alertas);
}

export function removerAlerta(id) {
  salvarAlertas(obterAlertas().filter((a) => a.id !== id));
}

export function alternarStatus(id) {
  const alertas = obterAlertas();
  const a = alertas.find((x) => x.id === id);
  if (a) {
    a.status = a.status === 'Ativo' ? 'Pausado' : 'Ativo';
    salvarAlertas(alertas);
  }
}

// ---------------------------------------------------------------------------
// Avaliação — replica a fórmula da coluna "Condição Atendida?" da planilha
// ---------------------------------------------------------------------------

function variacaoDaBase(ativo, base) {
  // Usa as variações já calculadas (GOOGLEFINANCE na planilha / snapshot seed).
  if (base === 'Hoje') return ativo.varDia;
  if (base === '7 dias') return ativo.varSemana;
  if (base === '30 dias') return ativo.varMes;
  return null;
}

function avaliarAlertaAcao(alerta, cotacoes) {
  const ativo = cotacoes[(alerta.ativo || '').toUpperCase()];
  const preco = ativo?.cotacao;
  if (!Number.isFinite(preco)) return { condicao: null, preco: null, detalhe: 'cotação indisponível' };

  if (alerta.tipo === 'Preço acima') return { condicao: preco >= alerta.valorAlvo, preco };
  if (alerta.tipo === 'Preço abaixo') return { condicao: preco <= alerta.valorAlvo, preco };

  const variacao = variacaoDaBase(ativo, alerta.base);
  if (!Number.isFinite(variacao)) return { condicao: null, preco, detalhe: 'variação indisponível' };
  // Valor-alvo de variação é informado em percentual (ex.: 5 = 5%).
  const alvo = Math.abs(alerta.valorAlvo) > 1 ? alerta.valorAlvo / 100 : alerta.valorAlvo;
  if (alerta.tipo === 'Variação ≥') return { condicao: variacao >= alvo, preco, variacao };
  if (alerta.tipo === 'Variação ≤') return { condicao: variacao <= alvo, preco, variacao };
  return { condicao: null, preco };
}

function avaliarAlertaTesouro(alerta, apiCache) {
  const dados = dadosDoTitulo(apiCache, alerta.ativo);
  const taxa = dados?.taxaVenda;
  if (!Number.isFinite(taxa)) return { condicao: null, taxa: null, detalhe: 'taxa indisponível' };
  if (alerta.tipo === 'Taxa ≥') return { condicao: taxa >= alerta.valorAlvo, taxa };
  if (alerta.tipo === 'Taxa ≤') return { condicao: taxa <= alerta.valorAlvo, taxa };
  return { condicao: null, taxa };
}

// Avalia todos os alertas configurados + gera alertas automáticos.
export function avaliarTudo() {
  const cotacoes = mapaCotacoes();
  const apiCache = obterCache();
  const agora = Date.now();

  const configurados = obterAlertas().map((alerta) => {
    let resultado = { condicao: null };
    if (alerta.status !== 'Pausado') {
      resultado = alerta.categoria === 'tesouro'
        ? avaliarAlertaTesouro(alerta, apiCache)
        : avaliarAlertaAcao(alerta, cotacoes);
    }
    return { ...alerta, ...resultado, verificadoEm: agora };
  });

  // Alertas automáticos -------------------------------------------------
  const automaticos = [];
  const prefs = obterPrefs();

  // Vencimentos próximos
  const { posicoes } = carteiraMarcada();
  const vistos = new Set();
  posicoes.forEach((p) => {
    if (p.diasAteVcto != null && p.diasAteVcto <= (prefs.alertaVencimentoDias ?? 365) && !vistos.has(p.titulo)) {
      vistos.add(p.titulo);
      automaticos.push({
        id: 'auto-vcto-' + p.titulo,
        categoria: 'vencimento',
        condicao: true,
        mensagem: `${p.titulo} vence em ${p.diasAteVcto} dias (${p.vencimento.toLocaleDateString('pt-BR')}).`,
        severidade: p.diasAteVcto <= 90 ? 'alta' : 'media',
      });
    }
  });

  // Meta PGBL
  const pgbl = obterPGBL();
  const ano = new Date().getFullYear();
  const cfgAno = pgbl.anos?.[String(ano)];
  if (cfgAno && (cfgAno.renda > 0 || cfgAno.metaManual > 0)) {
    const painel = calcularPainelPGBL({
      rendaTributavel: cfgAno.renda || 0,
      aliquota: cfgAno.aliquota ?? 27.5,
      metaManual: cfgAno.metaManual,
      totalAportado: totalAportadoAno(pgbl, ano),
    });
    const mesAtual = new Date().getMonth() + 1;
    const esperado = painel.meta * (mesAtual / 12);
    const aportado = totalAportadoAno(pgbl, ano);
    if (painel.meta > 0 && aportado < esperado) {
      automaticos.push({
        id: 'auto-pgbl-' + ano,
        categoria: 'pgbl',
        condicao: true,
        mensagem: `Aportes PGBL abaixo do ritmo da meta anual: ${(painel.pctMeta).toFixed(1)}% da meta (esperado ~${((mesAtual / 12) * 100).toFixed(0)}% até agora).`,
        severidade: 'media',
      });
    }
  }

  // Saúde dos dados
  const fontes = statusFontes();
  const LIMITE_H = 48 * 3600 * 1000;
  if (!fontes.tesouroApi.atualizadoEm || agora - fontes.tesouroApi.atualizadoEm > LIMITE_H) {
    automaticos.push({
      id: 'auto-dados-tesouro',
      categoria: 'dados',
      condicao: true,
      mensagem: 'Taxas do Tesouro Direto desatualizadas (sem consulta à API há mais de 48h).',
      severidade: 'baixa',
    });
  }

  return { configurados, automaticos, verificadoEm: agora };
}

// ---------------------------------------------------------------------------
// Histórico de disparos
// ---------------------------------------------------------------------------

export function registrarDisparos(avaliacao) {
  const hist = load(KEYS.ALERT_HISTORY, []);
  const novos = [];
  const recentes = new Set(
    hist.filter((h) => Date.now() - h.ts < 24 * 3600 * 1000).map((h) => h.chave)
  );

  avaliacao.configurados.forEach((a) => {
    if (a.condicao === true && a.status === 'Ativo') {
      const chave = `${a.id}`;
      if (!recentes.has(chave)) {
        novos.push({
          ts: Date.now(), chave, categoria: a.categoria || 'acao',
          mensagem: `${a.ativo} — ${a.tipo} ${a.valorAlvo}${a.base ? ` (${a.base})` : ''} atingido.`,
        });
      }
    }
  });
  avaliacao.automaticos.forEach((a) => {
    if (!recentes.has(a.id)) {
      novos.push({ ts: Date.now(), chave: a.id, categoria: a.categoria, mensagem: a.mensagem });
    }
  });

  if (novos.length) {
    hist.unshift(...novos);
    if (hist.length > 500) hist.length = 500;
    save(KEYS.ALERT_HISTORY, hist);
  }
  return novos;
}

export function obterHistorico() {
  return load(KEYS.ALERT_HISTORY, []);
}

export function limparHistorico() {
  save(KEYS.ALERT_HISTORY, []);
}

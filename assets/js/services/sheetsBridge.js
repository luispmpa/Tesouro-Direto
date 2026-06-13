// Ponte com o Google Apps Script (Web App publicado a partir da planilha).
//
// O Apps Script continua sendo o backend seguro para tudo que depende de
// credenciais: leitura do Gmail (aportes PGBL), envio de alertas por e-mail,
// gatilhos agendados e cotações via GOOGLEFINANCE. O front-end consome apenas
// JSON já tratado, via GET no endpoint /exec do Web App.
//
// A URL do endpoint (e o token opcional) são configurados pelo usuário na
// página "Dados & Integrações" e ficam SOMENTE em localStorage — nunca no
// repositório público. Veja apps-script/Code.gs e docs/IMPLANTACAO.md.

import { load, save, KEYS } from './storage.js';
import { logOk, logErro } from './logger.js';

export function obterConfig() {
  return load(KEYS.BRIDGE, { url: '', token: '' });
}

export function salvarConfig(url, token) {
  save(KEYS.BRIDGE, { url: (url || '').trim(), token: (token || '').trim() });
}

export function configurado() {
  const cfg = obterConfig();
  return Boolean(cfg.url);
}

export function obterCacheBridge() {
  return load(KEYS.BRIDGE_CACHE, null);
}

// Busca todos os módulos no Web App. Em caso de falha, lança erro e o chamador
// pode usar obterCacheBridge() como fallback (último dado válido).
export async function sincronizar(modulo = 'all') {
  const cfg = obterConfig();
  if (!cfg.url) throw new Error('Endpoint do Apps Script não configurado.');

  const sep = cfg.url.includes('?') ? '&' : '?';
  const url = `${cfg.url}${sep}modulo=${encodeURIComponent(modulo)}` +
    (cfg.token ? `&token=${encodeURIComponent(cfg.token)}` : '');

  let resp;
  try {
    resp = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'follow' });
  } catch (err) {
    logErro('sheets-bridge', `Sem conexão com o Apps Script: ${err.message}`);
    throw new Error('Não foi possível conectar ao endpoint do Apps Script.');
  }
  if (!resp.ok) {
    logErro('sheets-bridge', `Endpoint respondeu HTTP ${resp.status}`);
    throw new Error(`Endpoint respondeu HTTP ${resp.status}.`);
  }
  const data = await resp.json();
  if (data && data.erro) {
    logErro('sheets-bridge', `Apps Script retornou erro: ${data.erro}`);
    throw new Error(data.erro);
  }

  const cache = { fetchedAt: Date.now(), data };
  // O cache global só é gravado na sincronização completa; um "ping" de
  // diagnóstico não pode sobrescrever os dados de IBOV/PGBL/logs já obtidos.
  if (modulo === 'all') {
    save(KEYS.BRIDGE_CACHE, cache);
    document.dispatchEvent(new CustomEvent('app:bridge-sync', { detail: cache }));
  }
  logOk('sheets-bridge', `Dados da planilha sincronizados (módulo: ${modulo}).`);
  return cache;
}

// Dispara uma ação remota no Apps Script (ex.: importarAportesPGBL, verificarAlertas).
export async function executarAcao(acao) {
  const cfg = obterConfig();
  if (!cfg.url) throw new Error('Endpoint do Apps Script não configurado.');
  const sep = cfg.url.includes('?') ? '&' : '?';
  const url = `${cfg.url}${sep}acao=${encodeURIComponent(acao)}` +
    (cfg.token ? `&token=${encodeURIComponent(cfg.token)}` : '');
  const resp = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'follow' });
  if (!resp.ok) throw new Error(`Endpoint respondeu HTTP ${resp.status}.`);
  const data = await resp.json();
  if (data && data.erro) throw new Error(data.erro);
  logOk('sheets-bridge', `Ação remota executada: ${acao}`);
  return data;
}

// Escreve a configuração de alertas na aba "Alertas" da planilha do Drive, para
// que o robô de e-mail (verificarAlertas) reflita as inclusões/edições/remoções
// feitas no painel. POST com corpo de texto simples (sem cabeçalho custom) para
// evitar preflight de CORS; o token vai na query string. Melhor esforço: o
// chamador trata a falha sem reverter a alteração local.
export async function enviarAlertas(alertas) {
  const cfg = obterConfig();
  if (!cfg.url) throw new Error('Endpoint do Apps Script não configurado.');
  const sep = cfg.url.includes('?') ? '&' : '?';
  const url = `${cfg.url}${sep}acao=salvarAlertas` +
    (cfg.token ? `&token=${encodeURIComponent(cfg.token)}` : '');

  // Envia só os campos que a planilha entende (alertas de preço/ação).
  const payload = (Array.isArray(alertas) ? alertas : [])
    .filter((a) => (a.categoria || 'acao') === 'acao')
    .map((a) => ({
      ativo: a.ativo, tipo: a.tipo, valorAlvo: a.valorAlvo,
      base: a.base || '', status: a.status || 'Ativo', obs: a.obs || '',
    }));

  let resp;
  try {
    resp = await fetch(url, { method: 'POST', body: JSON.stringify({ alertas: payload }), redirect: 'follow' });
  } catch (err) {
    logErro('sheets-bridge', `Falha ao gravar alertas na planilha: ${err.message}`);
    throw new Error('Não foi possível gravar os alertas na planilha.');
  }
  if (!resp.ok) {
    logErro('sheets-bridge', `Gravação de alertas respondeu HTTP ${resp.status}`);
    throw new Error(`Endpoint respondeu HTTP ${resp.status}.`);
  }
  let data = {};
  try { data = await resp.json(); } catch { /* resposta sem JSON é tolerada */ }
  if (data && data.erro) {
    logErro('sheets-bridge', `Apps Script recusou os alertas: ${data.erro}`);
    throw new Error(data.erro);
  }
  logOk('sheets-bridge', `Alertas gravados na planilha (${payload.length} regra(s)).`);
  return data;
}

// Teste de diagnóstico usado na página Dados & Integrações.
export async function diagnosticar() {
  const inicio = performance.now();
  const cache = await sincronizar('ping');
  return {
    ok: true,
    latenciaMs: Math.round(performance.now() - inicio),
    resposta: cache.data,
  };
}

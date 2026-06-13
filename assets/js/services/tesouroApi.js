// Dados de mercado dos títulos do Tesouro Direto — agora 100% MANUAIS.
//
// O site do Tesouro Direto bloqueia o consumo da API pública (treasurybondsinfo),
// então o painel NÃO faz mais nenhuma chamada online. Os preços de resgate (PU) e
// as taxas de resgate (Rentabilidade Anual) são informados pelo usuário:
//   • importando o Extrato Analítico / planilha de resgate (.xlsx/.xls/.csv), ou
//   • digitando manualmente em "Tesouro Direto › Atualizar mercado".
//
// Este módulo só guarda e lê esses dados manuais no localStorage. Mantém a mesma
// interface (obterCache / dadosDoTitulo / obterHistoricoTaxas) usada pelo resto do
// app, para que a marcação a mercado continue funcionando sem nenhuma rede.

import { load, save, KEYS } from './storage.js';
import { logOk } from './logger.js';

export function normalizeTituloKey(nome) {
  return (nome || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function obterCache() {
  return load(KEYS.TD_API_CACHE, null);
}

// Salva (mesclando com o que já existe) os dados de mercado informados
// manualmente. `entries` é uma lista de { nome, puVenda, taxaVenda, vencimento }.
// Campos ausentes preservam o valor anterior do mesmo título.
export function salvarMercadoManual(entries) {
  const atual = obterCache();
  const bonds = { ...(atual?.bonds || {}) };

  (Array.isArray(entries) ? entries : []).forEach((e) => {
    if (!e || !e.nome) return;
    const key = normalizeTituloKey(e.nome);
    const prev = bonds[key] || {};
    bonds[key] = {
      nome: e.nome,
      puVenda: Number.isFinite(e.puVenda) ? e.puVenda : (prev.puVenda ?? null),
      taxaVenda: Number.isFinite(e.taxaVenda) ? e.taxaVenda : (prev.taxaVenda ?? null),
      vencimento: e.vencimento || prev.vencimento || null,
      indexador: e.indexador || prev.indexador || null,
    };
  });

  const cache = { fetchedAt: Date.now(), bonds, fonte: 'manual' };
  save(KEYS.TD_API_CACHE, cache);
  registrarHistorico(bonds);
  logOk('mercado', `${Object.keys(bonds).length} título(s) com dados de mercado atualizados manualmente.`);
  return cache;
}

// Histórico diário de taxas (uma entrada por dia, sobrescrevendo a do mesmo dia).
function registrarHistorico(bonds) {
  const hist = load(KEYS.TD_RATE_HISTORY, []);
  const hoje = new Date().toISOString().slice(0, 10);
  const taxas = {};
  Object.values(bonds).forEach((b) => {
    if (b.nome && (Number.isFinite(b.taxaVenda) || Number.isFinite(b.puVenda))) {
      taxas[b.nome] = { taxaVenda: b.taxaVenda, puVenda: b.puVenda };
    }
  });
  if (!Object.keys(taxas).length) return;
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

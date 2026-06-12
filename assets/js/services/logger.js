// Registro de execução e erros do front-end. O histórico fica em localStorage
// e é exibido na página "Dados & Integrações" (rastreabilidade exigida no projeto).

import { load, save, KEYS } from './storage.js';

const MAX_LOGS = 300;

export function log(origem, status, mensagem) {
  const entry = { ts: Date.now(), origem, status, mensagem: String(mensagem || '') };
  const logs = load(KEYS.LOGS, []);
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
  save(KEYS.LOGS, logs);
  const fn = status === 'erro' ? console.error : console.info;
  fn(`[${origem}] ${status}: ${entry.mensagem}`);
  document.dispatchEvent(new CustomEvent('app:log', { detail: entry }));
  return entry;
}

export const logOk = (origem, msg) => log(origem, 'ok', msg);
export const logErro = (origem, msg) => log(origem, 'erro', msg);
export const logInfo = (origem, msg) => log(origem, 'info', msg);

export function obterLogs() {
  return load(KEYS.LOGS, []);
}

export function limparLogs() {
  save(KEYS.LOGS, []);
}

// Utilitários de formatação (pt-BR).

export const fmtBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number.isFinite(v) ? v : 0);

export const fmtNum = (v, dec = 2) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    .format(Number.isFinite(v) ? v : 0);

export const fmtPct = (v, dec = 2, comSinal = false) => {
  if (!Number.isFinite(v)) return '—';
  const s = comSinal && v > 0 ? '+' : '';
  return s + fmtNum(v, dec) + '%';
};

// Converte "DD/MM/AAAA" (ou "D/M/AAAA") em Date local; retorna null se inválida.
export function parseDataBR(str) {
  if (str instanceof Date) return str;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((str || '').trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export const fmtDataBR = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
};

export const fmtDataHoraBR = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR') + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export function tempoRelativo(ts) {
  if (!ts) return 'nunca';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

// Classe CSS para valores positivos/negativos.
export const classeSinal = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'neutro');

export const sinal = (v) => (v > 0 ? '+' : '');

// Escapa texto para interpolação segura em innerHTML.
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Persistência local (localStorage) com tolerância a falhas.
// As chaves legadas `tesouro_portfolio` e `tesouro_market_prices` são mantidas
// para compatibilidade com versões anteriores do app (dados do usuário preservados).

export const KEYS = {
  PORTFOLIO: 'tesouro_portfolio',          // legado — carteira de aportes
  MARKET_PRICES: 'tesouro_market_prices',  // legado — preços manuais por título
  TD_API_CACHE: 'fin_td_api_cache',        // último retorno válido da API do Tesouro
  TD_RATE_HISTORY: 'fin_td_rate_history',  // histórico diário de taxas/PUs
  IBOV_LIVE: 'fin_ibov_live',              // cotações vindas do endpoint (planilha)
  ALERTS: 'fin_alerts',                    // configuração de alertas
  ALERT_HISTORY: 'fin_alert_history',      // histórico de disparos
  PGBL: 'fin_pgbl',                        // parâmetros e aportes PGBL (apenas local)
  BRIDGE: 'fin_bridge_config',             // URL/token do Web App do Apps Script
  BRIDGE_CACHE: 'fin_bridge_cache',        // último payload válido do endpoint
  LOGS: 'fin_logs',                        // log de execução do app
  PREFS: 'fin_prefs',                      // tema, premissas de projeção, etc.
};

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Falha ao salvar', key, e);
    return false;
  }
}

export function remove(key) {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

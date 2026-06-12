// Bootstrap da aplicação: router por hash, navegação, tema e atualização global.

import { renderDashboard } from './pages/dashboard.js';
import { renderTesouro } from './pages/tesouro.js';
import { renderIbov } from './pages/ibov.js';
import { renderPgbl } from './pages/pgbl.js';
import { renderAlertas } from './pages/alertas.js';
import { renderDados } from './pages/dados.js';
import { obterPrefs, salvarPrefs, statusFontes } from './services/dataStore.js';
import { atualizarTesouro, obterCache } from './services/tesouroApi.js';
import { sincronizar, configurado } from './services/sheetsBridge.js';
import { avaliarTudo, registrarDisparos } from './services/alertEngine.js';
import { tempoRelativo } from './utils/format.js';
import { logErro } from './services/logger.js';

const ROUTES = {
  '/': { titulo: 'Dashboard', render: renderDashboard },
  '/tesouro': { titulo: 'Tesouro Direto', render: renderTesouro },
  '/ibov': { titulo: 'IBOV / Ações', render: renderIbov },
  '/pgbl': { titulo: 'Previdência PGBL', render: renderPgbl },
  '/alertas': { titulo: 'Alertas', render: renderAlertas },
  '/dados': { titulo: 'Dados & Integrações', render: renderDados },
};

let rotaAtual = '/';

// ---------------------------------------------------------------- toasts ---

export function showToast(message, type = 'info', duration = 3800) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast; // acesso pelas páginas sem import circular

// ---------------------------------------------------------------- router ---

function navegar() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const rota = ROUTES[hash] ? hash : '/';
  rotaAtual = rota;

  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === rota);
  });
  document.getElementById('page-title').textContent = ROUTES[rota].titulo;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');

  const view = document.getElementById('view');
  view.innerHTML = '';
  try {
    ROUTES[rota].render(view);
  } catch (err) {
    console.error(err);
    logErro('router', `Erro ao renderizar ${rota}: ${err.message}`);
    view.innerHTML = `<div class="empty-box">Ocorreu um erro ao montar esta página.<br>
      <small>${err.message}</small></div>`;
  }
  atualizarRodapeStatus();
  window.scrollTo({ top: 0 });
}

export function rerender() {
  navegar();
}

// ----------------------------------------------------------------- tema ----

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema === 'light' ? 'light' : 'dark');
}

// ------------------------------------------------- atualização global ------

function atualizarRodapeStatus() {
  const el = document.getElementById('global-last-update');
  if (!el) return;
  const fontes = statusFontes();
  const ts = Math.max(fontes.tesouroApi.atualizadoEm || 0, fontes.appsScript.atualizadoEm || 0);
  el.textContent = ts ? `Dados atualizados ${tempoRelativo(ts)}` : 'Dados ainda não sincronizados';
}

function atualizarBadgeAlertas() {
  try {
    const av = avaliarTudo();
    const ativos = av.configurados.filter((a) => a.condicao === true && a.status === 'Ativo').length
      + av.automaticos.length;
    const badge = document.getElementById('nav-alert-badge');
    if (badge) {
      badge.innerHTML = ativos > 0 ? `<span class="badge badge-warn">${ativos}</span>` : '';
    }
    registrarDisparos(av);
  } catch (err) {
    console.error('Falha ao avaliar alertas:', err);
  }
}

async function atualizarTudo() {
  const btn = document.getElementById('btn-global-refresh');
  btn.disabled = true;
  let okApi = false;
  let okBridge = false;

  try {
    await atualizarTesouro();
    okApi = true;
  } catch { /* erro já logado; cache anterior permanece válido */ }

  if (configurado()) {
    try {
      await sincronizar('all');
      okBridge = true;
    } catch { /* erro já logado */ }
  }

  btn.disabled = false;
  atualizarBadgeAlertas();
  navegar();

  if (okApi && okBridge) showToast('Tesouro Direto e planilha sincronizados.', 'success');
  else if (okApi) showToast('Taxas do Tesouro atualizadas.' + (configurado() ? ' Falha ao sincronizar a planilha.' : ''), configurado() ? 'info' : 'success');
  else if (okBridge) showToast('Planilha sincronizada. API do Tesouro indisponível (usando último dado válido).', 'info');
  else showToast('Não foi possível atualizar agora. Exibindo últimos dados válidos.', 'error');
}

// ------------------------------------------------------------------ init ---

function init() {
  aplicarTema(obterPrefs().tema);

  window.addEventListener('hashchange', navegar);
  document.getElementById('btn-global-refresh').addEventListener('click', atualizarTudo);
  document.getElementById('btn-theme').addEventListener('click', () => {
    const tema = obterPrefs().tema === 'light' ? 'dark' : 'light';
    salvarPrefs({ tema });
    aplicarTema(tema);
  });

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  document.getElementById('burger').addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Re-render reativo quando dados mudam fora da página atual.
  ['app:carteira-alterada', 'app:alertas-alterados', 'app:pgbl-alterado'].forEach((ev) =>
    document.addEventListener(ev, () => atualizarBadgeAlertas())
  );

  navegar();
  atualizarBadgeAlertas();

  // Primeira carga: busca silenciosa das taxas se o cache estiver frio (>6h).
  const cache = obterCache();
  if (!cache || Date.now() - cache.fetchedAt > 6 * 3600 * 1000) {
    atualizarTesouro()
      .then(() => { atualizarBadgeAlertas(); navegar(); })
      .catch(() => { /* mantém fallback */ });
  }
  if (configurado()) {
    sincronizar('all').then(() => { atualizarBadgeAlertas(); navegar(); }).catch(() => { /* mantém cache */ });
  }
}

init();

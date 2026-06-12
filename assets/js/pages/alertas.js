// Módulo Alertas — preserva os 34 alertas de preço migrados da aba "Alertas"
// e adiciona alertas de taxa do Tesouro Direto, vencimento, meta PGBL e saúde
// dos dados. O painel permite ativar/pausar, criar, editar parâmetros e ver o
// histórico de disparos.
//
// Envio por E-MAIL: continua no Apps Script (verificarAlertas roda por gatilho
// na planilha e usa MailApp). Aqui é possível disparar essa verificação
// remotamente quando o endpoint está configurado.

import {
  obterAlertas, salvarAlertas, adicionarAlerta, removerAlerta, alternarStatus,
  avaliarTudo, registrarDisparos, obterHistorico, limparHistorico,
  TIPOS_ACAO, BASES_VARIACAO, TIPOS_TESOURO,
} from '../services/alertEngine.js';
import { obterPrefs, salvarPrefs, carteiraMarcada } from '../services/dataStore.js';
import { obterCache } from '../services/tesouroApi.js';
import { configurado, executarAcao } from '../services/sheetsBridge.js';
import { fmtBRL, fmtNum, fmtDataHoraBR, tempoRelativo, esc } from '../utils/format.js';
import { abrirModal } from '../utils/ui.js';

let filtroCategoria = 'todos';

export function renderAlertas(view) {
  const avaliacao = avaliarTudo();
  registrarDisparos(avaliacao);

  const { configurados, automaticos } = avaliacao;
  const ativos = configurados.filter((a) => a.status === 'Ativo');
  const atingidos = configurados.filter((a) => a.condicao === true && a.status === 'Ativo');
  const semDados = configurados.filter((a) => a.condicao === null && a.status === 'Ativo');
  const historico = obterHistorico();
  const prefs = obterPrefs();

  view.innerHTML = `
    <section class="grid grid-kpi">
      ${kpi('Alertas configurados', configurados.length, `${ativos.length} ativos · ${configurados.length - ativos.length} pausados`)}
      ${kpi('Condição atingida', `<span class="${atingidos.length ? 'neg' : 'pos'}">${atingidos.length}</span>`, 'alertas configurados disparados')}
      ${kpi('Alertas automáticos', `<span class="${automaticos.length ? 'neg' : 'pos'}">${automaticos.length}</span>`, 'vencimento · meta PGBL · saúde dos dados')}
      ${kpi('Sem dados p/ avaliar', semDados.length, semDados.length ? 'fonte de cotação indisponível' : 'todas as fontes ok')}
    </section>

    <div class="notice" style="margin-bottom:16px">
      <strong>E-mail:</strong> os avisos por e-mail continuam sendo enviados pelo Apps Script da planilha
      (função <code>verificarAlertas</code>, rodando por gatilho — independe deste site estar aberto).
      Este painel avalia as mesmas regras com os dados disponíveis no navegador.
      ${configurado()
        ? '<button class="btn btn-secondary btn-sm" id="btn-verificar-remoto" style="margin-left:8px">▶ Executar verificação por e-mail agora</button>'
        : 'Para disparar a verificação remota daqui, configure o endpoint em <a href="#/dados" style="color:var(--primary)">Dados &amp; Integrações</a>.'}
    </div>

    <div class="section-title">
      <h2>Alertas configurados <span class="count-badge">${configurados.length}</span></h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div class="chip-filter">
          ${chipFiltro('todos', 'Todos')}
          ${chipFiltro('acao', 'Ações')}
          ${chipFiltro('tesouro', 'Tesouro')}
          ${chipFiltro('atingidos', 'Atingidos')}
        </div>
        <button class="btn btn-primary btn-sm" id="btn-novo-alerta">+ Novo alerta</button>
      </div>
    </div>
    <div class="card" id="lista-alertas" style="padding:10px 16px"></div>

    <div class="section-title"><h2>Alertas automáticos</h2><span class="hint">gerados a partir da carteira, do PGBL e da saúde dos dados</span></div>
    <div class="card" style="padding:10px 16px">
      ${automaticos.length
        ? automaticos.map((a) => `
            <div class="status-row">
              <span class="dot ${a.severidade === 'alta' ? 'dot-neg' : 'dot-warn'}"></span>
              <span>${esc(a.mensagem)}</span>
              <span class="meta">${esc(a.categoria)}</span>
            </div>`).join('')
        : '<div class="empty-box">Nenhum alerta automático no momento. ✓</div>'}
      <div class="inline-form mt" style="border-top:1px solid var(--border);padding-top:14px">
        <div class="form-group">
          <label>Avisar vencimentos em até (dias)</label>
          <input type="number" step="1" min="1" id="f-vcto-dias" value="${prefs.alertaVencimentoDias ?? 365}">
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-salvar-param-auto">Salvar parâmetro</button>
      </div>
    </div>

    <div class="section-title">
      <h2>Histórico de disparos <span class="count-badge">${historico.length}</span></h2>
      ${historico.length ? '<button class="btn btn-secondary btn-sm" id="btn-limpar-hist">Limpar histórico</button>' : ''}
    </div>
    <div class="card" style="padding:10px 16px">
      ${historico.length
        ? `<div class="log-list">${historico.slice(0, 60).map((h) => `
            <div class="log-row">
              <span class="ts">${fmtDataHoraBR(new Date(h.ts))}</span>
              <span class="origem">${esc(h.categoria || 'alerta')}</span>
              <span>${esc(h.mensagem)}</span>
            </div>`).join('')}</div>`
        : '<div class="empty-box">Nenhum disparo registrado ainda. Cada condição atingida gera no máximo um registro a cada 24h.</div>'}
    </div>`;

  montarLista(view, configurados);
  ligarEventos(view);
}

const kpi = (t, v, sub = '') => `<div class="card kpi"><h3>${t}</h3><p class="valor">${v}</p><span class="sub">${sub}</span></div>`;

const chipFiltro = (id, rotulo) =>
  `<button class="chip ${filtroCategoria === id ? 'active' : ''}" data-cat="${id}">${rotulo}</button>`;

// ------------------------------------------------------------- listagem -----

function montarLista(view, configurados) {
  const box = view.querySelector('#lista-alertas');
  let linhas = configurados;
  if (filtroCategoria === 'acao') linhas = linhas.filter((a) => (a.categoria || 'acao') === 'acao');
  else if (filtroCategoria === 'tesouro') linhas = linhas.filter((a) => a.categoria === 'tesouro');
  else if (filtroCategoria === 'atingidos') linhas = linhas.filter((a) => a.condicao === true);

  if (!linhas.length) {
    box.innerHTML = '<div class="empty-box">Nenhum alerta nesta visão. Clique em <strong>+ Novo alerta</strong> para criar.</div>';
    return;
  }

  box.innerHTML = linhas.map((a) => {
    const ehTesouro = a.categoria === 'tesouro';
    const valorAtual = ehTesouro
      ? (a.taxa != null ? fmtNum(a.taxa, 2) + '%' : '—')
      : (a.preco != null ? fmtBRL(a.preco) : '—');
    const alvo = ehTesouro ? fmtNum(a.valorAlvo, 2) + '%' : fmtBRL(a.valorAlvo);
    const estado = a.status === 'Pausado'
      ? '<span class="badge badge-mute">pausado</span>'
      : a.condicao === true
        ? '<span class="badge badge-neg">✔ condição atingida</span>'
        : a.condicao === false
          ? '<span class="badge badge-pos">monitorando</span>'
          : `<span class="badge badge-warn" title="${esc(a.detalhe || 'sem dados para avaliar')}">sem dados</span>`;

    return `
      <div class="alert-row">
        <label class="switch" title="${a.status === 'Ativo' ? 'Pausar' : 'Reativar'} alerta">
          <input type="checkbox" data-toggle="${esc(a.id)}" ${a.status === 'Ativo' ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
        <div class="desc">
          <div class="titulo">${esc(a.ativo)} <span class="text-muted" style="font-weight:400">— ${esc(a.tipo)} ${alvo}${a.base ? ` (${esc(a.base)})` : ''}</span></div>
          <div class="sub">
            ${ehTesouro ? 'taxa de resgate atual' : 'cotação atual'}: <strong>${valorAtual}</strong>
            · verificado ${a.verificadoEm ? tempoRelativo(a.verificadoEm) : '—'}
            ${a.obs ? ` · ${esc(a.obs)}` : ''}
          </div>
        </div>
        ${estado}
        <button class="btn-icon delete" data-remover="${esc(a.id)}" title="Excluir alerta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>`;
  }).join('');
}

// -------------------------------------------------------------- eventos -----

function ligarEventos(view) {
  view.querySelectorAll('.chip[data-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      filtroCategoria = chip.dataset.cat;
      renderAlertas(view);
    });
  });

  view.querySelector('#btn-novo-alerta').addEventListener('click', abrirFormAlerta);

  view.querySelector('#lista-alertas').addEventListener('change', (e) => {
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      alternarStatus(toggle.dataset.toggle);
      renderAlertas(view);
    }
  });
  view.querySelector('#lista-alertas').addEventListener('click', (e) => {
    const rem = e.target.closest('[data-remover]');
    if (rem && confirm('Excluir este alerta?')) {
      removerAlerta(rem.dataset.remover);
      window.showToast('Alerta excluído.', 'info');
      renderAlertas(view);
    }
  });

  view.querySelector('#btn-salvar-param-auto').addEventListener('click', () => {
    const dias = parseInt(view.querySelector('#f-vcto-dias').value, 10);
    if (Number.isFinite(dias) && dias > 0) {
      salvarPrefs({ alertaVencimentoDias: dias });
      window.showToast('Parâmetro salvo.', 'success');
      renderAlertas(view);
    }
  });

  const btnHist = view.querySelector('#btn-limpar-hist');
  if (btnHist) {
    btnHist.addEventListener('click', () => {
      if (!confirm('Limpar todo o histórico de disparos?')) return;
      limparHistorico();
      renderAlertas(view);
    });
  }

  const btnRemoto = view.querySelector('#btn-verificar-remoto');
  if (btnRemoto) {
    btnRemoto.addEventListener('click', async () => {
      btnRemoto.disabled = true;
      btnRemoto.textContent = '⏳ Executando verificarAlertas()...';
      try {
        const res = await executarAcao('verificarAlertas');
        window.showToast(res?.mensagem || 'Verificação executada no Apps Script (e-mails enviados se houver disparos).', 'success', 6000);
      } catch (err) {
        window.showToast('Falha na verificação remota: ' + err.message, 'error', 6000);
      } finally {
        btnRemoto.disabled = false;
        btnRemoto.textContent = '▶ Executar verificação por e-mail agora';
      }
    });
  }
}

// --------------------------------------------------------- novo alerta ------

function abrirFormAlerta() {
  // Sugestões de ativos: títulos da carteira (p/ alertas de taxa) e da API.
  const { posicoes } = carteiraMarcada();
  const titulosCarteira = [...new Set(posicoes.map((p) => p.titulo))].sort();
  const apiCache = obterCache();
  const titulosApi = apiCache ? [...new Set(Object.values(apiCache.bonds).map((b) => b.nome))].sort() : [];
  const titulosTesouro = [...new Set([...titulosCarteira, ...titulosApi])];

  abrirModal({
    titulo: 'Novo alerta',
    corpoHTML: `
      <form id="form-alerta">
        <div class="form-group">
          <label>Categoria</label>
          <select id="fa-categoria">
            <option value="acao">Ação / ativo da B3</option>
            <option value="tesouro">Taxa do Tesouro Direto</option>
          </select>
        </div>
        <div class="form-group">
          <label id="fa-ativo-label">Código do ativo</label>
          <input id="fa-ativo" required placeholder="Ex.: PETR4" list="fa-sugestoes" autocomplete="off">
          <datalist id="fa-sugestoes"></datalist>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de alerta</label>
            <select id="fa-tipo"></select>
          </div>
          <div class="form-group">
            <label id="fa-alvo-label">Valor-alvo (R$)</label>
            <input id="fa-alvo" type="number" step="0.01" required placeholder="0,00">
          </div>
        </div>
        <div class="form-group" id="fa-base-wrap" style="display:none">
          <label>Base da variação</label>
          <select id="fa-base">${BASES_VARIACAO.map((b) => `<option>${b}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Observação (opcional)</label>
          <input id="fa-obs" placeholder="Ex.: oportunidade de compra">
        </div>
        <button type="submit" class="btn btn-primary btn-block">Criar alerta</button>
      </form>`,
    aoMontar(modal, fechar) {
      const selCat = modal.querySelector('#fa-categoria');
      const selTipo = modal.querySelector('#fa-tipo');
      const sugestoes = modal.querySelector('#fa-sugestoes');

      function atualizarCampos() {
        const ehTesouro = selCat.value === 'tesouro';
        selTipo.innerHTML = (ehTesouro ? TIPOS_TESOURO : TIPOS_ACAO).map((t) => `<option>${t}</option>`).join('');
        modal.querySelector('#fa-ativo-label').textContent = ehTesouro ? 'Título do Tesouro' : 'Código do ativo';
        modal.querySelector('#fa-ativo').placeholder = ehTesouro ? 'Ex.: Tesouro IPCA+ 2045' : 'Ex.: PETR4';
        sugestoes.innerHTML = (ehTesouro ? titulosTesouro : []).map((t) => `<option value="${esc(t)}">`).join('');
        atualizarRotuloAlvo();
      }
      function atualizarRotuloAlvo() {
        const ehTesouro = selCat.value === 'tesouro';
        const ehVariacao = selTipo.value.startsWith('Variação');
        modal.querySelector('#fa-alvo-label').textContent =
          ehTesouro ? 'Taxa-alvo (% a.a.)' : ehVariacao ? 'Variação-alvo (%)' : 'Valor-alvo (R$)';
        modal.querySelector('#fa-base-wrap').style.display = ehVariacao ? '' : 'none';
      }
      selCat.addEventListener('change', atualizarCampos);
      selTipo.addEventListener('change', atualizarRotuloAlvo);
      atualizarCampos();

      modal.querySelector('#form-alerta').addEventListener('submit', (e) => {
        e.preventDefault();
        const ativo = modal.querySelector('#fa-ativo').value.trim();
        const alvo = parseFloat(modal.querySelector('#fa-alvo').value);
        if (!ativo) return window.showToast('Informe o ativo/título.', 'error');
        if (!Number.isFinite(alvo)) return window.showToast('Informe o valor-alvo.', 'error');
        const ehVariacao = selTipo.value.startsWith('Variação');
        adicionarAlerta({
          categoria: selCat.value,
          ativo: selCat.value === 'acao' ? ativo.toUpperCase() : ativo,
          tipo: selTipo.value,
          valorAlvo: alvo,
          base: ehVariacao ? modal.querySelector('#fa-base').value : '',
          obs: modal.querySelector('#fa-obs').value.trim(),
        });
        fechar();
        window.showToast('Alerta criado.', 'success');
        renderAlertas(document.getElementById('view'));
      });
    },
  });
}

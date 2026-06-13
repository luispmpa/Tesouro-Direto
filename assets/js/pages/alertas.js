// Módulo Alertas — preserva os 34 alertas de preço migrados da aba "Alertas"
// e adiciona alertas de taxa do Tesouro Direto, vencimento, meta PGBL e saúde
// dos dados. O painel permite ativar/pausar, criar, editar parâmetros e ver o
// histórico de disparos.
//
// Envio por E-MAIL: continua no Apps Script (verificarAlertas roda por gatilho
// na planilha e usa MailApp). Aqui é possível disparar essa verificação
// remotamente quando o endpoint está configurado.

import {
  obterAlertas, adicionarAlerta, atualizarAlerta, removerAlerta, alternarStatus,
  avaliarTudo, registrarDisparos, obterHistorico, limparHistorico,
  TIPOS_ACAO, BASES_VARIACAO,
} from '../services/alertEngine.js';
import { obterPrefs, salvarPrefs } from '../services/dataStore.js';
import { configurado, executarAcao } from '../services/sheetsBridge.js';
import { fmtBRL, fmtNum, fmtDataHoraBR, tempoRelativo, esc } from '../utils/format.js';
import { abrirModal } from '../utils/ui.js';

let filtroCategoria = 'todos';

export function renderAlertas(view, params) {
  // Deep-link "#/alertas?cat=...": já abre na categoria informada.
  const catParam = params?.get('cat');
  if (catParam && ['todos', 'acao', 'atingidos'].includes(catParam)) {
    filtroCategoria = catParam;
  }

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
      ${configurado()
        ? 'Inclusões, edições e remoções feitas aqui são <strong>gravadas na planilha do Drive</strong> automaticamente. <button class="btn btn-secondary btn-sm" id="btn-verificar-remoto" style="margin-left:8px">▶ Executar verificação por e-mail agora</button>'
        : 'As alterações ficam neste navegador. Para refleti-las na planilha do Drive, conecte o endpoint em <a href="#/dados" style="color:var(--primary)">Dados &amp; Integrações</a>.'}
    </div>

    <div class="section-title">
      <h2>Alertas configurados <span class="count-badge">${configurados.length}</span></h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div class="chip-filter">
          ${chipFiltro('todos', 'Todos')}
          ${chipFiltro('acao', 'Ações')}
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
        <span class="action-btns" style="display:inline-flex;gap:2px">
          ${!ehTesouro ? `<button class="btn-icon" data-editar="${esc(a.id)}" title="Editar alerta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>` : ''}
          <button class="btn-icon delete" data-remover="${esc(a.id)}" title="Excluir alerta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </span>
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

  view.querySelector('#btn-novo-alerta').addEventListener('click', () => abrirFormAlerta());

  view.querySelector('#lista-alertas').addEventListener('change', (e) => {
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      alternarStatus(toggle.dataset.toggle);
      renderAlertas(view);
    }
  });
  view.querySelector('#lista-alertas').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-editar]');
    if (ed) {
      abrirFormAlerta(ed.dataset.editar);
      return;
    }
    const rem = e.target.closest('[data-remover]');
    if (rem && confirm('Excluir este alerta?')) {
      removerAlerta(rem.dataset.remover);
      window.showToast(configurado() ? 'Alerta excluído (refletido na planilha).' : 'Alerta excluído.', 'info');
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

// --------------------------------------------------- novo / editar alerta ---

function abrirFormAlerta(id = null) {
  const alerta = id ? obterAlertas().find((a) => a.id === id) : null;
  const ehVariacaoInicial = (alerta?.tipo || '').startsWith('Variação');

  abrirModal({
    titulo: alerta ? 'Editar alerta' : 'Novo alerta',
    corpoHTML: `
      <form id="form-alerta">
        <div class="form-group">
          <label>Código do ativo (ação / ativo da B3)</label>
          <input id="fa-ativo" required placeholder="Ex.: PETR4" autocomplete="off" value="${esc(alerta?.ativo || '')}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de alerta</label>
            <select id="fa-tipo">${TIPOS_ACAO.map((t) => `<option ${alerta?.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label id="fa-alvo-label">${ehVariacaoInicial ? 'Variação-alvo (%)' : 'Valor-alvo (R$)'}</label>
            <input id="fa-alvo" type="number" step="0.01" required placeholder="0,00" value="${alerta?.valorAlvo ?? ''}">
          </div>
        </div>
        <div class="form-group" id="fa-base-wrap" style="display:${ehVariacaoInicial ? '' : 'none'}">
          <label>Base da variação</label>
          <select id="fa-base">${BASES_VARIACAO.map((b) => `<option ${alerta?.base === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Observação (opcional)</label>
          <input id="fa-obs" placeholder="Ex.: oportunidade de compra" value="${esc(alerta?.obs || '')}">
        </div>
        <button type="submit" class="btn btn-primary btn-block">${alerta ? 'Salvar alterações' : 'Criar alerta'}</button>
      </form>`,
    aoMontar(modal, fechar) {
      const selTipo = modal.querySelector('#fa-tipo');

      function atualizarRotuloAlvo() {
        const ehVariacao = selTipo.value.startsWith('Variação');
        modal.querySelector('#fa-alvo-label').textContent = ehVariacao ? 'Variação-alvo (%)' : 'Valor-alvo (R$)';
        modal.querySelector('#fa-base-wrap').style.display = ehVariacao ? '' : 'none';
      }
      selTipo.addEventListener('change', atualizarRotuloAlvo);

      modal.querySelector('#form-alerta').addEventListener('submit', (e) => {
        e.preventDefault();
        const ativo = modal.querySelector('#fa-ativo').value.trim();
        const alvo = parseFloat(modal.querySelector('#fa-alvo').value);
        if (!ativo) return window.showToast('Informe o código do ativo.', 'error');
        if (!Number.isFinite(alvo)) return window.showToast('Informe o valor-alvo.', 'error');
        const ehVariacao = selTipo.value.startsWith('Variação');
        const dados = {
          categoria: 'acao',
          ativo: ativo.toUpperCase(),
          tipo: selTipo.value,
          valorAlvo: alvo,
          base: ehVariacao ? modal.querySelector('#fa-base').value : '',
          obs: modal.querySelector('#fa-obs').value.trim(),
        };
        if (alerta) atualizarAlerta(alerta.id, dados);
        else adicionarAlerta(dados);
        fechar();
        const sufixo = configurado() ? ' (refletido na planilha)' : '';
        window.showToast((alerta ? 'Alerta atualizado.' : 'Alerta criado.') + sufixo, 'success');
        renderAlertas(document.getElementById('view'));
      });
    },
  });
}

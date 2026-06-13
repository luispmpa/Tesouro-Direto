// Módulo Dados & Integrações — área técnica/administrativa do painel:
// status das fontes, configuração do endpoint do Apps Script, premissas de
// cálculo, ações manuais (atualizar/sincronizar/executar robôs), logs locais
// e remotos, e backup completo de todos os dados do navegador.
//
// Segurança: a URL e o token do Web App ficam SOMENTE no localStorage do
// usuário — nada de credencial no repositório público (GitHub Pages).

import { statusFontes, obterPrefs, salvarPrefs } from '../services/dataStore.js';
import {
  obterConfig, salvarConfig, configurado, diagnosticar, sincronizar,
  executarAcao, obterCacheBridge,
} from '../services/sheetsBridge.js';
import { obterCache, obterHistoricoTaxas } from '../services/tesouroApi.js';
import { obterLogs, limparLogs, logOk, logErro } from '../services/logger.js';
import { load, save, KEYS } from '../services/storage.js';
import { fmtDataHoraBR, tempoRelativo, fmtNum, esc } from '../utils/format.js';

let filtroLog = 'todos';

export function renderDados(view) {
  const fontes = statusFontes();
  const cfg = obterConfig();
  const prefs = obterPrefs();
  const apiCache = obterCache();
  const bridge = obterCacheBridge();
  const hist = obterHistoricoTaxas();
  const logs = obterLogs();
  const erros = logs.filter((l) => l.status === 'erro');

  view.innerHTML = `
    <section class="grid grid-kpi">
      ${statusCard('Preços do Tesouro (manuais)', Boolean(apiCache),
        apiCache ? `atualizados ${tempoRelativo(apiCache.fetchedAt)}` : 'ainda não informados',
        apiCache ? `${Object.keys(apiCache.bonds).length} título(s) com PU/taxa de resgate` : 'informe em Tesouro Direto › Atualizar preços')}
      ${statusCard('Apps Script (planilha)', configurado() && Boolean(bridge),
        configurado() ? (bridge ? `sincronizado ${tempoRelativo(bridge.fetchedAt)}` : 'configurado, sem sincronização') : 'não configurado',
        'Gmail PGBL · alertas por e-mail · IBOV ao vivo')}
      ${statusCard('Histórico de taxas TD', hist.length >= 2,
        hist.length ? `${hist.length} dia(s) de amostras` : 'ainda vazio',
        'uma amostra por dia a cada atualização manual')}
      ${statusCard('Erros recentes', erros.length === 0,
        erros.length ? `${erros.length} erro(s) no log` : 'nenhum erro registrado',
        erros.length ? esc((erros[0].mensagem || '').slice(0, 60)) : 'tudo operando normalmente', !erros.length)}
    </section>

    <div class="section-title"><h2>Última atualização por módulo</h2></div>
    <div class="card" style="padding:10px 16px">
      ${linhaStatus('Preços e taxas do Tesouro', Boolean(apiCache), apiCache?.fetchedAt, 'atualização manual em Tesouro Direto (digitada ou importada)')}
      ${linhaStatus('Planilha (IBOV, PGBL, alertas, logs)', Boolean(bridge), bridge?.fetchedAt, configurado() ? 'via Web App do Apps Script' : 'endpoint não configurado')}
      ${linhaStatus('Cotações IBOV', fontes.ibov.fonte !== 'seed', fontes.ibov.atualizadoEm, fontes.ibov.fonte === 'seed' ? 'snapshot estático da auditoria (26/05/2026)' : 'GOOGLEFINANCE na planilha')}
    </div>

    <div class="section-title"><h2>Sincronização e robôs da planilha</h2></div>
    <div class="card">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" id="btn-sync-agora" ${configurado() ? '' : 'disabled title="Configure o endpoint abaixo"'}>⟳ Sincronizar planilha agora</button>
        <button class="btn btn-secondary btn-sm" data-acao="importarAportesPGBL" ${configurado() ? '' : 'disabled'}>▶ importarAportesPGBL()</button>
        <button class="btn btn-secondary btn-sm" data-acao="verificarAlertas" ${configurado() ? '' : 'disabled'}>▶ verificarAlertas()</button>
      </div>
      <p class="text-muted mt">As funções ▶ executam no Apps Script da planilha (Gmail, e-mail e GOOGLEFINANCE
        exigem o ambiente Google). Os gatilhos automáticos continuam valendo — estes botões só antecipam a execução.
        Os preços do Tesouro são atualizados manualmente na página <a href="#/tesouro" style="color:var(--primary)">Tesouro Direto</a>.</p>
    </div>

    <div class="section-title"><h2>Conexão com o Apps Script (Web App)</h2></div>
    <div class="card">
      <div class="form-row">
        <div class="form-group">
          <label>URL do Web App (termina em /exec)</label>
          <input id="f-bridge-url" placeholder="https://script.google.com/macros/s/.../exec" value="${esc(cfg.url)}">
        </div>
        <div class="form-group">
          <label>Token de acesso (o mesmo salvo em Script Properties)</label>
          <input id="f-bridge-token" type="password" placeholder="opcional, mas recomendado" value="${esc(cfg.token)}">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" id="btn-salvar-bridge">Salvar conexão</button>
        <button class="btn btn-secondary btn-sm" id="btn-diagnostico" ${cfg.url ? '' : 'disabled'}>🩺 Diagnóstico de conexão</button>
        <span id="diag-result" class="text-muted" style="align-self:center;font-size:12px"></span>
      </div>
      <p class="text-muted mt">A URL e o token ficam <strong>apenas neste navegador</strong> (localStorage) — nunca no
        repositório público. Passo a passo de publicação em <code>docs/IMPLANTACAO.md</code> (código em <code>apps-script/Code.gs</code>).</p>
    </div>

    <div class="section-title"><h2>Premissas de cálculo</h2><span class="hint">usadas só nas projeções "manter até o vencimento"</span></div>
    <div class="card">
      <div class="inline-form">
        <div class="form-group">
          <label>IPCA projetado (% a.a.)</label>
          <input type="number" step="0.1" id="f-ipca" value="${prefs.ipcaProjetado ?? 4.5}">
        </div>
        <div class="form-group">
          <label>Selic projetada (% a.a.)</label>
          <input type="number" step="0.1" id="f-selic" value="${prefs.selicProjetada ?? 12}">
        </div>
        <button class="btn btn-primary btn-sm" id="btn-salvar-premissas">Salvar premissas</button>
      </div>
      <p class="notice mt">
        <strong>De onde vêm esses valores?</strong> São <strong>premissas suas</strong>, não dados de fonte
        automática. Os padrões (IPCA <strong>4,5% a.a.</strong> e Selic <strong>12% a.a.</strong>) são apenas
        estimativas iniciais — ajuste para a sua expectativa de inflação e juros futuros.
      </p>
      <p class="text-muted mt">
        Eles entram <strong>somente</strong> na projeção "manter até o vencimento" de IPCA+/Renda+/Educa+ (usa o IPCA)
        e de Selic (usa a Selic). <strong>Não afetam</strong> a marcação a mercado atual, que usa o PU de resgate
        informado por você. Metodologia completa em <code>docs/MARCACAO-A-MERCADO.md</code>.</p>
    </div>

    <div class="section-title">
      <h2>Histórico de execuções (logs) <span class="count-badge">${logs.length}</span></h2>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="chip-filter">
          ${chip('todos', 'Todos')}${chip('erro', 'Erros')}${chip('ok', 'Sucesso')}${chip('info', 'Info')}
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-limpar-logs">Limpar</button>
      </div>
    </div>
    <div class="card" style="padding:10px 16px" id="box-logs"></div>

    ${bridge?.data?.logs?.length ? `
      <div class="section-title"><h2>Logs do Apps Script (planilha)</h2><span class="hint">aba "Logs" — importação Gmail, alertas, taxas</span></div>
      <div class="card" style="padding:10px 16px">
        <div class="log-list">
          ${bridge.data.logs.slice(0, 40).map((l) => `
            <div class="log-row ${esc(l.status || '')}">
              <span class="ts">${esc(l.quando || '')}</span>
              <span class="origem">${esc(l.origem || 'script')}</span>
              <span>${esc(l.mensagem || '')}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}

    <div class="section-title"><h2>Backup completo</h2></div>
    <div class="card">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" id="btn-backup-all">⬇ Exportar todos os dados (JSON)</button>
        <button class="btn btn-secondary btn-sm" id="btn-restore-all">⬆ Importar backup completo</button>
        <input type="file" id="restore-file" accept="application/json,.json" hidden>
      </div>
      <p class="text-muted mt">Inclui carteira, preços manuais, alertas, PGBL local, premissas, logs e a configuração
        da conexão. Os dados vivem apenas neste navegador — exporte periodicamente.</p>
    </div>`;

  montarLogs(view, logs);
  ligarEventos(view);
}

// ------------------------------------------------------------- helpers -----

function statusCard(titulo, ok, linha1, linha2, neutroOk = false) {
  const cor = ok ? 'pos' : neutroOk ? 'neutro' : 'neg';
  return `<div class="card kpi"><h3>${titulo}</h3>
    <p class="valor ${cor}" style="font-size:16px;display:flex;align-items:center;gap:8px">
      <span class="dot ${ok ? 'dot-pos' : 'dot-warn'}"></span>${ok ? 'Operacional' : 'Atenção'}</p>
    <span class="sub">${linha1}<br>${linha2}</span></div>`;
}

function linhaStatus(nome, ok, ts, detalhe) {
  return `<div class="status-row">
    <span class="dot ${ok ? 'dot-pos' : 'dot-mute'}"></span>
    <span><strong>${nome}</strong><br><small class="text-muted">${detalhe}</small></span>
    <span class="meta">${ts ? fmtDataHoraBR(new Date(ts)) : 'nunca'}</span>
  </div>`;
}

const chip = (id, rotulo) => `<button class="chip ${filtroLog === id ? 'active' : ''}" data-log="${id}">${rotulo}</button>`;

function montarLogs(view, logs) {
  const box = view.querySelector('#box-logs');
  const linhas = filtroLog === 'todos' ? logs : logs.filter((l) => l.status === filtroLog);
  box.innerHTML = linhas.length
    ? `<div class="log-list">${linhas.slice(0, 80).map((l) => `
        <div class="log-row ${esc(l.status)}">
          <span class="ts">${fmtDataHoraBR(new Date(l.ts))}</span>
          <span class="origem">${esc(l.origem)}</span>
          <span>${esc(l.mensagem)}</span>
        </div>`).join('')}</div>`
    : '<div class="empty-box">Nenhum registro nesta visão.</div>';
}

// -------------------------------------------------------------- eventos ----

function ligarEventos(view) {
  view.querySelectorAll('.chip[data-log]').forEach((c) => {
    c.addEventListener('click', () => {
      filtroLog = c.dataset.log;
      renderDados(view);
    });
  });

  const btnSync = view.querySelector('#btn-sync-agora');
  if (btnSync && configurado()) {
    btnSync.addEventListener('click', async () => {
      btnSync.disabled = true;
      try {
        await sincronizar('all');
        window.showToast('Planilha sincronizada.', 'success');
      } catch (err) {
        window.showToast('Falha na sincronização: ' + err.message, 'error', 6000);
      }
      renderDados(view);
    });
  }

  view.querySelectorAll('[data-acao]').forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener('click', async () => {
      const acao = btn.dataset.acao;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = `⏳ ${acao}()...`;
      try {
        const res = await executarAcao(acao);
        window.showToast(res?.mensagem || `${acao} executada no Apps Script.`, 'success', 6000);
        await sincronizar('all').catch(() => {});
      } catch (err) {
        window.showToast(`Falha em ${acao}: ${err.message}`, 'error', 6000);
      }
      btn.disabled = false;
      btn.textContent = original;
      renderDados(view);
    });
  });

  view.querySelector('#btn-salvar-bridge').addEventListener('click', () => {
    const url = view.querySelector('#f-bridge-url').value.trim();
    const token = view.querySelector('#f-bridge-token').value.trim();
    if (url && !/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) {
      return window.showToast('A URL deve ser a do Web App publicado (https://script.google.com/...).', 'error', 6000);
    }
    salvarConfig(url, token);
    logOk('sheets-bridge', url ? 'Conexão com o Apps Script configurada.' : 'Conexão com o Apps Script removida.');
    window.showToast(url ? 'Conexão salva (somente neste navegador).' : 'Conexão removida.', 'success');
    renderDados(view);
  });

  const btnDiag = view.querySelector('#btn-diagnostico');
  if (btnDiag && !btnDiag.disabled) {
    btnDiag.addEventListener('click', async () => {
      const out = view.querySelector('#diag-result');
      btnDiag.disabled = true;
      out.textContent = 'testando conexão...';
      try {
        const diag = await diagnosticar();
        out.innerHTML = `<span class="pos">✓ conectado</span> · latência ${diag.latenciaMs} ms` +
          (diag.resposta?.versao ? ` · Code.gs v${esc(String(diag.resposta.versao))}` : '');
      } catch (err) {
        out.innerHTML = `<span class="neg">✗ ${esc(err.message)}</span>`;
        logErro('sheets-bridge', 'Diagnóstico falhou: ' + err.message);
      }
      btnDiag.disabled = false;
    });
  }

  view.querySelector('#btn-salvar-premissas').addEventListener('click', () => {
    const ipca = parseFloat(view.querySelector('#f-ipca').value);
    const selic = parseFloat(view.querySelector('#f-selic').value);
    salvarPrefs({
      ipcaProjetado: Number.isFinite(ipca) ? ipca : 4.5,
      selicProjetada: Number.isFinite(selic) ? selic : 12,
    });
    window.showToast(`Premissas salvas: IPCA ${fmtNum(ipca, 1)}% · Selic ${fmtNum(selic, 1)}% a.a.`, 'success');
  });

  view.querySelector('#btn-limpar-logs').addEventListener('click', () => {
    if (!confirm('Limpar todos os logs locais?')) return;
    limparLogs();
    renderDados(view);
  });

  // ------------------------------------------------------ backup completo --
  view.querySelector('#btn-backup-all').addEventListener('click', () => {
    const dump = { versao: 2, tipo: 'backup-completo', exportadoEm: new Date().toISOString(), dados: {} };
    Object.values(KEYS).forEach((k) => {
      const v = load(k, undefined);
      if (v !== undefined && v !== null) dump.dados[k] = v;
    });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `painel-financeiro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    logOk('sistema', 'Backup completo exportado.');
    window.showToast('Backup completo exportado.', 'success');
  });

  const restoreFile = view.querySelector('#restore-file');
  view.querySelector('#btn-restore-all').addEventListener('click', () => restoreFile.click());
  restoreFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dump = JSON.parse(evt.target.result);
        if (!dump || dump.tipo !== 'backup-completo' || typeof dump.dados !== 'object') {
          throw new Error('não é um backup completo deste painel');
        }
        if (!confirm(`Restaurar backup de ${fmtDataHoraBR(new Date(dump.exportadoEm))}? Os dados atuais deste navegador serão substituídos.`)) return;
        Object.entries(dump.dados).forEach(([k, v]) => save(k, v));
        logOk('sistema', 'Backup completo restaurado.');
        window.showToast('Backup restaurado. Recarregando…', 'success');
        setTimeout(() => location.reload(), 800);
      } catch (err) {
        window.showToast('Arquivo inválido: ' + err.message, 'error', 6000);
      } finally {
        restoreFile.value = '';
      }
    };
    reader.readAsText(file);
  });
}

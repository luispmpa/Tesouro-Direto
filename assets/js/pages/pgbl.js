// Módulo Previdência PGBL — migra a aba "PGBL" da planilha: painel do ano
// vigente, controle do limite de 12% para dedução no IR, metas por ano,
// matriz de aportes mensais e projeções.
//
// IMPORTANTE (privacidade): renda tributável e valores de aporte são dados
// sensíveis e NUNCA são versionados no repositório público. Eles vivem em
// duas origens: (1) o endpoint do Apps Script (a planilha continua sendo a
// base, alimentada pelo Gmail via importarAportesPGBL) e (2) preenchimento
// manual salvo apenas no localStorage do navegador do usuário.

import { obterPGBL, salvarPGBLLocal, totalAportadoAno } from '../services/dataStore.js';
import { configurado, executarAcao, sincronizar } from '../services/sheetsBridge.js';
import { calcularPainelPGBL } from '../utils/finance.js';
import { fmtBRL, fmtNum, fmtPct, esc, tempoRelativo } from '../utils/format.js';
import { graficoBarras, graficoLinha } from '../utils/ui.js';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

let anoSelecionado = new Date().getFullYear();

export function renderPgbl(view) {
  const pgbl = obterPGBL();
  const anos = anosDisponiveis(pgbl);
  if (!anos.includes(anoSelecionado)) anoSelecionado = anos[0];

  const cfg = pgbl.anos?.[String(anoSelecionado)] || {};
  const aportado = totalAportadoAno(pgbl, anoSelecionado);
  const painel = calcularPainelPGBL({
    rendaTributavel: Number(cfg.renda) || 0,
    aliquota: Number(cfg.aliquota) || 27.5,
    metaManual: Number(cfg.metaManual) || null,
    totalAportado: aportado,
  });

  const temDados = (Number(cfg.renda) || 0) > 0 || aportado > 0;

  view.innerHTML = `
    ${pgbl.fonte === 'planilha'
      ? `<div class="notice" style="margin-bottom:16px">Dados sincronizados da planilha ${pgbl.sincronizadoEm ? tempoRelativo(pgbl.sincronizadoEm) : ''}.
          ${pgbl.fundo ? `Fundo: <strong>${esc(pgbl.fundo)}</strong>.` : ''}
          A importação automática dos aportes via Gmail (e-mails da XP) segue rodando no Apps Script.</div>`
      : `<div class="notice warn" style="margin-bottom:16px">
          Sem conexão com a planilha — os dados abaixo são locais (apenas neste navegador).
          Para sincronizar os aportes importados do Gmail pelo Apps Script, configure o endpoint em
          <a href="#/dados" style="color:var(--primary)">Dados &amp; Integrações</a>.</div>`}

    <div class="section-title">
      <h2>Painel — ano ${anoSelecionado}</h2>
      <div class="chip-filter">
        ${anos.map((a) => `<button class="chip ${a === anoSelecionado ? 'active' : ''}" data-ano="${a}">${a}</button>`).join('')}
        <button class="chip" id="btn-add-ano">+ ano</button>
      </div>
    </div>

    <section class="grid grid-kpi">
      ${kpi('Renda tributável estimada', fmtBRL(Number(cfg.renda) || 0), `alíquota marginal ${fmtNum(Number(cfg.aliquota) || 27.5, 1)}%`)}
      ${kpi('Limite de dedução (12%)', fmtBRL(painel.limite12), 'PGBL no modelo completo do IR')}
      ${kpi('Meta de aporte anual', fmtBRL(painel.meta), cfg.metaManual > 0 ? 'meta definida manualmente' : 'meta = limite de 12%')}
      ${kpi('Total aportado no ano', fmtBRL(aportado), `<span class="badge ${painel.pctMeta >= 100 ? 'badge-pos' : 'badge-warn'}">${fmtPct(painel.pctMeta, 1)} da meta</span>`)}
      ${kpi('Falta para a meta', fmtBRL(painel.falta), painel.falta <= 0 ? '<span class="badge badge-pos">meta atingida ✓</span>' : '')}
      ${kpi('Economia de IR', `${fmtBRL(painel.economiaGarantida)}`, `garantida · máxima ${fmtBRL(painel.economiaMaxima)}`)}
    </section>

    <div class="section-title">
      <h2>Aportes mensais (R$)</h2>
      <span class="hint">${pgbl.fonte === 'planilha' ? 'preenchidos automaticamente pelo Gmail (Apps Script)' : 'edite as células abaixo'}</span>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr><th style="text-align:left">Ano</th>${MESES.map((m) => `<th>${m}</th>`).join('')}<th>Total</th></tr></thead>
          <tbody id="matriz-aportes"></tbody>
        </table>
      </div>
    </div>

    <section class="grid grid-2 mt-lg">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Aportes × meta mensal média (${anoSelecionado})</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-aportes"></canvas></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Projeção acumulada com rentabilidade estimada</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-projecao"></canvas></div>
        <div class="inline-form mt">
          <div class="form-group">
            <label>Rentabilidade estimada (% a.a.)</label>
            <input type="number" step="0.1" id="f-rent-proj" value="${Number(cfg.rentProjetada) || 9}">
          </div>
          <div class="form-group">
            <label>Horizonte (anos)</label>
            <input type="number" step="1" id="f-horizonte" value="${Number(cfg.horizonte) || 10}">
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reprojetar">Recalcular</button>
        </div>
      </div>
    </section>

    <div class="section-title"><h2>Parâmetros do ano ${anoSelecionado}</h2></div>
    <div class="card">
      <div class="inline-form">
        <div class="form-group">
          <label>Renda tributável estimada (R$)</label>
          <input type="number" step="0.01" id="f-renda" value="${Number(cfg.renda) || ''}" placeholder="0,00" ${pgbl.fonte === 'planilha' ? 'title="Sincronizado da planilha — alterações locais valem até a próxima sincronização"' : ''}>
        </div>
        <div class="form-group">
          <label>Alíquota marginal de IR (%)</label>
          <input type="number" step="0.5" id="f-aliquota" value="${Number(cfg.aliquota) || 27.5}">
        </div>
        <div class="form-group">
          <label>Meta anual manual (R$ — vazio usa o limite de 12%)</label>
          <input type="number" step="0.01" id="f-meta" value="${Number(cfg.metaManual) || ''}" placeholder="automática (12%)">
        </div>
        <button class="btn btn-primary btn-sm" id="btn-salvar-params">Salvar parâmetros</button>
      </div>
      <p class="text-muted mt">VGBL não é dedutível: apenas PGBL entra no limite de 12%, e somente na declaração pelo modelo completo (regra preservada da planilha).</p>
    </div>

    <div class="section-title"><h2>Importação automática via Gmail</h2></div>
    <div class="card">
      <p class="text-muted" style="margin-bottom:12px">
        O Apps Script busca e-mails da XP no Gmail, extrai "Data para débito mensal" e "Valor solicitado"
        e lança o valor no mês correspondente da planilha. O marcador <em>PGBL-Importado</em> identifica os
        e-mails processados; a deduplicação usa o ID interno da mensagem. Tudo isso permanece no Apps Script
        (ambiente seguro com acesso ao Gmail) — o painel apenas consome o resultado.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" id="btn-importar-agora" ${configurado() ? '' : 'disabled title="Configure o endpoint em Dados & Integrações"'}>
          ▶ Importar aportes agora (via Apps Script)</button>
        <button class="btn btn-secondary btn-sm" id="btn-sync-pgbl" ${configurado() ? '' : 'disabled'}>⟳ Sincronizar com a planilha</button>
      </div>
      <div class="mt" id="pgbl-import-log">
        ${(pgbl.importLog || []).length
          ? `<h3 style="font-size:12px;color:var(--text-3);margin-bottom:8px">HISTÓRICO DE IMPORTAÇÕES</h3>
             <div class="log-list">${pgbl.importLog.slice(0, 20).map((l) => `
               <div class="log-row"><span class="ts">${esc(l.data || '')}</span><span class="origem">gmail</span><span>${esc(l.mensagem || l)}</span></div>`).join('')}</div>`
          : '<p class="text-muted">Nenhum histórico de importação sincronizado ainda.</p>'}
      </div>
    </div>`;

  montarMatriz(view, pgbl);
  montarGraficos(view, pgbl, painel, cfg);
  ligarEventos(view, pgbl, cfg);

  if (!temDados && pgbl.fonte !== 'planilha') {
    // dica única de primeiros passos
    const dica = document.createElement('div');
    dica.className = 'notice mt';
    dica.innerHTML = 'Comece preenchendo a <strong>renda tributável estimada</strong> e os aportes mensais — o painel calcula o limite de 12%, a meta e a economia de IR automaticamente (mesma lógica da planilha).';
    view.appendChild(dica);
  }
}

const kpi = (t, v, sub = '') => `<div class="card kpi"><h3>${t}</h3><p class="valor">${v}</p><span class="sub">${sub}</span></div>`;

function anosDisponiveis(pgbl) {
  const set = new Set(Object.keys(pgbl.anos || {}).map(Number).filter(Boolean));
  set.add(new Date().getFullYear());
  return [...set].sort((a, b) => b - a);
}

function montarMatriz(view, pgbl) {
  const tbody = view.querySelector('#matriz-aportes');
  const anos = anosDisponiveis(pgbl);
  const editavel = pgbl.fonte !== 'planilha';

  tbody.innerHTML = anos.sort((a, b) => a - b).map((ano) => {
    const meses = pgbl.anos?.[String(ano)]?.meses || {};
    const total = totalAportadoAno(pgbl, ano);
    return `<tr>
      <td style="text-align:left"><strong>${ano}</strong></td>
      ${MESES.map((_, i) => {
        const v = Number(meses[i + 1]) || 0;
        return editavel
          ? `<td><input type="number" step="0.01" class="aporte-cell" data-ano="${ano}" data-mes="${i + 1}" value="${v || ''}" placeholder="—" style="min-width:74px;padding:5px 7px;font-size:12px;text-align:right"></td>`
          : `<td>${v ? fmtNum(v, 2) : '<span class="text-muted">—</span>'}</td>`;
      }).join('')}
      <td><strong>${fmtBRL(total)}</strong></td>
    </tr>`;
  }).join('');

  if (editavel) {
    tbody.querySelectorAll('.aporte-cell').forEach((input) => {
      input.addEventListener('change', () => {
        const dados = obterPGBL();
        const ano = input.dataset.ano;
        const mes = input.dataset.mes;
        if (!dados.anos[ano]) dados.anos[ano] = { meses: {} };
        if (!dados.anos[ano].meses) dados.anos[ano].meses = {};
        const v = parseFloat(input.value);
        if (Number.isFinite(v) && v > 0) dados.anos[ano].meses[mes] = v;
        else delete dados.anos[ano].meses[mes];
        salvarPGBLLocal(dados);
        renderPgbl(document.getElementById('view'));
      });
    });
  }
}

function montarGraficos(view, pgbl, painel, cfg) {
  const meses = pgbl.anos?.[String(anoSelecionado)]?.meses || {};
  const valores = MESES.map((_, i) => Number(meses[i + 1]) || 0);
  const metaMensal = painel.meta > 0 ? painel.meta / 12 : 0;

  graficoBarras(view.querySelector('#ch-aportes'), MESES,
    [
      { label: 'Aportado', data: valores.map(r2), cor: '#38BDF8' },
      ...(metaMensal > 0 ? [{ label: 'Meta mensal média', data: MESES.map(() => r2(metaMensal)), cor: 'rgba(251,191,36,.45)' }] : []),
    ],
    { formatador: fmtBRL });

  // Projeção: aporte anual = meta (ou aportado, o que for maior), capitalizado.
  const rent = (Number(cfg.rentProjetada) || 9) / 100;
  const horizonte = Math.min(40, Math.max(1, Number(cfg.horizonte) || 10));
  const aporteAnual = Math.max(painel.meta, totalAportadoAno(pgbl, anoSelecionado));
  let saldo = 0;
  const labels = [];
  const serie = [];
  for (let i = 1; i <= horizonte; i++) {
    saldo = (saldo + aporteAnual) * (1 + rent);
    labels.push(String(anoSelecionado + i));
    serie.push(r2(saldo));
  }
  graficoLinha(view.querySelector('#ch-projecao'), labels,
    [{ label: `Saldo projetado (${fmtNum(rent * 100, 1)}% a.a.)`, data: serie, cor: '#34D399' }],
    { formatador: fmtBRL });
}

function ligarEventos(view, pgbl, cfg) {
  view.querySelectorAll('.chip[data-ano]').forEach((chip) => {
    chip.addEventListener('click', () => {
      anoSelecionado = Number(chip.dataset.ano);
      renderPgbl(view);
    });
  });

  view.querySelector('#btn-add-ano').addEventListener('click', () => {
    const ano = prompt('Adicionar qual ano?', String(new Date().getFullYear() + 1));
    const n = Number(ano);
    if (!n || n < 2000 || n > 2100) return;
    const dados = obterPGBL();
    if (!dados.anos[String(n)]) dados.anos[String(n)] = { aliquota: 27.5, meses: {} };
    salvarPGBLLocal(dados);
    anoSelecionado = n;
    renderPgbl(view);
  });

  view.querySelector('#btn-salvar-params').addEventListener('click', () => {
    const dados = obterPGBL();
    const ano = String(anoSelecionado);
    if (!dados.anos[ano]) dados.anos[ano] = { meses: {} };
    dados.anos[ano].renda = parseFloat(view.querySelector('#f-renda').value) || 0;
    dados.anos[ano].aliquota = parseFloat(view.querySelector('#f-aliquota').value) || 27.5;
    const meta = parseFloat(view.querySelector('#f-meta').value);
    dados.anos[ano].metaManual = Number.isFinite(meta) && meta > 0 ? meta : null;
    salvarPGBLLocal(dados);
    window.showToast('Parâmetros salvos (somente neste navegador).', 'success');
    renderPgbl(view);
  });

  view.querySelector('#btn-reprojetar').addEventListener('click', () => {
    const dados = obterPGBL();
    const ano = String(anoSelecionado);
    if (!dados.anos[ano]) dados.anos[ano] = { meses: {} };
    dados.anos[ano].rentProjetada = parseFloat(view.querySelector('#f-rent-proj').value) || 9;
    dados.anos[ano].horizonte = parseInt(view.querySelector('#f-horizonte').value, 10) || 10;
    salvarPGBLLocal(dados);
    renderPgbl(view);
  });

  const btnImportar = view.querySelector('#btn-importar-agora');
  if (btnImportar && configurado()) {
    btnImportar.addEventListener('click', async () => {
      btnImportar.disabled = true;
      btnImportar.textContent = '⏳ Executando importarAportesPGBL()...';
      try {
        const res = await executarAcao('importarAportesPGBL');
        window.showToast(res?.mensagem || 'Importação executada no Apps Script.', 'success', 6000);
        await sincronizar('all');
        renderPgbl(view);
      } catch (err) {
        window.showToast('Falha ao executar a importação: ' + err.message, 'error', 6000);
        btnImportar.disabled = false;
        btnImportar.textContent = '▶ Importar aportes agora (via Apps Script)';
      }
    });
  }

  const btnSync = view.querySelector('#btn-sync-pgbl');
  if (btnSync && configurado()) {
    btnSync.addEventListener('click', async () => {
      btnSync.disabled = true;
      try {
        await sincronizar('all');
        window.showToast('Planilha sincronizada.', 'success');
        renderPgbl(view);
      } catch (err) {
        window.showToast('Falha na sincronização: ' + err.message, 'error');
        btnSync.disabled = false;
      }
    });
  }
}

const r2 = (v) => Math.round(v * 100) / 100;

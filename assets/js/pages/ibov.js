// Módulo IBOV / Ações — migra a aba "IBOV" da planilha: carteira teórica do
// índice com variações (dia, semana, mês, 6m, 12m) e cotação.
//
// As variações na planilha são calculadas por GOOGLEFINANCE, função exclusiva
// do Google Sheets. Por isso a planilha continua sendo a fonte "ao vivo":
// quando o endpoint do Apps Script está configurado, os dados chegam
// atualizados daqui; sem endpoint, é exibido o snapshot migrado na auditoria.

import { obterIbov } from '../services/dataStore.js';
import { fmtNum, fmtPct, tempoRelativo, esc, classeSinal, sinal } from '../utils/format.js';
import { tabelaOrdenavel, graficoBarras } from '../utils/ui.js';

let busca = '';

export function renderIbov(view) {
  const { ativos, fonte, atualizadoEm, snapshotLabel } = obterIbov();

  const validos = ativos.filter((a) => Number.isFinite(a.cotacao));
  const mediaDia = media(validos.map((a) => a.varDia));
  const altas = validos.filter((a) => (a.varDia ?? 0) > 0).length;
  const baixas = validos.filter((a) => (a.varDia ?? 0) < 0).length;

  const topAltas = [...validos].filter((a) => a.varDia != null).sort((x, y) => y.varDia - x.varDia).slice(0, 8);
  const topBaixas = [...validos].filter((a) => a.varDia != null).sort((x, y) => x.varDia - y.varDia).slice(0, 8);

  view.innerHTML = `
    ${fonte === 'seed' ? `
      <div class="notice warn" style="margin-bottom:16px">
        Exibindo <strong>${esc(snapshotLabel || 'snapshot da planilha')}</strong> (dados estáticos migrados na auditoria).
        Para cotações ao vivo via GOOGLEFINANCE, conecte o endpoint do Apps Script em
        <a href="#/dados" style="color:var(--primary)">Dados &amp; Integrações</a>.
      </div>` : ''}

    <section class="grid grid-kpi">
      <div class="card kpi"><h3>Ativos acompanhados</h3><p class="valor">${ativos.length}</p>
        <span class="sub">carteira teórica do IBOV</span></div>
      <div class="card kpi"><h3>Variação média (dia)</h3>
        <p class="valor ${classeSinal(mediaDia)}">${mediaDia != null ? fmtPct(mediaDia * 100, 2, true) : '—'}</p>
        <span class="sub">média simples dos ativos</span></div>
      <div class="card kpi"><h3>Altas × baixas (dia)</h3>
        <p class="valor"><span class="pos">${altas}</span> <span class="neutro">×</span> <span class="neg">${baixas}</span></p>
        <span class="sub">ativos em alta × em queda</span></div>
      <div class="card kpi"><h3>Fonte dos dados</h3>
        <p class="valor" style="font-size:16px">${fonte === 'planilha' ? 'Planilha (ao vivo)' : fonte === 'cache' ? 'Cache local' : 'Snapshot 26/05/2026'}</p>
        <span class="sub">${atualizadoEm ? 'sincronizado ' + tempoRelativo(atualizadoEm) : 'GOOGLEFINANCE roda na planilha'}</span></div>
    </section>

    <div class="section-title"><h2>Maiores variações do dia</h2></div>
    <section class="grid grid-2">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px" class="pos">Top altas</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-altas"></canvas></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px" class="neg">Top baixas</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-baixas"></canvas></div>
      </div>
    </section>

    <div class="section-title">
      <h2>Carteira teórica <span class="count-badge" id="ibov-count"></span></h2>
      <input id="ibov-busca" placeholder="Filtrar por código ou nome…" style="max-width:240px" value="${esc(busca)}">
    </div>
    <div class="card" style="padding:0" id="tabela-ibov"></div>
    <p class="text-muted mt">Variações calculadas por GOOGLEFINANCE na planilha (diária vs. último pregão; semanal 7 dias corridos; mensal/6m/12m por EDATE). Part. (%) conforme carteira teórica da B3.</p>`;

  graficoBarras(view.querySelector('#ch-altas'), topAltas.map((a) => a.codigo),
    [{ label: 'Var. dia', data: topAltas.map((a) => r2(a.varDia * 100)), cor: '#34D399' }],
    { formatador: (v) => fmtNum(v, 2) + '%', horizontal: true });
  graficoBarras(view.querySelector('#ch-baixas'), topBaixas.map((a) => a.codigo),
    [{ label: 'Var. dia', data: topBaixas.map((a) => r2(a.varDia * 100)), cor: '#F87171' }],
    { formatador: (v) => fmtNum(v, 2) + '%', horizontal: true });

  montarTabela(view, ativos);

  view.querySelector('#ibov-busca').addEventListener('input', (e) => {
    busca = e.target.value;
    montarTabela(view, ativos);
  });
}

function montarTabela(view, ativos) {
  const q = busca.trim().toLowerCase();
  const linhas = ativos.filter((a) =>
    !q || a.codigo.toLowerCase().includes(q) || (a.acao || '').toLowerCase().includes(q));
  view.querySelector('#ibov-count').textContent = linhas.length;

  const pctCell = (v) => v == null ? '<span class="text-muted">—</span>'
    : `<span class="${classeSinal(v)}">${sinal(v)}${fmtNum(v * 100, 2)}%</span>`;

  tabelaOrdenavel(view.querySelector('#tabela-ibov'), {
    vazio: 'Nenhum ativo encontrado.',
    colunas: [
      { key: 'codigo', label: 'Código', align: 'left', render: (a) => `<span class="cell-titulo">${esc(a.codigo)}</span>` },
      { key: 'acao', label: 'Ação', align: 'left', render: (a) => esc(a.acao) },
      { key: 'cotacao', label: 'Cotação', render: (a) => a.cotacao != null ? 'R$ ' + fmtNum(a.cotacao, 2) : '—' },
      { key: 'varDia', label: 'Dia', render: (a) => pctCell(a.varDia) },
      { key: 'varSemana', label: 'Semana', render: (a) => pctCell(a.varSemana) },
      { key: 'varMes', label: 'Mês', render: (a) => pctCell(a.varMes) },
      { key: 'var6m', label: '6 meses', render: (a) => pctCell(a.var6m) },
      { key: 'var12m', label: '12 meses', render: (a) => pctCell(a.var12m) },
      { key: 'part', label: 'Part. (%)', render: (a) => a.part != null ? fmtNum(a.part * 100, 3) + '%' : '—' },
      { key: 'qtdeTeorica', label: 'Qtde teórica', render: (a) => a.qtdeTeorica != null ? fmtNum(a.qtdeTeorica, 0) : '—' },
    ],
    linhas,
  });
}

const media = (arr) => {
  const v = arr.filter(Number.isFinite);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};
const r2 = (v) => Math.round(v * 100) / 100;

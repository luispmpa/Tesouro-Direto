// Componentes de UI reutilizáveis: tabela ordenável e gráficos Chart.js
// com paleta consistente com o design system.

import { esc } from './format.js';

export const PALETA = ['#38BDF8', '#6366F1', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6', '#2DD4BF', '#FB923C', '#94A3B8'];

function corTexto() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim() || '#94A3B8';
}
function corGrade() {
  return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(148,163,184,.14)';
}

// ---------------------------------------------------------------------------
// Tabela ordenável genérica.
// colunas: [{key, label, render(row), valor(row) p/ sort, align}]
// ---------------------------------------------------------------------------

export function tabelaOrdenavel(container, { colunas, linhas, vazio = 'Nenhum registro.', linhaExtra = null }) {
  let sortKey = null;
  let sortAsc = true;

  function draw() {
    const dados = [...linhas];
    if (sortKey) {
      const col = colunas.find((c) => c.key === sortKey);
      dados.sort((a, b) => {
        const va = col.valor ? col.valor(a) : a[sortKey];
        const vb = col.valor ? col.valor(b) : b[sortKey];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    const thead = colunas.map((c) =>
      `<th data-key="${c.key}" class="${sortKey === c.key ? (sortAsc ? 'sort-asc' : 'sort-desc') : ''}" ${c.align ? `style="text-align:${c.align}"` : ''}>${esc(c.label)}</th>`
    ).join('');

    let tbody;
    if (!dados.length) {
      tbody = `<tr class="empty-state"><td colspan="${colunas.length}">${vazio}</td></tr>`;
    } else {
      tbody = dados.map((row) =>
        '<tr>' + colunas.map((c) => {
          const conteudo = c.render ? c.render(row) : esc(row[c.key] ?? '—');
          return `<td ${c.align ? `style="text-align:${c.align}"` : ''}>${conteudo}</td>`;
        }).join('') + '</tr>'
      ).join('');
      if (linhaExtra) tbody += linhaExtra;
    }

    container.innerHTML = `<div class="table-wrap"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
    container.querySelectorAll('th[data-key]').forEach((th) => {
      th.addEventListener('click', () => {
        const k = th.dataset.key;
        if (sortKey === k) sortAsc = !sortAsc; else { sortKey = k; sortAsc = true; }
        draw();
      });
    });
  }

  draw();
  return { redraw: draw };
}

// ---------------------------------------------------------------------------
// Gráficos (Chart.js já carregado via CDN)
// ---------------------------------------------------------------------------

const charts = new WeakMap();

function montar(canvas, config) {
  if (typeof Chart === 'undefined') {
    canvas.replaceWith(Object.assign(document.createElement('div'), {
      className: 'empty-box', textContent: 'Gráficos indisponíveis (Chart.js não carregou).',
    }));
    return null;
  }
  const anterior = charts.get(canvas);
  if (anterior) anterior.destroy();
  const chart = new Chart(canvas, config);
  charts.set(canvas, chart);
  return chart;
}

export function graficoRosca(canvas, labels, valores, formatador) {
  return montar(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: PALETA, borderWidth: 0, hoverOffset: 6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '64%',
      plugins: {
        legend: { position: 'bottom', labels: { color: corTexto(), boxWidth: 11, padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatador ? formatador(ctx.parsed) : ctx.parsed}` } },
      },
    },
  });
}

export function graficoBarras(canvas, labels, datasets, { formatador, horizontal = false, stacked = false } = {}) {
  return montar(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({
        backgroundColor: d.cor || PALETA[i % PALETA.length],
        borderRadius: 5, maxBarThickness: 42,
        ...d,
      })),
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: datasets.length > 1
          ? { position: 'bottom', labels: { color: corTexto(), boxWidth: 11, font: { size: 11 } } }
          : { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label || ''}: ${formatador ? formatador(horizontal ? ctx.parsed.x : ctx.parsed.y) : ctx.formattedValue}` } },
      },
      scales: {
        x: { stacked, grid: { color: corGrade() }, ticks: { color: corTexto(), font: { size: 11 } } },
        y: { stacked, grid: { color: corGrade() }, ticks: { color: corTexto(), font: { size: 11 } } },
      },
    },
  });
}

export function graficoLinha(canvas, labels, datasets, { formatador } = {}) {
  return montar(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({
        borderColor: d.cor || PALETA[i % PALETA.length],
        backgroundColor: 'transparent',
        tension: 0.3, pointRadius: 2, borderWidth: 2,
        ...d,
      })),
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: corTexto(), boxWidth: 11, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label || ''}: ${formatador ? formatador(ctx.parsed.y) : ctx.formattedValue}` } },
      },
      scales: {
        x: { grid: { color: corGrade() }, ticks: { color: corTexto(), font: { size: 11 }, maxTicksLimit: 10 } },
        y: { grid: { color: corGrade() }, ticks: { color: corTexto(), font: { size: 11 } } },
      },
    },
  });
}

// Modal genérico montado no #modal-root.
export function abrirModal({ titulo, corpoHTML, large = false, aoMontar }) {
  const root = document.getElementById('modal-root');
  const wrap = document.createElement('div');
  wrap.className = 'modal active';
  wrap.innerHTML = `
    <div class="modal-content card ${large ? 'modal-lg' : ''}">
      <div class="modal-header">
        <h2>${esc(titulo)}</h2>
        <button class="close-modal" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body">${corpoHTML}</div>
    </div>`;
  root.appendChild(wrap);

  const fechar = () => wrap.remove();
  wrap.querySelector('.close-modal').addEventListener('click', fechar);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) fechar(); });
  if (aoMontar) aoMontar(wrap, fechar);
  return { fechar, el: wrap };
}

// Módulo Tesouro Direto — carteira completa com marcação a mercado, CRUD de
// aportes (preservado do app original), atualização de preços (API oficial,
// planilha Excel ou manual), simulação de venda antecipada vs. vencimento e
// gráficos por título/vencimento/indexador.

import {
  carteiraMarcada, agruparPosicoes, obterCarteira, salvarCarteira,
  restaurarCarteiraInicial, obterPrecosManuais, salvarPrecosManuais, generateId,
} from '../services/dataStore.js';
import { atualizarTesouro, obterCache, dadosDoTitulo, obterHistoricoTaxas } from '../services/tesouroApi.js';
import { fmtBRL, fmtNum, fmtPct, sinal, classeSinal, fmtDataBR, fmtDataHoraBR, esc } from '../utils/format.js';
import { tabelaOrdenavel, graficoBarras, graficoLinha, abrirModal } from '../utils/ui.js';
import { mesmoTituloExtrato, parseExtratoAnalitico, reconciliarExtratoTitulo } from '../utils/tesouroExtrato.js';

let filtroTitulo = 'Todos';

export function renderTesouro(view, params) {
  // Deep-link "#/tesouro?titulo=...": já abre filtrado pelo título informado.
  const tituloParam = params?.get('titulo');
  if (tituloParam) {
    filtroTitulo = obterCarteira().some((p) => p.titulo === tituloParam) ? tituloParam : 'Todos';
  }

  const { posicoes, totais, apiAtualizadaEm } = carteiraMarcada();

  view.innerHTML = `
    <section class="grid grid-kpi">
      ${kpi('Total investido', fmtBRL(totais.investido))}
      ${kpi('Valor bruto a mercado', fmtBRL(totais.bruto), '<span class="badge badge-info">PU de resgate</span>')}
      ${kpi('Valor líquido estimado', fmtBRL(totais.liquido), `IR ${fmtBRL(totais.ir)} · B3 ${fmtBRL(totais.b3)}`)}
      ${kpi('Rentabilidade', `<span class="${classeSinal(totais.rentRS)}">${sinal(totais.rentRS)}${fmtBRL(totais.rentRS)}</span>`,
        `<span class="badge ${totais.rentRS >= 0 ? 'badge-pos' : 'badge-neg'}">${fmtPct(totais.rentPct, 2, true)}</span>`)}
    </section>

    <div class="section-title">
      <h2>Resumo por título</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary btn-sm" id="btn-atualizar-mercado">⟳ Atualizar mercado</button>
        <button class="btn btn-secondary btn-sm" id="btn-importar-extrato">⬆ ${filtroTitulo === 'Todos' ? 'Importar extrato de título' : 'Atualizar este título via Excel'}</button>
        <input type="file" id="extrato-file" accept=".xlsx,.xls" hidden>
        <button class="btn btn-primary btn-sm" id="btn-novo-aporte">+ Novo aporte</button>
      </div>
    </div>
    <div class="summary-cards" id="cards-titulos"></div>

    <div class="section-title">
      <h2>Meus aportes <span class="count-badge" id="contagem"></span></h2>
      <span class="hint">clique em uma linha para simular venda antecipada × manter até o vencimento</span>
    </div>
    <div class="card" style="padding:0" id="tabela-posicoes"></div>
    <p class="text-muted mt">
      Última atualização da API do Tesouro: ${apiAtualizadaEm ? fmtDataHoraBR(new Date(apiAtualizadaEm)) : 'ainda não consultada'}.
      Preços com origem: <span class="badge badge-pos">API</span> resgate oficial ·
      <span class="badge badge-info">manual</span> informado por você ·
      <span class="badge badge-mute">compra</span> sem dado de mercado (fallback).
    </p>

    <div class="section-title"><h2>Gráficos da carteira</h2></div>
    <section class="grid grid-2">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Investido × valor atual por título</h3>
        <div class="chart-box"><canvas id="ch-titulos"></canvas></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Taxa contratada × taxa atual de mercado (resgate)</h3>
        <div class="chart-box"><canvas id="ch-taxas"></canvas></div>
      </div>
    </section>
    <section class="grid grid-2 mt">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Histórico das taxas de resgate (Rentabilidade Anual)</h3>
        <div class="chart-box"><canvas id="ch-historico"></canvas></div>
        <p class="text-muted mt" id="historico-vazio"></p>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Vencimentos futuros</h3>
        <div class="chart-box"><canvas id="ch-vencimentos"></canvas></div>
      </div>
    </section>

    <div class="mt-lg" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" id="btn-export">⬇ Exportar backup (JSON)</button>
      <button class="btn btn-secondary btn-sm" id="btn-import">⬆ Importar backup</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
      <button class="btn btn-danger btn-sm" id="btn-reset">Restaurar dados da planilha</button>
    </div>`;

  montarCards(view, posicoes, totais);
  montarTabela(view, posicoes);
  montarGraficos(view, posicoes);
  ligarAcoes(view);
}

const kpi = (titulo, valor, sub = '') => `
  <div class="card kpi"><h3>${titulo}</h3><p class="valor">${valor}</p><span class="sub">${sub}</span></div>`;

// --------------------------------------------------------------- cards -----

function montarCards(view, posicoes, totais) {
  const box = view.querySelector('#cards-titulos');
  const grupos = agruparPosicoes(posicoes, 'titulo');
  const card = (id, titulo, valor, ativo) => `
    <div class="summary-card ${ativo ? 'active' : ''}" data-filtro="${esc(id)}">
      <span class="t" title="${esc(titulo)}">${esc(titulo)}</span>
      <span class="v">${valor}</span>
    </div>`;
  box.innerHTML =
    card('Todos', 'Todos os títulos', fmtBRL(totais.bruto), filtroTitulo === 'Todos') +
    grupos.map((g) => card(g.chave, g.chave, fmtBRL(g.bruto), filtroTitulo === g.chave)).join('');
  box.querySelectorAll('.summary-card').forEach((el) => {
    el.addEventListener('click', () => {
      filtroTitulo = el.dataset.filtro;
      renderTesouro(view.closest('#view') || view);
    });
  });
}

// -------------------------------------------------------------- tabela -----

function badgeFonte(p) {
  if (p.fontePreco === 'api') return '<span class="badge badge-pos" title="PU de resgate da API oficial">API</span>';
  if (p.fontePreco === 'manual') return '<span class="badge badge-info" title="Preço informado manualmente">manual</span>';
  return '<span class="badge badge-mute" title="Sem dado de mercado: usando preço de compra">compra</span>';
}

function montarTabela(view, posicoes) {
  const linhas = posicoes.filter((p) => filtroTitulo === 'Todos' || p.titulo === filtroTitulo);
  view.querySelector('#contagem').textContent = linhas.length;

  tabelaOrdenavel(view.querySelector('#tabela-posicoes'), {
    vazio: 'Nenhum aporte. Clique em <strong>+ Novo aporte</strong> para começar.',
    colunas: [
      { key: 'titulo', label: 'Título', align: 'left', render: (p) => `<span class="cell-titulo">${esc(p.titulo)}</span><br><small class="text-muted">${esc(p.tipo)}</small>` },
      { key: 'dataAplicacao', label: 'Aplicação', valor: (p) => ordemData(p.dataAplicacao), render: (p) => esc(p.dataAplicacao) },
      { key: 'vencimento', label: 'Vencimento', valor: (p) => p.vencimento?.getTime() ?? 0, render: (p) => p.vencimento ? `${fmtDataBR(p.vencimento)}<br><small class="text-muted">${p.diasAteVcto}d</small>` : '—' },
      { key: 'quantidade', label: 'Qtde', render: (p) => fmtNum(p.quantidade, 2) },
      { key: 'precoUnitario', label: 'Preço compra', render: (p) => fmtBRL(p.precoUnitario) },
      { key: 'investidoCalc', label: 'Investido', render: (p) => fmtBRL(p.investidoCalc) },
      { key: 'taxaContratada', label: 'Taxa contratada', valor: (p) => p.taxaContratadaNum ?? -1, render: (p) => esc(p.taxaContratada) },
      { key: 'taxaAtualMercado', label: 'Taxa atual', valor: (p) => p.taxaAtualMercado ?? -999, render: (p) => taxaAtualCell(p) },
      { key: 'precoMercado', label: 'PU atual', render: (p) => `${fmtBRL(p.precoMercado)} ${badgeFonte(p)}` },
      { key: 'valorAtual', label: 'Valor bruto', render: (p) => `<strong>${fmtBRL(p.valorAtual)}</strong>` },
      { key: 'valorLiquido', label: 'Líquido est.', render: (p) => `${fmtBRL(p.valorLiquido)}<br><small class="text-muted">IR ${fmtNum(p.irPct, 1)}%</small>` },
      { key: 'rentabilidadeRS', label: 'Rentab.', render: (p) => `
          <span class="${classeSinal(p.rentabilidadeRS)}">${sinal(p.rentabilidadeRS)}${fmtBRL(p.rentabilidadeRS)}</span><br>
          <small class="${classeSinal(p.rentabilidadeRS)}">${fmtPct(p.rentabilidadePct, 2, true)}${p.rentAnualizada != null ? ` · ${fmtPct(p.rentAnualizada, 1, true)} a.a.` : ''}</small>` },
      { key: 'acoes', label: '', render: (p) => `
          <span class="action-btns" style="display:inline-flex;gap:2px">
            <button class="btn-icon" data-simular="${p.id}" title="Simular venda × manter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17V9m4 8V5m4 12v-4M3 21h18"/></svg>
            </button>
            <button class="btn-icon" data-editar="${p.id}" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" data-excluir="${p.id}" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </span>` },
    ],
    linhas,
  });

  view.querySelector('#tabela-posicoes').addEventListener('click', (e) => {
    const sim = e.target.closest('[data-simular]');
    const ed = e.target.closest('[data-editar]');
    const ex = e.target.closest('[data-excluir]');
    if (sim) abrirSimulador(posicoes.find((p) => p.id === sim.dataset.simular));
    else if (ed) abrirFormAporte(ed.dataset.editar);
    else if (ex) excluirAporte(ex.dataset.excluir);
  });
}

function taxaAtualCell(p) {
  if (p.taxaAtualMercado == null) return '<span class="text-muted">—</span>';
  let delta = '';
  if (p.deltaTaxa != null) {
    // Taxa de mercado abaixo da contratada => marcação a favor (PU acima da curva).
    const cls = p.marcacao === 'ganho' ? 'pos' : p.marcacao === 'perda' ? 'neg' : 'neutro';
    delta = `<br><small class="${cls}" title="Diferença entre taxa atual e contratada">${sinal(p.deltaTaxa)}${fmtNum(p.deltaTaxa, 2)} p.p. ${p.marcacao === 'ganho' ? '▲ marcação' : p.marcacao === 'perda' ? '▼ marcação' : ''}</small>`;
  }
  return `${fmtNum(p.taxaAtualMercado, 2)}%${delta}`;
}

const ordemData = (str) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str || '');
  return m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
};

// ------------------------------------------------------------ gráficos -----

function montarGraficos(view, posicoes) {
  const porTitulo = agruparPosicoes(posicoes, 'titulo');
  graficoBarras(view.querySelector('#ch-titulos'),
    porTitulo.map((g) => g.chave.replace('Tesouro ', '')),
    [
      { label: 'Investido', data: porTitulo.map((g) => r2(g.investido)), cor: '#64748B' },
      { label: 'Valor atual', data: porTitulo.map((g) => r2(g.bruto)), cor: '#38BDF8' },
    ],
    { formatador: fmtBRL, horizontal: true });

  // Taxa contratada média × taxa atual por título
  const taxas = {};
  posicoes.forEach((p) => {
    if (p.taxaContratadaNum == null) return;
    const k = p.titulo.replace('Tesouro ', '');
    if (!taxas[k]) taxas[k] = { somaPeso: 0, somaTaxa: 0, atual: null };
    taxas[k].somaPeso += p.investidoCalc;
    taxas[k].somaTaxa += p.taxaContratadaNum * p.investidoCalc;
    if (p.taxaAtualMercado != null) taxas[k].atual = p.taxaAtualMercado;
  });
  const labels = Object.keys(taxas);
  graficoBarras(view.querySelector('#ch-taxas'), labels,
    [
      { label: 'Contratada (média)', data: labels.map((k) => r2(taxas[k].somaTaxa / taxas[k].somaPeso)), cor: '#6366F1' },
      { label: 'Atual (resgate)', data: labels.map((k) => taxas[k].atual != null ? r2(taxas[k].atual) : null), cor: '#FBBF24' },
    ],
    { formatador: (v) => fmtNum(v, 2) + '%' });

  // Histórico de taxas
  const hist = obterHistoricoTaxas();
  const vazioEl = view.querySelector('#historico-vazio');
  if (hist.length >= 2) {
    const dias = [...hist].reverse();
    const titulosCarteira = [...new Set(posicoes.map((p) => p.titulo))].slice(0, 6);
    const datasets = titulosCarteira.map((t) => ({
      label: t.replace('Tesouro ', ''),
      data: dias.map((d) => {
        const found = Object.keys(d.taxas).find((k) => k.toLowerCase().includes(t.toLowerCase().replace('tesouro ', '')));
        return found && Number.isFinite(d.taxas[found].taxaVenda) ? d.taxas[found].taxaVenda : null;
      }),
    }));
    graficoLinha(view.querySelector('#ch-historico'),
      dias.map((d) => d.date.slice(5)), datasets, { formatador: (v) => fmtNum(v, 2) + '%' });
  } else {
    view.querySelector('#ch-historico').closest('.chart-box').style.display = 'none';
    vazioEl.textContent = 'O histórico é construído a cada atualização da API (uma amostra por dia). Volte amanhã para ver a evolução.';
  }

  const porVcto = agruparPosicoes(posicoes, 'vencimento').sort((a, b) => String(a.chave).localeCompare(String(b.chave)));
  graficoBarras(view.querySelector('#ch-vencimentos'), porVcto.map((g) => g.chave),
    [{ label: 'Valor bruto', data: porVcto.map((g) => r2(g.bruto)), cor: '#34D399' }], { formatador: fmtBRL });
}

const r2 = (v) => Math.round(v * 100) / 100;

// ----------------------------------------------------------- simulador -----

function abrirSimulador(p) {
  if (!p) return;
  const sim = p.simulacao;
  const manter = sim?.manter;
  abrirModal({
    titulo: 'Venda antecipada × manter até o vencimento',
    large: true,
    corpoHTML: `
      <p style="margin-bottom:14px"><strong>${esc(p.titulo)}</strong> — aplicado em ${esc(p.dataAplicacao)} ·
        ${fmtNum(p.quantidade, 2)} un. · taxa contratada ${esc(p.taxaContratada)}</p>
      <div class="grid grid-2">
        <div class="card" style="background:var(--bg-soft)">
          <h3 style="font-size:12px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Vender hoje</h3>
          <p>Valor bruto: <strong>${fmtBRL(sim.venderHoje.bruto)}</strong></p>
          <p>IR (${fmtNum(p.irPct, 1)}% sobre o lucro): <span class="neg">−${fmtBRL(p.irValor)}</span></p>
          <p>Taxa B3: <span class="neg">−${fmtBRL(p.b3Valor)}</span></p>
          <p style="margin-top:8px;font-size:16px">Líquido: <strong>${fmtBRL(sim.venderHoje.liquido)}</strong></p>
          <p class="${classeSinal(sim.venderHoje.liquido - p.investidoCalc)}" style="margin-top:4px">
            ${sinal(sim.venderHoje.liquido - p.investidoCalc)}${fmtBRL(sim.venderHoje.liquido - p.investidoCalc)} vs. investido</p>
        </div>
        <div class="card" style="background:var(--bg-soft)">
          <h3 style="font-size:12px;text-transform:uppercase;color:var(--text-3);margin-bottom:10px">Manter até ${p.vencimento ? fmtDataBR(p.vencimento) : 'o vencimento'}</h3>
          ${manter ? `
            <p>Valor bruto estimado: <strong>${fmtBRL(manter.bruto)}</strong></p>
            <p>Taxa nominal estimada: ${fmtNum(manter.taxaNominal, 2)}% a.a.</p>
            <p style="margin-top:8px;font-size:16px">Líquido estimado: <strong>${fmtBRL(manter.liquido)}</strong></p>
            <p class="${classeSinal(manter.vantagemLiquida)}" style="margin-top:4px">
              ${sinal(manter.vantagemLiquida)}${fmtBRL(manter.vantagemLiquida)} vs. vender hoje</p>
          ` : '<p class="text-muted">Sem dados suficientes para projetar (vencimento ou taxa contratada ausentes).</p>'}
        </div>
      </div>
      ${manter ? `<p class="notice mt"><strong>Metodologia:</strong> ${esc(manter.metodologia)}
        Premissas ajustáveis na página Dados &amp; Integrações. Detalhes em docs/MARCACAO-A-MERCADO.md.</p>` : ''}
      ${p.deltaTaxa != null ? `<p class="notice mt">Marcação a mercado: taxa contratada ${fmtNum(p.taxaContratadaNum, 2)}% → taxa atual de resgate ${fmtNum(p.taxaAtualMercado, 2)}%
        (<span class="${p.marcacao === 'ganho' ? 'pos' : 'neg'}">${p.marcacao === 'ganho' ? 'marcação a favor' : 'marcação contra'}</span>, Δ ${sinal(p.deltaTaxa)}${fmtNum(p.deltaTaxa, 2)} p.p.).</p>` : ''}`,
  });
}

// ---------------------------------------------------------------- CRUD -----

function abrirFormAporte(id = null) {
  const carteira = obterCarteira();
  const item = id ? carteira.find((p) => p.id === id) : null;
  const titulosUnicos = [...new Set(carteira.map((p) => p.titulo))].sort();

  abrirModal({
    titulo: item ? 'Editar aporte' : 'Cadastrar novo aporte',
    corpoHTML: `
      <form id="form-aporte">
        <div class="form-group">
          <label for="f-titulo">Título</label>
          <input id="f-titulo" required placeholder="Ex.: Tesouro Prefixado 2029" list="f-titulos-list" autocomplete="off" value="${esc(item?.titulo || '')}">
          <datalist id="f-titulos-list">${titulosUnicos.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="f-data">Data da aplicação</label>
            <input id="f-data" required placeholder="DD/MM/AAAA" maxlength="10" value="${esc(item?.dataAplicacao || '')}">
          </div>
          <div class="form-group">
            <label for="f-taxa">Taxa contratada</label>
            <input id="f-taxa" required placeholder="Ex.: 11,45% ou IPCA + 6,01%" value="${esc(item?.taxaContratada || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="f-qtd">Quantidade</label>
            <input id="f-qtd" type="number" step="0.01" required placeholder="0,00" value="${item?.quantidade ?? ''}">
          </div>
          <div class="form-group">
            <label for="f-preco">Preço unitário (R$)</label>
            <input id="f-preco" type="number" step="0.01" required placeholder="0,00" value="${item?.precoUnitario ?? ''}">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">${item ? 'Salvar alterações' : 'Salvar aporte'}</button>
      </form>`,
    aoMontar(modal, fechar) {
      const dataInput = modal.querySelector('#f-data');
      dataInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '$1/$2');
        e.target.value = v;
      });
      modal.querySelector('#form-aporte').addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = modal.querySelector('#f-titulo').value.trim();
        const data = modal.querySelector('#f-data').value.trim();
        const taxa = modal.querySelector('#f-taxa').value.trim();
        const qtd = parseFloat(modal.querySelector('#f-qtd').value);
        const preco = parseFloat(modal.querySelector('#f-preco').value);

        if (!titulo || !data || !taxa) return window.showToast('Preencha todos os campos do aporte.', 'error');
        if (!Number.isFinite(qtd) || qtd <= 0 || !Number.isFinite(preco) || preco <= 0)
          return window.showToast('Quantidade e preço devem ser números maiores que zero.', 'error');
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data))
          return window.showToast('Informe a data no formato DD/MM/AAAA.', 'error');

        const registro = { titulo, dataAplicacao: data, quantidade: qtd, precoUnitario: preco, valorInvestido: qtd * preco, taxaContratada: taxa };
        const lista = obterCarteira();
        if (item) {
          const idx = lista.findIndex((p) => p.id === item.id);
          if (idx !== -1) lista[idx] = { ...lista[idx], ...registro };
        } else {
          lista.push({ id: generateId(), ...registro });
        }
        salvarCarteira(lista);
        fechar();
        window.showToast(item ? 'Aporte atualizado com sucesso.' : 'Aporte cadastrado com sucesso.', 'success');
        rerenderPagina();
      });
    },
  });
}

function excluirAporte(id) {
  if (!confirm('Tem certeza que deseja excluir este aporte?')) return;
  salvarCarteira(obterCarteira().filter((p) => p.id !== id));
  window.showToast('Aporte excluído.', 'info');
  rerenderPagina();
}

function rerenderPagina() {
  const view = document.getElementById('view');
  if (view) renderTesouro(view);
}

// ------------------------------------------ importar extrato por título ----

async function importarExtratoArquivo(file) {
  if (typeof XLSX === 'undefined') {
    throw new Error('O leitor de Excel não está disponível. Recarregue a página e tente novamente.');
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  if (!ws) throw new Error('A planilha não possui uma aba legível.');

  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  const extrato = parseExtratoAnalitico(linhas);
  if (filtroTitulo !== 'Todos' && !mesmoTituloExtrato(extrato.titulo, filtroTitulo)) {
    throw new Error(`O arquivo é de "${extrato.titulo}", mas o título selecionado é "${filtroTitulo}".`);
  }

  const carteira = obterCarteira();
  const tituloExistente = carteira.find((item) => mesmoTituloExtrato(item.titulo, extrato.titulo))?.titulo;
  const tituloDestino = filtroTitulo === 'Todos' ? (tituloExistente || extrato.titulo) : filtroTitulo;
  const resultado = reconciliarExtratoTitulo(carteira, extrato, { tituloDestino, gerarId: generateId });
  abrirPreviaExtrato(resultado, extrato.aplicacoes.length);
}

function abrirPreviaExtrato(resultado, totalAplicacoes) {
  const { resumo, portfolio } = resultado;
  const semAlteracoes = resumo.alteracoes === 0;
  const avisoRemocao = resumo.removidos > 0
    ? `<p class="notice warn mt"><strong>Atenção:</strong> ${resumo.removidos} aporte(s) atual(is) não aparecem no arquivo e serão removidos deste título.</p>`
    : '';
  const avisoVazio = totalAplicacoes === 0
    ? '<p class="notice warn mt"><strong>Extrato sem aplicações:</strong> ao confirmar, este título ficará sem posições na carteira.</p>'
    : '';

  abrirModal({
    titulo: 'Conferir atualização do extrato',
    corpoHTML: `
      <p class="text-muted" style="margin-bottom:14px">O arquivo será usado como o estado atual de <strong>${esc(resumo.titulo)}</strong>. Os demais títulos não serão alterados.</p>
      <div class="import-summary">
        ${resumoImportacao('Na carteira', resumo.existentes)}
        ${resumoImportacao('No arquivo', resumo.recebidos)}
        ${resumoImportacao('Sem alteração', resumo.inalterados, 'pos')}
        ${resumoImportacao('Atualizados', resumo.atualizados, 'info')}
        ${resumoImportacao('Novos', resumo.adicionados, 'pos')}
        ${resumoImportacao('Removidos', resumo.removidos, resumo.removidos ? 'neg' : '')}
      </div>
      ${semAlteracoes ? '<p class="notice mt"><strong>Nenhuma alteração encontrada.</strong> Reenviar o mesmo arquivo não duplica os aportes.</p>' : ''}
      ${avisoRemocao}
      ${avisoVazio}
      <button type="button" class="btn btn-primary btn-block mt" id="btn-confirmar-extrato" ${semAlteracoes ? 'disabled' : ''}>
        ${semAlteracoes ? 'Carteira já sincronizada' : 'Aplicar atualização'}
      </button>`,
    aoMontar(modal, fechar) {
      modal.querySelector('#btn-confirmar-extrato').addEventListener('click', () => {
        salvarCarteira(portfolio);
        filtroTitulo = resumo.recebidos > 0 ? resumo.titulo : 'Todos';
        fechar();
        window.showToast(
          `Extrato atualizado: ${resumo.adicionados} novo(s), ${resumo.atualizados} atualizado(s) e ${resumo.removidos} removido(s).`,
          'success',
          6000
        );
        rerenderPagina();
      });
    },
  });
}

const resumoImportacao = (rotulo, valor, classe = '') => `
  <div class="import-summary-item">
    <span>${rotulo}</span>
    <strong class="${classe}">${valor}</strong>
  </div>`;

// -------------------------------------------- modal atualizar mercado ------

function abrirModalMercado() {
  const carteira = obterCarteira();
  const precos = obterPrecosManuais();
  const apiCache = obterCache();
  const titulosUnicos = [...new Set(carteira.map((p) => p.titulo))].sort();

  abrirModal({
    titulo: 'Atualizar preços de mercado',
    large: true,
    corpoHTML: `
      <p class="text-muted" style="margin-bottom:16px">
        Informe o preço unitário de <strong>resgate</strong> de cada título para a marcação a mercado.
        Busque automaticamente na API oficial, importe a planilha de resgate do site do Tesouro
        (.xlsx/.xls/.csv) ou preencha manualmente.</p>
      <div style="margin-bottom:14px;padding:14px;background:var(--bg-soft);border-radius:9px;border:1px dashed var(--primary)">
        <label style="color:var(--primary)">Online: API oficial do Tesouro Direto</label>
        <button type="button" id="btn-fetch-market" class="btn btn-primary btn-sm"><span id="btn-fetch-label">🔄 Buscar preços e taxas atuais</span></button>
        <small class="hint-text">Consulta o PU de venda (resgate) e a Rentabilidade Anual atual de cada título e preenche os campos abaixo. Com a conexão do Apps Script configurada, a busca passa pela sua planilha (sem bloqueio de CORS); senão, tenta direto e por proxies públicos.</small>
      </div>
      <div style="margin-bottom:18px;padding:14px;background:var(--bg-soft);border-radius:9px;border:1px dashed var(--border-strong)">
        <label for="upload-excel" style="color:var(--primary)">Manual: importar planilha do Tesouro (Excel)</label>
        <input type="file" id="upload-excel" accept=".xlsx, .xls, .csv">
        <small class="hint-text">Lê as colunas "Título" e "Preço unitário de resgate".</small>
      </div>
      <form id="form-market">
        <h3 style="font-size:13px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:8px">Preenchimento manual / conferência</h3>
        <div id="market-inputs">
          ${titulosUnicos.map((t) => {
            const mercado = dadosDoTitulo(apiCache, t);
            const valor = precos[t] ?? mercado?.puVenda ?? carteira.find((p) => p.titulo === t).precoUnitario;
            return `
              <div class="market-price-item">
                <span class="market-price-title">${esc(t)}</span>
                <input type="number" step="0.01" class="market-price-input" data-titulo="${esc(t)}" value="${Number(valor).toFixed(2)}" required>
              </div>`;
          }).join('')}
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:18px">Atualizar e calcular</button>
      </form>`,
    aoMontar(modal, fechar) {
      modal.querySelector('#btn-fetch-market').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const label = modal.querySelector('#btn-fetch-label');
        btn.disabled = true;
        label.textContent = '⏳ Buscando...';
        try {
          const cache = await atualizarTesouro();
          let ok = 0; const faltam = [];
          modal.querySelectorAll('.market-price-input').forEach((input) => {
            const mercado = dadosDoTitulo(cache, input.dataset.titulo);
            if (mercado && Number.isFinite(mercado.puVenda) && mercado.puVenda > 0) {
              input.value = mercado.puVenda.toFixed(2);
              input.style.borderColor = 'var(--pos)';
              ok++;
            } else {
              input.style.borderColor = 'var(--neg)';
              faltam.push(input.dataset.titulo);
            }
          });
          window.showToast(ok > 0
            ? `${ok} preço(s) atualizados pela API.${faltam.length ? ` ${faltam.length} título(s) fora de negociação: preencha manualmente.` : ''}`
            : 'Nenhum título da carteira foi encontrado na API.', ok > 0 ? 'success' : 'error', 6000);
        } catch {
          window.showToast('Não foi possível buscar online (rede/CORS). Use a planilha ou o preenchimento manual.', 'error', 6000);
        } finally {
          btn.disabled = false;
          label.textContent = '🔄 Buscar preços e taxas atuais';
        }
      });

      modal.querySelector('#upload-excel').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const workbook = XLSX.read(evt.target.result, { type: 'array' });
            const ws = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
            let ok = 0;
            json.forEach((row) => {
              if (!row || row.length < 3) return;
              const titulo = row[0] ? String(row[0]).trim() : '';
              const input = modal.querySelector(`.market-price-input[data-titulo="${CSS.escape(titulo)}"]`);
              if (!input || row[2] == null) return;
              let preco = typeof row[2] === 'number'
                ? row[2]
                : parseFloat(String(row[2]).replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.'));
              if (Number.isFinite(preco) && preco > 0) {
                input.value = preco.toFixed(2);
                input.style.borderColor = 'var(--pos)';
                ok++;
              }
            });
            window.showToast(ok > 0
              ? `${ok} preço(s) reconhecidos na planilha. Confira e clique em Atualizar.`
              : 'Nenhum título da carteira foi encontrado na planilha.', ok > 0 ? 'success' : 'error', 5000);
          } catch (err) {
            console.error(err);
            window.showToast('Erro ao ler o arquivo. Envie uma planilha válida.', 'error', 5000);
          }
        };
        reader.readAsArrayBuffer(file);
      });

      modal.querySelector('#form-market').addEventListener('submit', (e) => {
        e.preventDefault();
        const novos = { ...obterPrecosManuais() };
        modal.querySelectorAll('.market-price-input').forEach((input) => {
          const v = parseFloat(input.value);
          if (Number.isFinite(v) && v > 0) novos[input.dataset.titulo] = v;
        });
        salvarPrecosManuais(novos);
        fechar();
        window.showToast('Preços de mercado atualizados.', 'success');
        rerenderPagina();
      });
    },
  });
}

// ------------------------------------------------------ backup/restore -----

function ligarAcoes(view) {
  view.querySelector('#btn-novo-aporte').addEventListener('click', () => abrirFormAporte());
  view.querySelector('#btn-atualizar-mercado').addEventListener('click', abrirModalMercado);

  const extratoFile = view.querySelector('#extrato-file');
  view.querySelector('#btn-importar-extrato').addEventListener('click', () => extratoFile.click());
  extratoFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importarExtratoArquivo(file);
    } catch (err) {
      console.error(err);
      window.showToast(err?.message || 'Não foi possível importar o extrato.', 'error', 7000);
    } finally {
      extratoFile.value = '';
    }
  });

  view.querySelector('#btn-export').addEventListener('click', () => {
    const backup = {
      versao: 2,
      exportadoEm: new Date().toISOString(),
      portfolio: obterCarteira(),
      marketPrices: obterPrecosManuais(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `carteira-tesouro-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    window.showToast('Backup exportado.', 'success');
  });

  const importFile = view.querySelector('#import-file');
  view.querySelector('#btn-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const incoming = Array.isArray(parsed) ? parsed : parsed.portfolio;
        if (!Array.isArray(incoming)) throw new Error('Estrutura inválida');
        if (!confirm('Importar este backup substituirá a carteira atual. Continuar?')) return;
        salvarCarteira(incoming);
        if (parsed && parsed.marketPrices && typeof parsed.marketPrices === 'object') {
          salvarPrecosManuais(parsed.marketPrices);
        }
        window.showToast(`Backup importado: ${incoming.length} aporte(s).`, 'success');
        rerenderPagina();
      } catch (err) {
        console.error(err);
        window.showToast('Arquivo inválido. Selecione um backup JSON gerado por esta ferramenta.', 'error', 5000);
      } finally {
        importFile.value = '';
      }
    };
    reader.readAsText(file);
  });

  view.querySelector('#btn-reset').addEventListener('click', () => {
    if (!confirm('Isto substituirá sua carteira pelos dados migrados da planilha. Esta ação não pode ser desfeita. Continuar?')) return;
    restaurarCarteiraInicial();
    filtroTitulo = 'Todos';
    window.showToast('Carteira restaurada para os dados da planilha.', 'info');
    rerenderPagina();
  });
}

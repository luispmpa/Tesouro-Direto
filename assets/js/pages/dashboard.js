// Dashboard Geral — visão consolidada do patrimônio, distribução da carteira,
// alertas ativos e status dos robôs/fontes de dados.

import { carteiraMarcada, agruparPosicoes, obterPGBL, totalAportadoAno, statusFontes } from '../services/dataStore.js';
import { avaliarTudo } from '../services/alertEngine.js';
import { calcularPainelPGBL } from '../utils/finance.js';
import { fmtBRL, fmtPct, sinal, classeSinal, tempoRelativo, fmtDataHoraBR, esc } from '../utils/format.js';
import { graficoRosca, graficoBarras, abrirModal } from '../utils/ui.js';

export function renderDashboard(view) {
  const { posicoes, totais, apiAtualizadaEm } = carteiraMarcada();
  const fontes = statusFontes();
  const avaliacao = avaliarTudo();

  const alertasAtivos = avaliacao.configurados.filter((a) => a.condicao === true && a.status === 'Ativo');
  const totalAlertas = alertasAtivos.length + avaliacao.automaticos.length;

  // PGBL no patrimônio (apenas se houver dados — nunca vem do repositório)
  const pgbl = obterPGBL();
  const anoAtual = new Date().getFullYear();
  const aportadoPgblAno = totalAportadoAno(pgbl, anoAtual);
  const cfgAno = pgbl.anos?.[String(anoAtual)] || {};
  const painelPgbl = calcularPainelPGBL({
    rendaTributavel: cfgAno.renda || 0,
    aliquota: cfgAno.aliquota ?? 27.5,
    metaManual: cfgAno.metaManual,
    totalAportado: aportadoPgblAno,
  });

  const rentMediaAnualizada = mediaPonderada(posicoes.filter((p) => p.rentAnualizada != null), 'rentAnualizada', 'investidoCalc');

  view.innerHTML = `
    <section class="grid grid-kpi">
      <div class="card kpi card-link" data-nav="#/tesouro" role="button" tabindex="0" title="Ver carteira do Tesouro Direto">
        <h3>Patrimônio acompanhado</h3>
        <p class="valor">${fmtBRL(totais.bruto + aportadoPgblAno)}</p>
        <span class="sub">Tesouro (bruto) ${aportadoPgblAno > 0 ? '+ aportes PGBL do ano' : ''}</span>
      </div>
      <div class="card kpi card-link" data-nav="#/tesouro" role="button" tabindex="0" title="Ver os aportes do Tesouro Direto">
        <h3>Total investido</h3>
        <p class="valor">${fmtBRL(totais.investido)}</p>
        <span class="sub">${posicoes.length} aportes em Tesouro Direto</span>
      </div>
      <div class="card kpi card-link" data-nav="#/tesouro" role="button" tabindex="0" title="Ver marcação a mercado">
        <h3>Valor bruto atualizado</h3>
        <p class="valor">${fmtBRL(totais.bruto)}</p>
        <span class="sub"><span class="badge badge-info">marcação a mercado</span></span>
      </div>
      <div class="card kpi card-link" data-nav="#/tesouro" role="button" tabindex="0" title="Ver valor líquido estimado por título">
        <h3>Valor líquido estimado</h3>
        <p class="valor">${fmtBRL(totais.liquido)}</p>
        <span class="sub">após IR (${fmtBRL(totais.ir)}) e B3 (${fmtBRL(totais.b3)})</span>
      </div>
      <div class="card kpi card-link" data-nav="#/tesouro" role="button" tabindex="0" title="Ver rentabilidade por título">
        <h3>Rentabilidade acumulada</h3>
        <p class="valor ${classeSinal(totais.rentRS)}">${sinal(totais.rentRS)}${fmtBRL(totais.rentRS)}</p>
        <span class="sub">
          <span class="badge ${totais.rentRS >= 0 ? 'badge-pos' : 'badge-neg'}">${fmtPct(totais.rentPct, 2, true)}</span>
          ${rentMediaAnualizada != null ? `<span class="badge badge-mute">${fmtPct(rentMediaAnualizada, 2, true)} a.a.</span>` : ''}
        </span>
      </div>
      <div class="card kpi card-link" data-nav="#/alertas" role="button" tabindex="0" title="Abrir o painel de alertas">
        <h3>Alertas ativos</h3>
        <p class="valor ${totalAlertas > 0 ? 'neg' : 'pos'}">${totalAlertas}</p>
        <span class="sub" style="color:var(--primary)">ver painel de alertas →</span>
      </div>
    </section>

    <div class="section-title">
      <h2>Distribuição da carteira</h2>
      <span class="hint">valores brutos a mercado · clique em uma fatia/barra para ver os títulos</span>
    </div>
    <section class="grid grid-3">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Por classe / tipo de título</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-tipo"></canvas></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Por indexador</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-indexador"></canvas></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Por ano de vencimento</h3>
        <div class="chart-box chart-box-sm"><canvas id="ch-vcto"></canvas></div>
      </div>
    </section>

    <div class="section-title"><h2>Monitoramento</h2><span class="hint">clique para abrir os detalhes</span></div>
    <section class="grid grid-2">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Alertas em destaque</h3>
        <div class="status-list" id="dash-alertas"></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Status dos robôs e fontes de dados</h3>
        <div class="status-list">
          ${linhaFonte('Preços do Tesouro (manuais)', fontes.tesouroApi.conectado, fontes.tesouroApi.atualizadoEm, 'PU e taxa de resgate informados por você', '#/tesouro')}
          ${linhaFonte('Planilha / Apps Script (Web App)', fontes.appsScript.conectado, fontes.appsScript.atualizadoEm, fontes.appsScript.conectado ? 'Gmail PGBL, alertas por e-mail, IBOV ao vivo' : 'configure em Dados & Integrações', '#/dados')}
          ${linhaFonte('Cotações IBOV', fontes.ibov.fonte !== 'seed', fontes.ibov.atualizadoEm, fontes.ibov.fonte === 'seed' ? 'snapshot da planilha (26/05/2026)' : 'via planilha (GOOGLEFINANCE)', '#/ibov')}
          ${cfgAno.renda > 0 || aportadoPgblAno > 0 ? linhaFonte('PGBL — meta anual', true, null, `${fmtPct(painelPgbl.pctMeta, 1)} da meta de ${fmtBRL(painelPgbl.meta)}`, '#/pgbl') : ''}
        </div>
        <p class="text-muted" style="margin-top:12px">
          Preços do Tesouro atualizados manualmente em: ${apiAtualizadaEm ? fmtDataHoraBR(new Date(apiAtualizadaEm)) : 'nunca'}.
        </p>
      </div>
    </section>`;

  // Gráficos — cada fatia/barra abre os títulos do grupo em um modal de detalhes.
  const porTipo = agruparPosicoes(posicoes, 'tipo');
  graficoRosca(view.querySelector('#ch-tipo'), porTipo.map((g) => g.chave), porTipo.map((g) => round2(g.bruto)), fmtBRL,
    { onSelect: (_i, label) => abrirDetalheGrupo(posicoes, 'tipo', label) });

  const porIdx = agruparPosicoes(posicoes, 'indexador');
  graficoRosca(view.querySelector('#ch-indexador'), porIdx.map((g) => g.chave), porIdx.map((g) => round2(g.bruto)), fmtBRL,
    { onSelect: (_i, label) => abrirDetalheGrupo(posicoes, 'indexador', label) });

  const porVcto = agruparPosicoes(posicoes, 'vencimento').sort((a, b) => String(a.chave).localeCompare(String(b.chave)));
  graficoBarras(view.querySelector('#ch-vcto'), porVcto.map((g) => g.chave),
    [{ label: 'Valor bruto', data: porVcto.map((g) => round2(g.bruto)) }],
    { formatador: fmtBRL, onSelect: (_i, label) => abrirDetalheGrupo(posicoes, 'vencimento', label) });

  // Alertas em destaque — cada linha leva ao painel de alertas correspondente.
  const box = view.querySelector('#dash-alertas');
  const destaques = [
    ...alertasAtivos.map((a) => ({
      cor: 'dot-neg',
      texto: `<strong>${esc(a.ativo)}</strong> — ${esc(a.tipo)} ${a.valorAlvo}${a.base ? ` (${esc(a.base)})` : ''} atingido`,
      meta: a.preco != null ? fmtBRL(a.preco) : '',
      nav: '#/alertas?cat=atingidos',
    })),
    ...avaliacao.automaticos.slice(0, 6).map((a) => ({
      cor: a.severidade === 'alta' ? 'dot-neg' : 'dot-warn',
      texto: esc(a.mensagem),
      meta: a.categoria,
      nav: '#/alertas',
    })),
  ];
  box.innerHTML = destaques.length
    ? destaques.slice(0, 8).map((d) => `
        <div class="status-row row-link" data-nav="${d.nav}" role="button" tabindex="0" title="Abrir no painel de alertas"><span class="dot ${d.cor}"></span><span>${d.texto}</span><span class="meta">${esc(d.meta)}</span></div>`).join('')
    : '<div class="empty-box">Nenhum alerta atingido no momento. ✓</div>';

  ligarNavegacao(view);
}

// Navegação por clique/teclado em qualquer elemento marcado com data-nav.
function ligarNavegacao(view) {
  view.querySelectorAll('[data-nav]').forEach((el) => {
    const ir = () => { location.hash = el.dataset.nav; };
    el.addEventListener('click', ir);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); }
    });
  });
}

function linhaFonte(nome, ok, ts, detalhe, nav) {
  const navAttrs = nav ? ` class="status-row row-link" data-nav="${nav}" role="button" tabindex="0" title="Abrir detalhes"` : ' class="status-row"';
  return `
    <div${navAttrs}>
      <span class="dot ${ok ? 'dot-pos' : 'dot-mute'}"></span>
      <span><strong>${esc(nome)}</strong><br><small class="text-muted">${esc(detalhe)}</small></span>
      <span class="meta">${ts ? tempoRelativo(ts) : ok ? 'ok' : 'inativo'}</span>
    </div>`;
}

// Detalhe de um grupo de um gráfico (tipo, indexador ou ano de vencimento):
// lista os títulos da carteira que o compõem e oferece atalho para o Tesouro.
function chaveDimensao(p, dim) {
  if (dim === 'tipo') return p.tipo;
  if (dim === 'indexador') return p.indexador;
  if (dim === 'vencimento') return p.vencimento ? String(p.vencimento.getFullYear()) : 's/ data';
  return null;
}

function abrirDetalheGrupo(posicoes, dim, valor) {
  const rotulo = { tipo: 'classe / tipo de título', indexador: 'indexador', vencimento: 'ano de vencimento' }[dim] || dim;
  const itens = posicoes.filter((p) => chaveDimensao(p, dim) === valor).sort((a, b) => b.valorAtual - a.valorAtual);
  if (!itens.length) return;

  const totInv = itens.reduce((s, p) => s + p.investidoCalc, 0);
  const totBruto = itens.reduce((s, p) => s + p.valorAtual, 0);
  const totRent = totBruto - totInv;

  const linhas = itens.map((p) => `
    <tr>
      <td style="text-align:left">${esc(p.titulo)}<br><small class="text-muted">${esc(p.dataAplicacao)} · ${esc(p.tipo)}</small></td>
      <td style="text-align:right">${fmtBRL(p.investidoCalc)}</td>
      <td style="text-align:right"><strong>${fmtBRL(p.valorAtual)}</strong></td>
      <td style="text-align:right" class="${classeSinal(p.rentabilidadeRS)}">${sinal(p.rentabilidadeRS)}${fmtBRL(p.rentabilidadeRS)}<br><small>${fmtPct(p.rentabilidadePct, 2, true)}</small></td>
    </tr>`).join('');

  const titulosUnicos = [...new Set(itens.map((p) => p.titulo))];
  const navHash = titulosUnicos.length === 1
    ? `#/tesouro?titulo=${encodeURIComponent(titulosUnicos[0])}`
    : '#/tesouro';

  abrirModal({
    titulo: `${valor} — ${rotulo}`,
    large: true,
    corpoHTML: `
      <p style="margin-bottom:14px">${itens.length} aporte(s) · investido ${fmtBRL(totInv)} ·
        valor bruto <strong>${fmtBRL(totBruto)}</strong> ·
        <span class="${classeSinal(totRent)}">${sinal(totRent)}${fmtBRL(totRent)}</span></p>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th style="text-align:left">Título</th>
            <th style="text-align:right">Investido</th>
            <th style="text-align:right">Valor bruto</th>
            <th style="text-align:right">Rentab.</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      <button class="btn btn-primary btn-block mt" id="btn-ver-tesouro">Ver no Tesouro Direto →</button>`,
    aoMontar(modal, fechar) {
      modal.querySelector('#btn-ver-tesouro').addEventListener('click', () => {
        fechar();
        location.hash = navHash;
      });
    },
  });
}

function mediaPonderada(arr, campo, peso) {
  const somaPeso = arr.reduce((s, x) => s + x[peso], 0);
  if (!(somaPeso > 0)) return null;
  return arr.reduce((s, x) => s + x[campo] * x[peso], 0) / somaPeso;
}

const round2 = (v) => Math.round(v * 100) / 100;

// Dashboard Geral — visão consolidada do patrimônio, distribução da carteira,
// alertas ativos e status dos robôs/fontes de dados.

import { carteiraMarcada, agruparPosicoes, obterPGBL, totalAportadoAno, statusFontes } from '../services/dataStore.js';
import { avaliarTudo } from '../services/alertEngine.js';
import { calcularPainelPGBL } from '../utils/finance.js';
import { fmtBRL, fmtPct, sinal, classeSinal, tempoRelativo, fmtDataHoraBR, esc } from '../utils/format.js';
import { graficoRosca, graficoBarras } from '../utils/ui.js';

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
      <div class="card kpi">
        <h3>Patrimônio acompanhado</h3>
        <p class="valor">${fmtBRL(totais.bruto + aportadoPgblAno)}</p>
        <span class="sub">Tesouro (bruto) ${aportadoPgblAno > 0 ? '+ aportes PGBL do ano' : ''}</span>
      </div>
      <div class="card kpi">
        <h3>Total investido</h3>
        <p class="valor">${fmtBRL(totais.investido)}</p>
        <span class="sub">${posicoes.length} aportes em Tesouro Direto</span>
      </div>
      <div class="card kpi">
        <h3>Valor bruto atualizado</h3>
        <p class="valor">${fmtBRL(totais.bruto)}</p>
        <span class="sub"><span class="badge badge-info">marcação a mercado</span></span>
      </div>
      <div class="card kpi">
        <h3>Valor líquido estimado</h3>
        <p class="valor">${fmtBRL(totais.liquido)}</p>
        <span class="sub">após IR (${fmtBRL(totais.ir)}) e B3 (${fmtBRL(totais.b3)})</span>
      </div>
      <div class="card kpi">
        <h3>Rentabilidade acumulada</h3>
        <p class="valor ${classeSinal(totais.rentRS)}">${sinal(totais.rentRS)}${fmtBRL(totais.rentRS)}</p>
        <span class="sub">
          <span class="badge ${totais.rentRS >= 0 ? 'badge-pos' : 'badge-neg'}">${fmtPct(totais.rentPct, 2, true)}</span>
          ${rentMediaAnualizada != null ? `<span class="badge badge-mute">${fmtPct(rentMediaAnualizada, 2, true)} a.a.</span>` : ''}
        </span>
      </div>
      <div class="card kpi">
        <h3>Alertas ativos</h3>
        <p class="valor ${totalAlertas > 0 ? 'neg' : 'pos'}">${totalAlertas}</p>
        <span class="sub"><a href="#/alertas" style="color:var(--primary)">ver painel de alertas →</a></span>
      </div>
    </section>

    <div class="section-title">
      <h2>Distribuição da carteira</h2>
      <span class="hint">valores brutos a mercado</span>
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

    <div class="section-title"><h2>Monitoramento</h2></div>
    <section class="grid grid-2">
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Alertas em destaque</h3>
        <div class="status-list" id="dash-alertas"></div>
      </div>
      <div class="card">
        <h3 style="font-size:13px;margin-bottom:12px">Status dos robôs e fontes de dados</h3>
        <div class="status-list">
          ${linhaFonte('API oficial do Tesouro Direto', fontes.tesouroApi.conectado, fontes.tesouroApi.atualizadoEm, 'taxas e PUs de compra/venda')}
          ${linhaFonte('Planilha / Apps Script (Web App)', fontes.appsScript.conectado, fontes.appsScript.atualizadoEm, fontes.appsScript.conectado ? 'Gmail PGBL, alertas por e-mail, IBOV ao vivo' : 'configure em Dados & Integrações')}
          ${linhaFonte('Cotações IBOV', fontes.ibov.fonte !== 'seed', fontes.ibov.atualizadoEm, fontes.ibov.fonte === 'seed' ? 'snapshot da planilha (26/05/2026)' : 'via planilha (GOOGLEFINANCE)')}
          ${cfgAno.renda > 0 || aportadoPgblAno > 0 ? linhaFonte('PGBL — meta anual', true, null, `${fmtPct(painelPgbl.pctMeta, 1)} da meta de ${fmtBRL(painelPgbl.meta)}`) : ''}
        </div>
        <p class="text-muted" style="margin-top:12px">
          Última consulta à API do Tesouro: ${apiAtualizadaEm ? fmtDataHoraBR(new Date(apiAtualizadaEm)) : 'ainda não realizada'}.
        </p>
      </div>
    </section>`;

  // Gráficos
  const porTipo = agruparPosicoes(posicoes, 'tipo');
  graficoRosca(view.querySelector('#ch-tipo'), porTipo.map((g) => g.chave), porTipo.map((g) => round2(g.bruto)), fmtBRL);

  const porIdx = agruparPosicoes(posicoes, 'indexador');
  graficoRosca(view.querySelector('#ch-indexador'), porIdx.map((g) => g.chave), porIdx.map((g) => round2(g.bruto)), fmtBRL);

  const porVcto = agruparPosicoes(posicoes, 'vencimento').sort((a, b) => String(a.chave).localeCompare(String(b.chave)));
  graficoBarras(view.querySelector('#ch-vcto'), porVcto.map((g) => g.chave),
    [{ label: 'Valor bruto', data: porVcto.map((g) => round2(g.bruto)) }], { formatador: fmtBRL });

  // Alertas em destaque
  const box = view.querySelector('#dash-alertas');
  const destaques = [
    ...alertasAtivos.map((a) => ({
      cor: 'dot-neg',
      texto: `<strong>${esc(a.ativo)}</strong> — ${esc(a.tipo)} ${a.valorAlvo}${a.base ? ` (${esc(a.base)})` : ''} atingido`,
      meta: a.preco != null ? fmtBRL(a.preco) : '',
    })),
    ...avaliacao.automaticos.slice(0, 6).map((a) => ({
      cor: a.severidade === 'alta' ? 'dot-neg' : 'dot-warn',
      texto: esc(a.mensagem),
      meta: a.categoria,
    })),
  ];
  box.innerHTML = destaques.length
    ? destaques.slice(0, 8).map((d) => `
        <div class="status-row"><span class="dot ${d.cor}"></span><span>${d.texto}</span><span class="meta">${esc(d.meta)}</span></div>`).join('')
    : '<div class="empty-box">Nenhum alerta atingido no momento. ✓</div>';
}

function linhaFonte(nome, ok, ts, detalhe) {
  return `
    <div class="status-row">
      <span class="dot ${ok ? 'dot-pos' : 'dot-mute'}"></span>
      <span><strong>${esc(nome)}</strong><br><small class="text-muted">${esc(detalhe)}</small></span>
      <span class="meta">${ts ? tempoRelativo(ts) : ok ? 'ok' : 'inativo'}</span>
    </div>`;
}

function mediaPonderada(arr, campo, peso) {
  const somaPeso = arr.reduce((s, x) => s + x[peso], 0);
  if (!(somaPeso > 0)) return null;
  return arr.reduce((s, x) => s + x[campo] * x[peso], 0) / somaPeso;
}

const round2 = (v) => Math.round(v * 100) / 100;

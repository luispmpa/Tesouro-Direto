// Cálculos financeiros: classificação de títulos, IR regressivo, taxa B3,
// marcação a mercado e projeções. Metodologia documentada em docs/MARCACAO-A-MERCADO.md.

import { parseDataBR } from './format.js';

export const MS_DIA = 86400000;

// ---------------------------------------------------------------------------
// Classificação de títulos do Tesouro
// ---------------------------------------------------------------------------

export function classificarTitulo(nome) {
  const n = (nome || '').toLowerCase();
  if (n.includes('selic')) return 'Selic';
  if (n.includes('renda+') || n.includes('renda +')) return 'Renda+';
  if (n.includes('educa+') || n.includes('educa +')) return 'Educa+';
  if (n.includes('prefixado') && n.includes('juros semestrais')) return 'Prefixado JS';
  if (n.includes('prefixado')) return 'Prefixado';
  if (n.includes('ipca') && n.includes('juros semestrais')) return 'IPCA+ JS';
  if (n.includes('ipca')) return 'IPCA+';
  return 'Outro';
}

export function indexadorDoTipo(tipo) {
  if (tipo === 'Selic') return 'SELIC';
  if (tipo === 'Prefixado' || tipo === 'Prefixado JS') return 'PRE';
  return 'IPCA';
}

// Extrai o ano de vencimento do nome ("Tesouro IPCA+ 2045" -> 2045).
export function anoVencimento(nome) {
  const m = /(\d{4})/.exec(nome || '');
  return m ? Number(m[1]) : null;
}

// Vencimento estimado quando a API não informa a data exata.
// Convenções do Tesouro: Selic/Prefixado vencem 01/01 (LFT/LTN) ou 01/03,
// NTN-B (IPCA+) vence 15/05 (anos ímpares) ou 15/08 (anos pares).
// Renda+/Educa+ usam 15/12 do ano final. É uma aproximação documentada;
// a data oficial da API tem prioridade sempre que disponível.
export function vencimentoEstimado(nome) {
  const ano = anoVencimento(nome);
  if (!ano) return null;
  const tipo = classificarTitulo(nome);
  if (tipo === 'Selic') return new Date(ano, 2, 1);
  if (tipo === 'Prefixado' || tipo === 'Prefixado JS') return new Date(ano, 0, 1);
  if (tipo === 'Renda+' || tipo === 'Educa+') return new Date(ano, 11, 15);
  return new Date(ano, ano % 2 === 1 ? 4 : 7, 15); // IPCA+
}

// ---------------------------------------------------------------------------
// Parse da taxa contratada ("IPCA + 6,01%", "11,45%", "SELIC + 0,09%")
// ---------------------------------------------------------------------------

export function parseTaxa(str) {
  const s = (str || '').toString().toUpperCase();
  const num = /([\d]+[.,]?\d*)\s*%?\s*$/.exec(s.trim());
  const valor = num ? parseFloat(num[1].replace(',', '.')) : null;
  if (s.includes('IPCA')) return { indexador: 'IPCA', spread: valor };
  if (s.includes('SELIC')) return { indexador: 'SELIC', spread: valor };
  return { indexador: 'PRE', spread: valor };
}

// ---------------------------------------------------------------------------
// Tributação e taxas
// ---------------------------------------------------------------------------

// IR regressivo sobre o lucro em renda fixa.
export function aliquotaIR(diasCorridos) {
  if (diasCorridos <= 180) return 22.5;
  if (diasCorridos <= 360) return 20;
  if (diasCorridos <= 720) return 17.5;
  return 15;
}

// Taxa de custódia da B3: 0,20% a.a. pró-rata sobre o valor do título.
// Tesouro Selic é isento sobre o estoque de até R$ 10.000 por investidor;
// aqui aplicamos a isenção por posição (aproximação conservadora documentada).
export function taxaB3(valorBruto, dias, isSelic) {
  if (!Number.isFinite(valorBruto) || valorBruto <= 0 || !Number.isFinite(dias) || dias <= 0) return 0;
  let base = valorBruto;
  if (isSelic) base = Math.max(0, valorBruto - 10000);
  return base * 0.002 * (dias / 365);
}

export function rentabilidadeAnualizada(investido, atual, dias) {
  if (!(investido > 0) || !(atual > 0) || !(dias > 0)) return null;
  return (Math.pow(atual / investido, 365 / dias) - 1) * 100;
}

// ---------------------------------------------------------------------------
// Marcação a mercado de uma posição
// ---------------------------------------------------------------------------

/**
 * Enriquece um aporte com a marcação a mercado completa.
 * @param item   aporte {titulo, dataAplicacao, quantidade, precoUnitario, valorInvestido, taxaContratada}
 * @param mercado dados do título {puVenda, puCompra, taxaVenda, taxaCompra, vencimento} ou null
 * @param overrides preços manuais {titulo: preco} (têm prioridade sobre a API)
 * @param premissas {ipcaProjetado, selicProjetada} em % a.a. para projeções
 */
export function marcarPosicao(item, mercado, overrides = {}, premissas = {}) {
  const hoje = new Date();
  const dataApl = parseDataBR(item.dataAplicacao);
  const dias = dataApl ? Math.max(1, Math.round((hoje - dataApl) / MS_DIA)) : null;

  const tipo = classificarTitulo(item.titulo);
  const isSelic = tipo === 'Selic';
  const investido = item.valorInvestido || item.quantidade * item.precoUnitario;

  const vencimento = (mercado && mercado.vencimento) || vencimentoEstimado(item.titulo);
  const diasAteVcto = vencimento ? Math.round((vencimento - hoje) / MS_DIA) : null;

  // Preço atual: manual > API (PU de venda/resgate) > preço de compra (fallback).
  let puAtual, fontePreco;
  if (Number.isFinite(overrides[item.titulo]) && overrides[item.titulo] > 0) {
    puAtual = overrides[item.titulo];
    fontePreco = 'manual';
  } else if (mercado && Number.isFinite(mercado.puVenda) && mercado.puVenda > 0) {
    puAtual = mercado.puVenda;
    fontePreco = 'api';
  } else {
    puAtual = item.precoUnitario;
    fontePreco = 'compra';
  }

  const bruto = puAtual * item.quantidade;
  const lucro = bruto - investido;
  const irPct = dias != null ? aliquotaIR(dias) : 15;
  const irValor = lucro > 0 ? lucro * (irPct / 100) : 0;
  const b3Valor = dias != null ? taxaB3(bruto, dias, isSelic) : 0;
  const liquido = bruto - irValor - b3Valor;

  const taxaContratada = parseTaxa(item.taxaContratada);
  const taxaAtual = mercado && Number.isFinite(mercado.taxaVenda) ? mercado.taxaVenda : null;
  const deltaTaxa = taxaAtual != null && taxaContratada.spread != null
    ? taxaAtual - taxaContratada.spread : null;
  // Para prefixados e IPCA+: taxa de mercado abaixo da contratada => PU valorizou
  // acima da curva => ganho na marcação (e vice-versa). Para Selic o efeito é residual.
  const marcacao = deltaTaxa == null ? null : (deltaTaxa < 0 ? 'ganho' : deltaTaxa > 0 ? 'perda' : 'neutra');

  const rentPct = investido > 0 ? (lucro / investido) * 100 : 0;
  const rentAnual = dias != null && dias >= 30 ? rentabilidadeAnualizada(investido, bruto, dias) : null;

  return {
    ...item,
    tipo, indexador: indexadorDoTipo(tipo),
    investidoCalc: investido,
    dias, vencimento, diasAteVcto,
    precoMercado: puAtual, fontePreco,
    valorAtual: bruto,
    rentabilidadeRS: lucro,
    rentabilidadePct: rentPct,
    rentAnualizada: rentAnual,
    irPct, irValor, b3Valor,
    valorLiquido: liquido,
    taxaContratadaNum: taxaContratada.spread,
    taxaAtualMercado: taxaAtual,
    deltaTaxa, marcacao,
    simulacao: simularCenarios({ investido, bruto, liquido, dias, diasAteVcto, tipo, taxaContratada, quantidade: item.quantidade, puAtual }, premissas),
  };
}

// Compara "vender hoje" com "manter até o vencimento".
// Metodologia (aproximações documentadas):
//  - Prefixado: VN de R$ 1.000 no vencimento (exato, sem cupons).
//  - Prefixado JS: VN + cupons semestrais de 10% a.a. reinvestidos à taxa contratada (aprox.).
//  - IPCA+/Renda+/Educa+: rentabilidade contratada real + IPCA projetado (premissa configurável).
//  - Selic: Selic projetada + spread contratado (premissa configurável).
export function simularCenarios(pos, premissas = {}) {
  const ipca = Number.isFinite(premissas.ipcaProjetado) ? premissas.ipcaProjetado : 4.5;
  const selic = Number.isFinite(premissas.selicProjetada) ? premissas.selicProjetada : 12.0;

  const venderHoje = { bruto: pos.bruto, liquido: pos.liquido };

  if (!(pos.diasAteVcto > 0) || pos.taxaContratada.spread == null) {
    return { venderHoje, manter: null };
  }

  const anosRestantes = pos.diasAteVcto / 365;
  let taxaNominal; // % a.a. estimada daqui até o vencimento
  let metodologia;

  if (pos.taxaContratada.indexador === 'PRE') {
    taxaNominal = pos.taxaContratada.spread;
    metodologia = pos.tipo === 'Prefixado'
      ? 'Valor nominal de R$ 1.000 por título no vencimento (sem cupons).'
      : 'Taxa contratada com cupons reinvestidos à mesma taxa (aproximação).';
  } else if (pos.taxaContratada.indexador === 'SELIC') {
    taxaNominal = ((1 + selic / 100) * (1 + pos.taxaContratada.spread / 100) - 1) * 100;
    metodologia = `Selic projetada de ${selic}% a.a. + spread contratado (premissa configurável).`;
  } else {
    taxaNominal = ((1 + ipca / 100) * (1 + pos.taxaContratada.spread / 100) - 1) * 100;
    metodologia = `IPCA projetado de ${ipca}% a.a. + taxa real contratada (premissa configurável).`;
  }

  let brutoVcto;
  if (pos.tipo === 'Prefixado') {
    brutoVcto = 1000 * pos.quantidade;
  } else {
    // Projeta a partir do valor de mercado atual até o vencimento.
    brutoVcto = pos.bruto * Math.pow(1 + taxaNominal / 100, anosRestantes);
  }

  const diasTotais = (pos.dias || 0) + pos.diasAteVcto;
  const lucroVcto = brutoVcto - pos.investido;
  const ir = lucroVcto > 0 ? lucroVcto * (aliquotaIR(diasTotais) / 100) : 0;
  const b3 = taxaB3(brutoVcto, diasTotais, pos.tipo === 'Selic');
  const liquidoVcto = brutoVcto - ir - b3;

  return {
    venderHoje,
    manter: {
      bruto: brutoVcto,
      liquido: liquidoVcto,
      taxaNominal,
      metodologia,
      vantagemLiquida: liquidoVcto - venderHoje.liquido,
    },
  };
}

// ---------------------------------------------------------------------------
// PGBL — benefício fiscal (mesma lógica das fórmulas da aba PGBL)
// ---------------------------------------------------------------------------

export function calcularPainelPGBL({ rendaTributavel = 0, aliquota = 27.5, metaManual = null, totalAportado = 0 }) {
  const limite12 = rendaTributavel * 0.12;
  const meta = Number.isFinite(metaManual) && metaManual > 0 ? metaManual : limite12;
  const falta = Math.max(0, meta - totalAportado);
  const pctMeta = meta > 0 ? (totalAportado / meta) * 100 : 0;
  const dedutivel = Math.min(totalAportado, limite12);
  return {
    limite12, meta, falta, pctMeta,
    economiaGarantida: dedutivel * (aliquota / 100),
    economiaMaxima: limite12 * (aliquota / 100),
  };
}

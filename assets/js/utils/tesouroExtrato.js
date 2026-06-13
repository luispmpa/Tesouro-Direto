// Leitura e reconciliação dos extratos analíticos exportados pelo Tesouro Direto.
// O arquivo representa o estado completo de um título; os demais títulos da
// carteira nunca são alterados durante a importação.

export function normalizarTituloExtrato(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function mesmoTituloExtrato(a, b) {
  return normalizarTituloExtrato(a) === normalizarTituloExtrato(b);
}

export function parseNumeroBR(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  const texto = String(valor ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/R\$/gi, '')
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .trim();
  if (!texto) return null;

  const normalizado = texto.includes(',')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

function formatarDataExcel(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return `${String(valor.getDate()).padStart(2, '0')}/${String(valor.getMonth() + 1).padStart(2, '0')}/${valor.getFullYear()}`;
  }
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    const data = new Date(Date.UTC(1899, 11, 30) + Math.round(valor) * 86400000);
    return `${String(data.getUTCDate()).padStart(2, '0')}/${String(data.getUTCMonth() + 1).padStart(2, '0')}/${data.getUTCFullYear()}`;
  }
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(valor ?? '').trim());
  if (!match) return null;
  return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
}

function extrairTitulo(linhas) {
  for (const linha of linhas.slice(0, 8)) {
    const texto = String(linha?.[0] ?? '').trim();
    const match = /^EXTRATO\s+ANAL[IÍ]TICO\s*-\s*(.+)$/i.exec(texto);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function possuiCabecalhoEsperado(linhas) {
  return linhas.some((linha) => {
    if (!Array.isArray(linha)) return false;
    const colunas = linha.slice(0, 5).map(normalizarTituloExtrato);
    return colunas[0]?.includes('data da aplicacao')
      && colunas[1]?.includes('quantidade')
      && colunas[2]?.includes('preco do titulo')
      && colunas[4]?.includes('rentabilidade contratada');
  });
}

export function parseExtratoAnalitico(linhas) {
  if (!Array.isArray(linhas) || !linhas.length) {
    throw new Error('A planilha está vazia.');
  }

  const titulo = extrairTitulo(linhas);
  if (!titulo) {
    throw new Error('Este arquivo não parece ser um Extrato Analítico do Tesouro Direto.');
  }
  if (!possuiCabecalhoEsperado(linhas)) {
    throw new Error('O título foi reconhecido, mas as colunas do Extrato Analítico não foram encontradas.');
  }

  const aplicacoes = [];
  linhas.forEach((linha) => {
    if (!Array.isArray(linha)) return;
    const dataAplicacao = formatarDataExcel(linha[0]);
    if (!dataAplicacao) return;

    const quantidade = parseNumeroBR(linha[1]);
    const precoUnitario = parseNumeroBR(linha[2]);
    const valorInformado = parseNumeroBR(linha[3]);
    const taxaContratada = String(linha[4] ?? '').replace(/\s+/g, ' ').trim();
    if (!(quantidade > 0) || !(precoUnitario > 0) || !taxaContratada) return;

    aplicacoes.push({
      titulo,
      dataAplicacao,
      quantidade,
      precoUnitario,
      valorInvestido: valorInformado > 0 ? valorInformado : quantidade * precoUnitario,
      taxaContratada,
    });
  });

  return { titulo, aplicacoes };
}

const numeroChave = (valor) => Number(valor || 0).toFixed(8);
const taxaChave = (valor) => String(valor ?? '').replace(/\s+/g, '').toUpperCase();

function chaveExata(item) {
  return [
    normalizarTituloExtrato(item.titulo),
    item.dataAplicacao,
    numeroChave(item.quantidade),
    numeroChave(item.precoUnitario),
    numeroChave(item.valorInvestido),
    taxaChave(item.taxaContratada),
  ].join('|');
}

function consumirFila(mapa, chave) {
  const fila = mapa.get(chave);
  if (!fila?.length) return null;
  const item = fila.shift();
  if (!fila.length) mapa.delete(chave);
  return item;
}

function agruparEmFilas(itens, chaveFn) {
  const mapa = new Map();
  itens.forEach((item) => {
    const chave = chaveFn(item);
    if (!mapa.has(chave)) mapa.set(chave, []);
    mapa.get(chave).push(item);
  });
  return mapa;
}

export function reconciliarExtratoTitulo(carteira, extrato, { tituloDestino = extrato?.titulo, gerarId } = {}) {
  if (!extrato?.titulo || !Array.isArray(extrato.aplicacoes)) {
    throw new Error('Extrato inválido para reconciliação.');
  }
  if (typeof gerarId !== 'function') {
    throw new Error('Não foi possível gerar identificadores para os novos aportes.');
  }

  const lista = Array.isArray(carteira) ? carteira : [];
  const atuais = lista.filter((item) => mesmoTituloExtrato(item?.titulo, tituloDestino));
  const incoming = extrato.aplicacoes.map((item) => ({ ...item, titulo: tituloDestino }));
  const atuaisDisponiveis = new Set(atuais);
  const porChaveExata = agruparEmFilas(atuais, chaveExata);
  const reconciliados = new Array(incoming.length);
  let inalterados = 0;
  let atualizados = 0;
  let adicionados = 0;

  incoming.forEach((item, index) => {
    const existente = consumirFila(porChaveExata, chaveExata(item));
    if (!existente) return;
    atuaisDisponiveis.delete(existente);
    reconciliados[index] = { ...existente, ...item, id: existente.id };
    inalterados++;
  });

  const restantesPorData = agruparEmFilas([...atuaisDisponiveis], (item) => item.dataAplicacao);
  incoming.forEach((item, index) => {
    if (reconciliados[index]) return;
    const existente = consumirFila(restantesPorData, item.dataAplicacao);
    if (!existente) return;
    atuaisDisponiveis.delete(existente);
    reconciliados[index] = { ...existente, ...item, id: existente.id };
    atualizados++;
  });

  incoming.forEach((item, index) => {
    if (reconciliados[index]) return;
    reconciliados[index] = { id: gerarId(), ...item };
    adicionados++;
  });

  const portfolio = [];
  let classeInserida = false;
  lista.forEach((item) => {
    if (mesmoTituloExtrato(item?.titulo, tituloDestino)) {
      if (!classeInserida) {
        portfolio.push(...reconciliados);
        classeInserida = true;
      }
      return;
    }
    portfolio.push(item);
  });
  if (!classeInserida) portfolio.push(...reconciliados);

  const removidos = atuaisDisponiveis.size;
  return {
    portfolio,
    resumo: {
      titulo: tituloDestino,
      existentes: atuais.length,
      recebidos: incoming.length,
      inalterados,
      atualizados,
      adicionados,
      removidos,
      alteracoes: atualizados + adicionados + removidos,
    },
  };
}

export function reconciliarLoteExtratos(carteira, extratos, { gerarId } = {}) {
  if (!Array.isArray(extratos) || !extratos.length) {
    throw new Error('Selecione ao menos um Extrato Analítico.');
  }
  if (typeof gerarId !== 'function') {
    throw new Error('Não foi possível gerar identificadores para os novos aportes.');
  }

  const titulosVistos = new Map();
  extratos.forEach((extrato) => {
    if (!extrato?.titulo || !Array.isArray(extrato.aplicacoes)) {
      throw new Error('Um dos extratos do lote é inválido.');
    }
    const chave = normalizarTituloExtrato(extrato.titulo);
    if (titulosVistos.has(chave)) {
      throw new Error(`O lote contém mais de um arquivo para "${extrato.titulo}". Envie apenas um extrato por título.`);
    }
    titulosVistos.set(chave, extrato.titulo);
  });

  let portfolio = Array.isArray(carteira) ? carteira : [];
  const resultados = [];
  extratos.forEach((extrato) => {
    const tituloExistente = portfolio.find((item) => mesmoTituloExtrato(item?.titulo, extrato.titulo))?.titulo;
    const resultado = reconciliarExtratoTitulo(portfolio, extrato, {
      tituloDestino: tituloExistente || extrato.titulo,
      gerarId,
    });
    portfolio = resultado.portfolio;
    resultados.push(resultado.resumo);
  });

  const totais = resultados.reduce((acc, resumo) => {
    acc.existentes += resumo.existentes;
    acc.recebidos += resumo.recebidos;
    acc.inalterados += resumo.inalterados;
    acc.atualizados += resumo.atualizados;
    acc.adicionados += resumo.adicionados;
    acc.removidos += resumo.removidos;
    acc.alteracoes += resumo.alteracoes;
    return acc;
  }, {
    titulos: resultados.length,
    existentes: 0,
    recebidos: 0,
    inalterados: 0,
    atualizados: 0,
    adicionados: 0,
    removidos: 0,
    alteracoes: 0,
  });

  return { portfolio, resultados, totais };
}

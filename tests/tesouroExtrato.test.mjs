import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mesmoTituloExtrato,
  parseExtratoAnalitico,
  reconciliarExtratoTitulo,
} from '../assets/js/utils/tesouroExtrato.js';

const linhas = (titulo, aplicacoes) => [
  [`EXTRATO ANALÍTICO - ${titulo}`],
  ['INVESTIDOR: TESTE'],
  ['VENCIMENTO: 15/05/2045'],
  ['Dados do seu investimento'],
  ['Data da aplicação', 'Quantidade de títulos', 'Preço do título na aplicação(R$)', 'Valor investido (R$)', 'Rentabilidade contratada'],
  ['Data da aplicação', 'Quantidade de títulos', 'Preço do título na aplicação(R$)', 'Valor investido (R$)', 'Rentabilidade contratada'],
  ...aplicacoes,
  ['Total'],
];

test('interpreta o modelo de extrato analítico em pt-BR', () => {
  const extrato = parseExtratoAnalitico(linhas('Tesouro IPCA+ 2045', [
    ['06/10/2023', '0,07', '1.181,32', '82,69', 'IPCA + 6,01%'],
  ]));

  assert.equal(extrato.titulo, 'Tesouro IPCA+ 2045');
  assert.deepEqual(extrato.aplicacoes[0], {
    titulo: 'Tesouro IPCA+ 2045',
    dataAplicacao: '06/10/2023',
    quantidade: 0.07,
    precoUnitario: 1181.32,
    valorInvestido: 82.69,
    taxaContratada: 'IPCA + 6,01%',
  });
  assert.equal(mesmoTituloExtrato('Tesouro IPCA + 2045', 'tesouro ipca+ 2045'), true);
});

test('reenviar o mesmo extrato não duplica aplicações', () => {
  let sequencia = 0;
  const gerarId = () => `novo-${++sequencia}`;
  const extrato = parseExtratoAnalitico(linhas('Tesouro IPCA+ 2045', [
    ['06/10/2023', '0,07', '1.181,32', '82,69', 'IPCA + 6,01%'],
    ['06/10/2023', '0,07', '1.181,32', '82,69', 'IPCA + 6,01%'],
  ]));

  const primeira = reconciliarExtratoTitulo([], extrato, { gerarId });
  const segunda = reconciliarExtratoTitulo(primeira.portfolio, extrato, { gerarId });

  assert.equal(primeira.resumo.adicionados, 2);
  assert.equal(segunda.resumo.inalterados, 2);
  assert.equal(segunda.resumo.alteracoes, 0);
  assert.equal(segunda.portfolio.length, 2);
  assert.deepEqual(segunda.portfolio.map((item) => item.id), ['novo-1', 'novo-2']);
});

test('reconcilia somente o título importado, preservando IDs quando possível', () => {
  let sequencia = 0;
  const carteira = [
    { id: 'outro-1', titulo: 'Tesouro Selic 2031', dataAplicacao: '01/01/2026', quantidade: 1, precoUnitario: 100, valorInvestido: 100, taxaContratada: 'SELIC + 0,1%' },
    { id: 'ipca-1', titulo: 'Tesouro IPCA+ 2045', dataAplicacao: '06/10/2023', quantidade: 0.07, precoUnitario: 1181.32, valorInvestido: 82.69, taxaContratada: 'IPCA + 6,01%' },
    { id: 'ipca-2', titulo: 'Tesouro IPCA+ 2045', dataAplicacao: '20/10/2023', quantidade: 0.26, precoUnitario: 1175.21, valorInvestido: 305.55, taxaContratada: 'IPCA + 6,05%' },
    { id: 'ipca-remover', titulo: 'Tesouro IPCA+ 2045', dataAplicacao: '23/10/2023', quantidade: 0.25, precoUnitario: 1177.98, valorInvestido: 294.49, taxaContratada: 'IPCA + 6,04%' },
  ];
  const extrato = parseExtratoAnalitico(linhas('Tesouro IPCA+ 2045', [
    ['06/10/2023', '0,07', '1.181,32', '82,69', 'IPCA + 6,01%'],
    ['20/10/2023', '0,27', '1.175,21', '317,31', 'IPCA + 6,05%'],
    ['11/04/2024', '0,10', '1.238,77', '123,87', 'IPCA + 6,06%'],
  ]));

  const resultado = reconciliarExtratoTitulo(carteira, extrato, {
    gerarId: () => `novo-${++sequencia}`,
  });

  assert.deepEqual(resultado.resumo, {
    titulo: 'Tesouro IPCA+ 2045',
    existentes: 3,
    recebidos: 3,
    inalterados: 1,
    atualizados: 1,
    adicionados: 1,
    removidos: 1,
    alteracoes: 3,
  });
  assert.equal(resultado.portfolio.find((item) => item.id === 'outro-1').titulo, 'Tesouro Selic 2031');
  assert.equal(resultado.portfolio.find((item) => item.id === 'ipca-2').quantidade, 0.27);
  assert.equal(resultado.portfolio.some((item) => item.id === 'ipca-remover'), false);
  assert.equal(resultado.portfolio.some((item) => item.id === 'novo-1'), true);
});

test('aceita extrato sem aplicações para zerar uma classe', () => {
  const carteira = [
    { id: 'ipca-1', titulo: 'Tesouro IPCA+ 2045', dataAplicacao: '06/10/2023' },
    { id: 'outro-1', titulo: 'Tesouro Selic 2031', dataAplicacao: '01/01/2026' },
  ];
  const extrato = parseExtratoAnalitico(linhas('Tesouro IPCA+ 2045', []));
  const resultado = reconciliarExtratoTitulo(carteira, extrato, { gerarId: () => 'novo' });

  assert.equal(resultado.resumo.removidos, 1);
  assert.deepEqual(resultado.portfolio.map((item) => item.id), ['outro-1']);
});

test('não trata uma planilha incompleta como extrato vazio', () => {
  assert.throws(
    () => parseExtratoAnalitico([['EXTRATO ANALÍTICO - Tesouro IPCA+ 2045']]),
    /colunas do Extrato Analítico não foram encontradas/
  );
});

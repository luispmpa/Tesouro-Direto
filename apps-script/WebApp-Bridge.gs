/**
 * Painel Financeiro — BRIDGE Web App (adição NÃO destrutiva).
 *
 * Use este arquivo quando a planilha JÁ tem a automação (importação PGBL via
 * Gmail, verificação de alertas, GOOGLEFINANCE). Ele NÃO redeclara CONFIG nem
 * as funções existentes — apenas adiciona o endpoint Web App em JSON que o
 * painel do GitHub Pages consome, lendo as abas atuais, e reaproveita as suas
 * funções de automação quando o painel pede para executá-las remotamente.
 *
 * Por que tudo é prefixado (PAINEL_/painel_)? No Apps Script todos os arquivos
 * .gs dividem o MESMO escopo global; dois "CONFIG" colidem
 * ("Identifier 'CONFIG' has already been declared"). O prefixo evita qualquer
 * colisão com o seu script atual, que permanece intacto.
 *
 * Instalação rápida:
 *   1. Cole este conteúdo no arquivo novo do projeto (substituindo o Code.gs
 *      completo que causou o erro). Não mexa nos demais arquivos.
 *   2. Rode uma vez `painel_gerarToken` (dropdown de função -> Executar) e
 *      copie o token no "Registro de execução".
 *   3. Implantar -> Novo deployment -> App da Web (Executar como: Eu;
 *      Acesso: Qualquer pessoa). Copie a URL terminada em /exec.
 *   4. Cole URL + token no painel, em "Dados & Integrações".
 */

var PAINEL_CONFIG = {
  ABA_IBOV: 'IBOV',
  ABA_ALERTAS: 'Alertas',
  ABA_PGBL: 'PGBL',
  ABA_LOGS: 'Logs',                 // opcional; se não existir, retorna vazio
  ABA_TAXAS: 'TaxasTD_Historico',   // criada sob demanda por painel_atualizarTaxasTesouro
  TESOURO_API: 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json',
  VERSAO: '1.0.0-bridge'
};

/* ----------------------------------------------------------------- Web App */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (token && p.token !== token) return painel_json_({ erro: 'Token inválido ou ausente.' });

  try {
    if (p.acao) return painel_json_(painel_executarAcao_(p.acao));
    var modulo = p.modulo || 'all';
    if (modulo === 'ping') {
      return painel_json_({ ok: true, versao: PAINEL_CONFIG.VERSAO, geradoEm: new Date().toISOString() });
    }
    var out = { versao: PAINEL_CONFIG.VERSAO, geradoEm: new Date().toISOString() };
    if (modulo === 'all' || modulo === 'ibov') out.ibov = painel_lerIBOV_();
    if (modulo === 'all' || modulo === 'pgbl') out.pgbl = painel_lerPGBL_();
    if (modulo === 'all' || modulo === 'alertas') out.alertas = painel_lerAlertas_();
    if (modulo === 'all' || modulo === 'logs') out.logs = painel_lerLogs_();
    return painel_json_(out);
  } catch (err) {
    return painel_json_({ erro: String(err) });
  }
}

function painel_json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Reaproveita as funções da SUA automação (não duplica a lógica). Procura a
// função pelo nome no escopo global; se não existir, devolve aviso claro.
function painel_executarAcao_(acao) {
  var mapa = {
    importarAportesPGBL: ['importarAportesPGBL'],
    verificarAlertas: ['verificarAlertas', 'verificaAlertas', 'checarAlertas'],
    atualizarTaxasTesouro: ['atualizarTaxasTesouro', 'painel_atualizarTaxasTesouro']
  };
  var candidatos = mapa[acao];
  if (!candidatos) return { erro: 'Ação desconhecida: ' + acao };
  for (var i = 0; i < candidatos.length; i++) {
    var fn = globalThis[candidatos[i]];
    if (typeof fn === 'function') {
      var r = fn();
      return { ok: true, mensagem: (r != null ? String(r) : (acao + ' executada com sucesso.')) };
    }
  }
  return { erro: 'Função "' + acao + '" não encontrada neste projeto. Verifique o nome no seu script.' };
}

/* --------------------------------------------------------- token utilitário */

function painel_gerarToken() {
  var token = Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token);
  Logger.log('TOKEN DO WEB APP (copie para o painel): ' + token);
  return token;
}

/* ---------------------------------------------------------- leitura das abas */

function painel_lerIBOV_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PAINEL_CONFIG.ABA_IBOV);
  if (!aba) return [];
  var dados = aba.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < dados.length; r++) {
    var l = dados[r];
    var codigo = String(l[0] || '').trim();
    if (!codigo || /redutor/i.test(codigo)) continue;
    out.push({
      codigo: codigo,
      acao: String(l[1] || ''),
      qtdeTeorica: painel_num_(l[2]),
      part: painel_num_(l[3]),
      varDia: painel_num_(l[4]),
      varSemana: painel_num_(l[5]),
      varMes: painel_num_(l[6]),
      var6m: painel_num_(l[7]),
      var12m: painel_num_(l[8]),
      cotacao: painel_num_(l[9])
    });
  }
  return out;
}

function painel_lerAlertas_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PAINEL_CONFIG.ABA_ALERTAS);
  if (!aba) return [];
  var dados = aba.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < dados.length; r++) {
    var l = dados[r];
    if (!l[0]) continue;
    out.push({
      ativo: String(l[0]).trim(),
      tipo: String(l[1] || ''),
      valorAlvo: painel_num_(l[2]),
      base: String(l[3] || ''),
      precoAtual: painel_num_(l[4]),
      condicao: /sim|✅/i.test(String(l[5] || '')),
      status: String(l[6] || 'Ativo'),
      ultimaVerificacao: String(l[7] || ''),
      obs: String(l[8] || '')
    });
  }
  return out;
}

// Lê o resumo anual e a matriz mensal sem depender do ano "07/1905" (número
// 2026 formatado como data): casa as duas tabelas pela ORDEM das linhas.
function painel_lerPGBL_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PAINEL_CONFIG.ABA_PGBL);
  if (!aba) return null;
  var dados = aba.getDataRange().getValues();
  var pgbl = { anos: {}, importLog: [], atualizadoEm: new Date().toISOString() };

  // Resumo anual: cabeçalho "Ano | Renda ..."
  var resumo = [];
  var rResumo = painel_acharLinha_(dados, function (l) {
    return String(l[0]).trim() === 'Ano' && /renda/i.test(String(l[1]));
  });
  if (rResumo >= 0) {
    for (var r = rResumo + 1; r < dados.length; r++) {
      if (dados[r][0] === '' || dados[r][0] == null) break;
      var alq = painel_num_(dados[r][2]);
      resumo.push({
        renda: painel_num_(dados[r][1]) || 0,
        aliquota: alq == null ? 27.5 : (alq <= 1 ? alq * 100 : alq)
      });
    }
  }

  // Matriz mensal: cabeçalho "Ano | Jan | ... | Dez | Total"
  var matriz = [];
  var rMatriz = painel_acharLinha_(dados, function (l) {
    return String(l[0]).trim() === 'Ano' && String(l[1]).trim() === 'Jan';
  });
  if (rMatriz >= 0) {
    for (var r2 = rMatriz + 1; r2 < dados.length; r2++) {
      var ano = painel_extrairAno_(dados[r2][0]);
      if (!ano) break;
      var meses = {};
      for (var m = 1; m <= 12; m++) {
        var v = painel_num_(dados[r2][m]);
        if (v) meses[m] = v;
      }
      matriz.push({ ano: ano, meses: meses });
    }
  }

  // Zip por índice (ambas as tabelas estão na mesma ordem de anos).
  matriz.forEach(function (linha, i) {
    var info = resumo[i] || { renda: 0, aliquota: 27.5 };
    pgbl.anos[String(linha.ano)] = {
      renda: info.renda,
      aliquota: info.aliquota,
      metaManual: null, // limite de 12% é recalculado no painel
      meses: linha.meses
    };
  });

  pgbl.importLog = painel_lerLogs_().filter(function (l) {
    return /pgbl|gmail|aporte/i.test(l.origem + ' ' + l.mensagem);
  }).slice(0, 20).map(function (l) {
    return { data: l.quando, mensagem: l.mensagem };
  });

  return pgbl;
}

function painel_lerLogs_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PAINEL_CONFIG.ABA_LOGS);
  if (!aba || aba.getLastRow() < 2) return [];
  var n = Math.min(60, aba.getLastRow() - 1);
  var dados = aba.getRange(2, 1, n, Math.min(4, aba.getLastColumn())).getValues();
  return dados.map(function (l) {
    return { quando: String(l[0] || ''), origem: String(l[1] || 'script'), status: String(l[2] || ''), mensagem: String(l[3] || '') };
  });
}

/* ----------------- taxas do Tesouro (opcional, só se você acionar) -------- */

function painel_atualizarTaxasTesouro() {
  var resp = UrlFetchApp.fetch(PAINEL_CONFIG.TESOURO_API, { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
  if (resp.getResponseCode() !== 200) throw new Error('API do Tesouro HTTP ' + resp.getResponseCode());
  var lista = (JSON.parse(resp.getContentText()).response || {}).TrsrBdTradgList || [];
  if (!lista.length) throw new Error('Lista de títulos vazia');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(PAINEL_CONFIG.ABA_TAXAS);
  if (!aba) {
    aba = ss.insertSheet(PAINEL_CONFIG.ABA_TAXAS);
    aba.getRange(1, 1, 1, 8).setValues([['Data', 'Título', 'Vencimento',
      'Taxa investimento (% a.a.)', 'PU investimento (R$)',
      'Taxa resgate (% a.a.)', 'PU resgate (R$)', 'Indexador']]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  var hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  var vals = aba.getDataRange().getValues();
  for (var r = vals.length - 1; r >= 1; r--) if (vals[r][0] === hoje) aba.deleteRow(r + 1);

  var linhas = [];
  lista.forEach(function (item) {
    var bd = item.TrsrBd || {};
    if (!bd.nm) return;
    linhas.push([hoje, bd.nm, bd.mtrtyDt ? String(bd.mtrtyDt).slice(0, 10) : '',
      painel_num_(bd.anulInvstmtRate), painel_num_(bd.untrInvstmtVal),
      painel_num_(bd.anulRedRate), painel_num_(bd.untrRedVal),
      (bd.FinIndxs && bd.FinIndxs.nm) || '']);
  });
  if (linhas.length) {
    aba.insertRowsAfter(1, linhas.length);
    aba.getRange(2, 1, linhas.length, 8).setValues(linhas);
  }
  return 'Histórico de taxas atualizado: ' + linhas.length + ' títulos em ' + hoje + '.';
}

/* -------------------------------------------------------------- utilitários */

function painel_acharLinha_(dados, teste) {
  for (var r = 0; r < dados.length; r++) if (teste(dados[r])) return r;
  return -1;
}

function painel_extrairAno_(v) {
  if (v instanceof Date) { var y = v.getFullYear(); return y > 1990 ? y : null; }
  var m = String(v == null ? '' : v).match(/(20\d{2})/);
  return m ? Number(m[1]) : null;
}

function painel_num_(v) {
  if (v === '' || v == null) return null;
  var n = Number(v);
  return isFinite(n) ? n : null;
}

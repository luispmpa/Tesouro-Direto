/**
 * Painel Financeiro — backend Apps Script (vinculado à planilha IBOV_26-05-26).
 *
 * Este arquivo versiona, de forma equivalente, todas as automações que rodam
 * na planilha, e adiciona o Web App que alimenta o painel publicado no
 * GitHub Pages (https://luispmpa.github.io/Tesouro-Direto/).
 *
 * FUNÇÕES PRINCIPAIS
 *  - importarAportesPGBL()      lê e-mails da XP no Gmail e lança os aportes
 *                               na matriz mensal da aba PGBL (com deduplicação
 *                               pelo ID interno da mensagem + marcador visual).
 *  - verificarAlertas()         avalia a aba Alertas, atualiza "Condição
 *                               Atendida?" / "Última Verificação" e envia
 *                               e-mail quando uma condição é atingida.
 *  - atualizarTaxasTesouro()    consulta a API oficial do Tesouro Direto e
 *                               grava o histórico diário de taxas/PUs
 *                               (investimento e resgate) na aba de histórico.
 *  - doGet(e)                   Web App: expõe IBOV, PGBL, alertas e logs em
 *                               JSON para o painel, e permite disparar as
 *                               funções acima remotamente (?acao=...).
 *  - criarTodosGatilhos()       instala/reinstala os gatilhos agendados.
 *
 * SEGURANÇA
 *  - O Web App valida um token salvo em Script Properties (API_TOKEN).
 *  - Nenhuma credencial fica no front-end público; o usuário informa a URL e
 *    o token apenas no localStorage do próprio navegador.
 *
 * INSTALAÇÃO: ver docs/IMPLANTACAO.md no repositório.
 */

/* ------------------------------------------------------------------ config */

var CONFIG = {
  // Nomes das abas — ajuste se a sua planilha usar nomes diferentes.
  ABA_IBOV: 'IBOV',
  ABA_CARTEIRA: 'Tesouro Direto',
  ABA_ALERTAS: 'Alertas',
  ABA_PGBL: 'PGBL',
  ABA_LOGS: 'Logs',                      // criada automaticamente
  ABA_TAXAS: 'TaxasTD_Historico',        // criada automaticamente

  // Importação PGBL (e-mails da XP)
  GMAIL_BUSCA: 'from:(xpi.com.br OR xpinc.com.br) ("Data para débito mensal" OR "Valor solicitado")',
  GMAIL_MARCADOR: 'PGBL-Importado',

  // Alertas
  EMAIL_DESTINO: '',                     // vazio = e-mail do dono da planilha
  REENVIO_HORAS: 24,                     // não repete e-mail da mesma condição

  // API oficial do Tesouro Direto (mesma fonte da página de rendimentos)
  TESOURO_API: 'https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json',
  HISTORICO_MAX_LINHAS: 20000,
  VERSAO: '1.1.0'
};

/* ------------------------------------------------------------------- menu */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Painel Financeiro')
    .addItem('Importar aportes PGBL (Gmail)', 'importarAportesPGBL')
    .addItem('Verificar alertas agora', 'verificarAlertas')
    .addItem('Atualizar taxas do Tesouro', 'atualizarTaxasTesouro')
    .addSeparator()
    .addItem('Instalar/atualizar gatilhos', 'criarTodosGatilhos')
    .addItem('Gerar token do Web App', 'gerarTokenWebApp')
    .addToUi();
}

/* ------------------------------------------------------------------- logs */

function registrarLog(origem, status, mensagem) {
  try {
    var aba = obterOuCriarAba(CONFIG.ABA_LOGS, ['Quando', 'Origem', 'Status', 'Mensagem']);
    aba.insertRowAfter(1);
    aba.getRange(2, 1, 1, 4).setValues([[
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
      origem, status, String(mensagem).slice(0, 500)
    ]]);
    var max = 500;
    if (aba.getLastRow() > max + 1) {
      aba.deleteRows(max + 2, aba.getLastRow() - max - 1);
    }
  } catch (e) {
    console.error('Falha ao registrar log: ' + e);
  }
}

function obterOuCriarAba(nome, cabecalho) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(nome);
  if (!aba) {
    aba = ss.insertSheet(nome);
    if (cabecalho && cabecalho.length) {
      aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight('bold');
      aba.setFrozenRows(1);
    }
  }
  return aba;
}

/* ===========================================================================
 * 1. IMPORTAÇÃO DE APORTES PGBL VIA GMAIL
 *    (equivalente à automação original da planilha)
 * ======================================================================== */

function importarAportesPGBL() {
  var props = PropertiesService.getScriptProperties();
  var processados = JSON.parse(props.getProperty('PGBL_MSG_IDS') || '[]');
  var setProcessados = {};
  processados.forEach(function (id) { setProcessados[id] = true; });

  var marcador = obterOuCriarMarcador(CONFIG.GMAIL_MARCADOR);
  var threads = GmailApp.search(CONFIG.GMAIL_BUSCA, 0, 100);
  var novos = 0;
  var detalhes = [];

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      var id = msg.getId();
      if (setProcessados[id]) return; // deduplicação pelo ID interno da mensagem

      var corpo = msg.getPlainBody() || '';
      var dataM = corpo.match(/Data\s+para\s+d[ée]bito\s+mensal\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
      var valorM = corpo.match(/Valor\s+solicitado\s*:?\s*R?\$?\s*([\d.,]+)/i);
      if (!dataM || !valorM) return;

      var partes = dataM[1].split('/');
      var ano = Number(partes[2]);
      var mes = Number(partes[1]);
      var valor = parseFloat(valorM[1].replace(/\./g, '').replace(',', '.'));
      if (!ano || !mes || !(valor > 0)) return;

      lancarAportePGBL(ano, mes, valor);
      setProcessados[id] = true;
      processados.push(id);
      novos++;
      detalhes.push(dataM[1] + ' → R$ ' + valor.toFixed(2));
      thread.addLabel(marcador); // identificação visual no Gmail
    });
  });

  // Mantém só os 2000 IDs mais recentes para não estourar o limite de Properties.
  if (processados.length > 2000) processados = processados.slice(-2000);
  props.setProperty('PGBL_MSG_IDS', JSON.stringify(processados));

  var msg = novos > 0
    ? novos + ' aporte(s) importado(s) do Gmail: ' + detalhes.join('; ')
    : 'Nenhum e-mail novo de aporte PGBL encontrado.';
  registrarLog('pgbl-gmail', novos > 0 ? 'ok' : 'info', msg);
  return msg;
}

function obterOuCriarMarcador(nome) {
  return GmailApp.getUserLabelByName(nome) || GmailApp.createLabel(nome);
}

// Localiza a matriz "Ano | Jan ... Dez | Total" na aba PGBL e soma o valor
// na célula do mês/ano correspondente (cria a linha do ano se não existir).
function lancarAportePGBL(ano, mes, valor) {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_PGBL);
  if (!aba) throw new Error('Aba "' + CONFIG.ABA_PGBL + '" não encontrada.');

  var dados = aba.getDataRange().getValues();
  var headerRow = -1, colAno = -1;
  for (var r = 0; r < dados.length; r++) {
    for (var c = 0; c < dados[r].length; c++) {
      if (String(dados[r][c]).trim() === 'Ano' && String(dados[r][c + 1] || '').trim() === 'Jan') {
        headerRow = r; colAno = c; break;
      }
    }
    if (headerRow >= 0) break;
  }
  if (headerRow < 0) throw new Error('Matriz de aportes (Ano | Jan..Dez) não encontrada na aba PGBL.');

  var linhaAno = -1;
  for (var r2 = headerRow + 1; r2 < dados.length; r2++) {
    var v = dados[r2][colAno];
    if (Number(v) === ano || String(v).indexOf(String(ano)) === 0) { linhaAno = r2; break; }
    if (v === '' || v == null) break;
  }
  if (linhaAno < 0) {
    linhaAno = headerRow + 1;
    while (linhaAno < dados.length && dados[linhaAno][colAno] !== '' && dados[linhaAno][colAno] != null) linhaAno++;
    aba.getRange(linhaAno + 1, colAno + 1).setValue(ano);
  }

  var cel = aba.getRange(linhaAno + 1, colAno + 1 + mes);
  var atual = Number(cel.getValue()) || 0;
  cel.setValue(atual + valor);
}

function criarAcionadorImportacaoPGBL() {
  removerGatilhos_('importarAportesPGBL');
  ScriptApp.newTrigger('importarAportesPGBL').timeBased().everyDays(1).atHour(7).create();
  registrarLog('gatilhos', 'ok', 'Gatilho diário de importação PGBL criado (07h).');
}

/* ===========================================================================
 * 2. VERIFICAÇÃO DE ALERTAS + E-MAIL
 *    (equivalente à automação original; colunas da aba Alertas:
 *     Ativo | Tipo | Valor-Alvo | Base | Preço Atual | Condição | Status |
 *     Última Verificação | Observação)
 * ======================================================================== */

function verificarAlertas() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_ALERTAS);
  if (!aba) throw new Error('Aba "' + CONFIG.ABA_ALERTAS + '" não encontrada.');

  var props = PropertiesService.getScriptProperties();
  var enviados = JSON.parse(props.getProperty('ALERTAS_ENVIADOS') || '{}');
  var agora = new Date();
  var carimbo = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  var dados = aba.getDataRange().getValues();
  var disparos = [];

  for (var r = 1; r < dados.length; r++) {
    var linha = dados[r];
    var ativo = String(linha[0] || '').trim();
    var tipo = String(linha[1] || '').trim();
    var alvo = Number(linha[2]);
    var preco = Number(linha[4]); // coluna alimentada por GOOGLEFINANCE
    var status = String(linha[6] || '').trim();
    if (!ativo || !tipo || status.toLowerCase() !== 'ativo') continue;

    var atendida = null;
    if (isFinite(preco) && isFinite(alvo)) {
      if (/acima/i.test(tipo)) atendida = preco >= alvo;
      else if (/abaixo/i.test(tipo)) atendida = preco <= alvo;
    }

    if (atendida !== null) {
      aba.getRange(r + 1, 6).setValue(atendida ? '✅ sim' : '❌ não');
    }
    aba.getRange(r + 1, 8).setValue(carimbo);

    if (atendida === true) {
      var chave = ativo + '|' + tipo + '|' + alvo;
      var ultimo = enviados[chave] || 0;
      if (agora.getTime() - ultimo > CONFIG.REENVIO_HORAS * 3600 * 1000) {
        disparos.push('• ' + ativo + ': ' + tipo + ' R$ ' + alvo.toFixed(2) +
          ' (preço atual R$ ' + preco.toFixed(2) + ')');
        enviados[chave] = agora.getTime();
      }
    }
  }

  if (disparos.length) {
    var destino = CONFIG.EMAIL_DESTINO || Session.getEffectiveUser().getEmail();
    MailApp.sendEmail({
      to: destino,
      subject: '🔔 Alertas de preço atingidos (' + disparos.length + ')',
      body: 'Os seguintes alertas configurados na planilha foram atingidos:\n\n' +
        disparos.join('\n') +
        '\n\nVerificado em ' + carimbo +
        '\nPainel: https://luispmpa.github.io/Tesouro-Direto/#/alertas'
    });
  }

  props.setProperty('ALERTAS_ENVIADOS', JSON.stringify(enviados));
  var msg = 'Alertas verificados: ' + (dados.length - 1) + ' regra(s), ' +
    disparos.length + ' e-mail(s) de disparo.';
  registrarLog('alertas', disparos.length ? 'ok' : 'info', msg);
  return msg;
}

function criarAcionadorAlertas() {
  removerGatilhos_('verificarAlertas');
  ScriptApp.newTrigger('verificarAlertas').timeBased().everyHours(1).create();
  registrarLog('gatilhos', 'ok', 'Gatilho horário de verificação de alertas criado.');
}

/* ===========================================================================
 * 3. TAXAS DO TESOURO DIRETO — HISTÓRICO DIÁRIO
 *    Consome a API oficial (dados de investimento E de resgate). A
 *    "Rentabilidade Anual" de RESGATE é a taxa de mercado usada pelo painel
 *    na marcação a mercado.
 * ======================================================================== */

function atualizarTaxasTesouro() {
  var resposta;
  try {
    resposta = UrlFetchApp.fetch(CONFIG.TESOURO_API, {
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (resposta.getResponseCode() !== 200) {
      throw new Error('HTTP ' + resposta.getResponseCode());
    }
  } catch (e) {
    registrarLog('tesouro', 'erro', 'API do Tesouro indisponível: ' + e +
      '. Mantido o último histórico válido (fallback).');
    throw e;
  }

  var json = JSON.parse(resposta.getContentText());
  var lista = (json.response && json.response.TrsrBdTradgList) || [];
  if (!lista.length) {
    registrarLog('tesouro', 'erro', 'API retornou lista vazia — histórico mantido.');
    throw new Error('Lista de títulos vazia');
  }

  var aba = obterOuCriarAba(CONFIG.ABA_TAXAS, [
    'Data', 'Título', 'Vencimento',
    'Taxa investimento (% a.a.)', 'PU investimento (R$)',
    'Taxa resgate (% a.a.)', 'PU resgate (R$)', 'Indexador'
  ]);

  var hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

  // Remove o snapshot de hoje, se existir (atualização idempotente por dia).
  var valores = aba.getDataRange().getValues();
  for (var r = valores.length - 1; r >= 1; r--) {
    if (valores[r][0] === hoje) aba.deleteRow(r + 1);
  }

  var linhas = [];
  lista.forEach(function (item) {
    var bd = item.TrsrBd || {};
    if (!bd.nm) return;
    linhas.push([
      hoje, bd.nm,
      bd.mtrtyDt ? String(bd.mtrtyDt).slice(0, 10) : '',
      numOuVazio_(bd.anulInvstmtRate), numOuVazio_(bd.untrInvstmtVal),
      numOuVazio_(bd.anulRedRate), numOuVazio_(bd.untrRedVal),
      (bd.FinIndxs && bd.FinIndxs.nm) || ''
    ]);
  });
  if (linhas.length) {
    aba.insertRowsAfter(1, linhas.length);
    aba.getRange(2, 1, linhas.length, 8).setValues(linhas);
  }
  if (aba.getLastRow() > CONFIG.HISTORICO_MAX_LINHAS) {
    aba.deleteRows(CONFIG.HISTORICO_MAX_LINHAS + 1, aba.getLastRow() - CONFIG.HISTORICO_MAX_LINHAS);
  }

  var msg = 'Histórico de taxas atualizado: ' + linhas.length + ' títulos em ' + hoje + '.';
  registrarLog('tesouro', 'ok', msg);
  return msg;
}

function numOuVazio_(v) {
  var n = Number(v);
  return isFinite(n) ? n : '';
}

function criarAcionadorTaxas() {
  removerGatilhos_('atualizarTaxasTesouro');
  ScriptApp.newTrigger('atualizarTaxasTesouro').timeBased().everyDays(1).atHour(19).create();
  registrarLog('gatilhos', 'ok', 'Gatilho diário de taxas do Tesouro criado (19h, após o fechamento).');
}

function criarTodosGatilhos() {
  criarAcionadorImportacaoPGBL();
  criarAcionadorAlertas();
  criarAcionadorTaxas();
  SpreadsheetApp.getActiveSpreadsheet().toast('Gatilhos instalados: PGBL (diário 07h), alertas (a cada hora), taxas TD (diário 19h).');
}

function removerGatilhos_(nomeFuncao) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === nomeFuncao) ScriptApp.deleteTrigger(t);
  });
}

/* ===========================================================================
 * 4. WEB APP — endpoint JSON consumido pelo painel no GitHub Pages
 *    Publicar como: Implantar > Novo deployment > App da Web
 *    "Executar como: eu" / "Quem pode acessar: qualquer pessoa".
 *    A autorização real é feita pelo token (Script Properties: API_TOKEN).
 * ======================================================================== */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');

  if (token && p.token !== token) {
    return json_({ erro: 'Token inválido ou ausente.' });
  }

  try {
    if (p.acao) {
      var acoes = {
        importarAportesPGBL: importarAportesPGBL,
        verificarAlertas: verificarAlertas,
        atualizarTaxasTesouro: atualizarTaxasTesouro
      };
      if (!acoes[p.acao]) return json_({ erro: 'Ação desconhecida: ' + p.acao });
      return json_({ ok: true, mensagem: String(acoes[p.acao]()) });
    }

    var modulo = p.modulo || 'all';
    if (modulo === 'ping') {
      return json_({ ok: true, versao: CONFIG.VERSAO, geradoEm: new Date().toISOString() });
    }
    // Proxy ao vivo da API do Tesouro (PU/Rentabilidade de resgate = PU atual),
    // consumido pelo painel para a marcação a mercado sem depender de CORS.
    if (modulo === 'tesouro') return json_(tesouroAoVivo_());

    var payload = { versao: CONFIG.VERSAO, geradoEm: new Date().toISOString() };
    if (modulo === 'all' || modulo === 'ibov') payload.ibov = lerIBOV_();
    if (modulo === 'all' || modulo === 'pgbl') payload.pgbl = lerPGBL_();
    if (modulo === 'all' || modulo === 'alertas') payload.alertas = lerAlertas_();
    if (modulo === 'all' || modulo === 'logs') payload.logs = lerLogs_();
    return json_(payload);
  } catch (err) {
    registrarLog('webapp', 'erro', 'doGet falhou: ' + err);
    return json_({ erro: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Proxy server-side da API oficial do Tesouro (sem restrição de CORS): devolve o
// JSON BRUTO para o painel extrair PU/Rentabilidade de resgate (o "PU atual" da
// marcação a mercado). Não escreve em aba — apenas repassa a cotação ao vivo.
function tesouroAoVivo_() {
  var resp = UrlFetchApp.fetch(CONFIG.TESOURO_API, { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
  if (resp.getResponseCode() !== 200) return { erro: 'API do Tesouro HTTP ' + resp.getResponseCode() };
  try {
    return JSON.parse(resp.getContentText());
  } catch (err) {
    return { erro: 'Resposta inválida da API do Tesouro.' };
  }
}

function gerarTokenWebApp() {
  var token = Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token);
  SpreadsheetApp.getUi().alert(
    'Token do Web App gerado.\n\nCopie e cole no painel (Dados & Integrações):\n\n' + token +
    '\n\nEle fica salvo apenas em Script Properties e no seu navegador.'
  );
}

/* ----------------------------- leitura das abas --------------------------- */

// Aba IBOV: Código | Ação | Qtde Teórica | Part.(%) | Var.Diária | Var.Semanal
//           | Var.Mensal | Var.6Meses | Var.Anual | Cotação
function lerIBOV_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_IBOV);
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
      qtdeTeorica: numOuNull_(l[2]),
      part: numOuNull_(l[3]),
      varDia: numOuNull_(l[4]),
      varSemana: numOuNull_(l[5]),
      varMes: numOuNull_(l[6]),
      var6m: numOuNull_(l[7]),
      var12m: numOuNull_(l[8]),
      cotacao: numOuNull_(l[9])
    });
  }
  return out;
}

function lerAlertas_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_ALERTAS);
  if (!aba) return [];
  var dados = aba.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < dados.length; r++) {
    var l = dados[r];
    if (!l[0]) continue;
    out.push({
      ativo: String(l[0]).trim(),
      tipo: String(l[1] || ''),
      valorAlvo: numOuNull_(l[2]),
      base: String(l[3] || ''),
      precoAtual: numOuNull_(l[4]),
      condicao: /sim/i.test(String(l[5] || '')),
      status: String(l[6] || 'Ativo'),
      ultimaVerificacao: String(l[7] || ''),
      obs: String(l[8] || '')
    });
  }
  return out;
}

// Aba PGBL: painel do ano + matriz Ano x Jan..Dez. Devolve no formato que o
// painel consome: { anos: { '2026': { renda, aliquota, metaManual, meses } }, importLog }.
function lerPGBL_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_PGBL);
  if (!aba) return null;
  var dados = aba.getDataRange().getValues();

  var pgbl = { anos: {}, importLog: [], atualizadoEm: new Date().toISOString() };

  // Resumo anual: cabeçalho "Ano | Renda Tributável ... | Alíquota ..."
  var rResumo = acharLinha_(dados, function (l) {
    return String(l[0]).trim() === 'Ano' && /renda/i.test(String(l[1]));
  });
  if (rResumo >= 0) {
    for (var r = rResumo + 1; r < dados.length; r++) {
      var ano = extrairAno_(dados[r][0]);
      if (!ano) break;
      pgbl.anos[String(ano)] = {
        renda: numOuNull_(dados[r][1]) || 0,
        aliquota: (numOuNull_(dados[r][2]) || 0.275) * (Number(dados[r][2]) <= 1 ? 100 : 1),
        metaManual: null, // meta manual fica nas células amarelas; limite 12% é recalculado
        meses: {}
      };
    }
  }

  // Matriz mensal: cabeçalho "Ano | Jan | ... | Dez | Total"
  var rMatriz = acharLinha_(dados, function (l) {
    return String(l[0]).trim() === 'Ano' && String(l[1]).trim() === 'Jan';
  });
  if (rMatriz >= 0) {
    for (var r2 = rMatriz + 1; r2 < dados.length; r2++) {
      var ano2 = extrairAno_(dados[r2][0]);
      if (!ano2) break;
      var chave = String(ano2);
      if (!pgbl.anos[chave]) pgbl.anos[chave] = { renda: 0, aliquota: 27.5, metaManual: null, meses: {} };
      for (var m = 1; m <= 12; m++) {
        var v = numOuNull_(dados[r2][m]);
        if (v) pgbl.anos[chave].meses[m] = v;
      }
    }
  }

  // Histórico recente de importações (lido do log)
  pgbl.importLog = lerLogs_().filter(function (l) {
    return l.origem === 'pgbl-gmail';
  }).slice(0, 20).map(function (l) {
    return { data: l.quando, mensagem: l.mensagem };
  });

  return pgbl;
}

function lerLogs_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_LOGS);
  if (!aba || aba.getLastRow() < 2) return [];
  var n = Math.min(60, aba.getLastRow() - 1);
  var dados = aba.getRange(2, 1, n, 4).getValues();
  return dados.map(function (l) {
    return { quando: String(l[0]), origem: String(l[1]), status: String(l[2]), mensagem: String(l[3]) };
  });
}

/* -------------------------------- helpers -------------------------------- */

function acharLinha_(dados, teste) {
  for (var r = 0; r < dados.length; r++) {
    if (teste(dados[r])) return r;
  }
  return -1;
}

function extrairAno_(v) {
  if (v instanceof Date) return v.getFullYear() > 1990 ? v.getFullYear() : null;
  var m = String(v || '').match(/(20\d{2})/);
  return m ? Number(m[1]) : null;
}

function numOuNull_(v) {
  if (v === '' || v == null) return null;
  var n = Number(v);
  return isFinite(n) ? n : null;
}

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

  // Importação PGBL (e-mails da XP)
  GMAIL_BUSCA: 'from:(xpi.com.br OR xpinc.com.br) ("Data para débito mensal" OR "Valor solicitado")',
  GMAIL_MARCADOR: 'PGBL-Importado',

  // Alertas
  EMAIL_DESTINO: '',                     // vazio = e-mail do dono da planilha
  REENVIO_HORAS: 24,                     // não repete e-mail da mesma condição

  VERSAO: '2.0.0'
};

/* ------------------------------------------------------------------- menu */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Painel Financeiro')
    .addItem('Importar aportes PGBL (Gmail)', 'importarAportesPGBL')
    .addItem('Verificar alertas agora', 'verificarAlertas')
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
 * 3. PREÇOS DO TESOURO DIRETO
 *    O site do Tesouro Direto bloqueia o consumo da API pública, então os
 *    preços/taxas de resgate são informados MANUALMENTE no painel (página
 *    Tesouro Direto). O backend não consulta mais nenhuma API do Tesouro.
 * ======================================================================== */

function criarTodosGatilhos() {
  criarAcionadorImportacaoPGBL();
  criarAcionadorAlertas();
  SpreadsheetApp.getActiveSpreadsheet().toast('Gatilhos instalados: PGBL (diário 07h) e alertas (a cada hora).');
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
        verificarAlertas: verificarAlertas
      };
      if (!acoes[p.acao]) return json_({ erro: 'Ação desconhecida: ' + p.acao });
      return json_({ ok: true, mensagem: String(acoes[p.acao]()) });
    }

    var modulo = p.modulo || 'all';
    if (modulo === 'ping') {
      return json_({ ok: true, versao: CONFIG.VERSAO, geradoEm: new Date().toISOString() });
    }

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

// POST: grava no Drive a configuração de alertas vinda do painel (inclusão,
// edição, remoção). O corpo é JSON: { alertas: [{ativo,tipo,valorAlvo,base,status,obs}] }.
function doPost(e) {
  var p = (e && e.parameter) || {};
  var token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (token && p.token !== token) return json_({ erro: 'Token inválido ou ausente.' });
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    if (p.acao === 'salvarAlertas') return json_(salvarAlertasPlanilha_(body.alertas || []));
    return json_({ erro: 'Ação POST desconhecida: ' + p.acao });
  } catch (err) {
    registrarLog('webapp', 'erro', 'doPost falhou: ' + err);
    return json_({ erro: String(err) });
  }
}

// Reescreve a aba Alertas com as regras do painel. A coluna "Preço Atual" recebe
// uma fórmula GOOGLEFINANCE padrão da B3, para que novos tickers também tenham
// cotação ao vivo; "Condição" e "Última Verificação" são limpas (o robô recalcula).
// Se você usa uma fonte de preço diferente, ajuste a fórmula abaixo.
function salvarAlertasPlanilha_(alertas) {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.ABA_ALERTAS);
  if (!aba) throw new Error('Aba "' + CONFIG.ABA_ALERTAS + '" não encontrada.');
  alertas = Array.isArray(alertas) ? alertas : [];

  var anterior = Math.max(0, aba.getLastRow() - 1);
  var linhas = alertas.map(function (a, i) {
    var linha = i + 2;
    return [
      String(a.ativo || ''), String(a.tipo || ''),
      (a.valorAlvo == null || a.valorAlvo === '') ? '' : Number(a.valorAlvo),
      String(a.base || ''),
      '=IFERROR(GOOGLEFINANCE("BVMF:"&A' + linha + ');"")', // Preço Atual
      '',                                                    // Condição (robô recalcula)
      String(a.status || 'Ativo'),
      '',                                                    // Última Verificação
      String(a.obs || '')
    ];
  });
  if (linhas.length) aba.getRange(2, 1, linhas.length, 9).setValues(linhas);
  // Remove sobras quando o painel passou a ter menos alertas que a planilha.
  if (anterior > linhas.length) {
    aba.getRange(linhas.length + 2, 1, anterior - linhas.length, 9).clearContent();
  }

  var msg = 'Alertas do painel gravados na planilha: ' + linhas.length + ' regra(s).';
  registrarLog('alertas', 'ok', msg);
  return { ok: true, mensagem: msg, gravados: linhas.length };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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

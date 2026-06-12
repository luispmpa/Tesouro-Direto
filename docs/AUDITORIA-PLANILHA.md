# Auditoria da planilha Google "IBOV_26-05-26"

> Auditoria realizada em **12/06/2026** sobre a planilha
> `1kWujUEvpMRvue4rTHgN_wrfqXDjT8k1cDcGotJaHHuA` (proprietário: luispmpa@gmail.com,
> última modificação na data da auditoria). Este documento é o **mapa das abas e
> funcionalidades** exigido no escopo da migração.

## 1. Abas identificadas

| # | Aba (conteúdo) | Finalidade | Migração |
|---|---|---|---|
| 1 | **IBOV** — carteira teórica | Acompanhar os ~82 ativos do índice: código, nome, qtde teórica, participação (%), variações (diária, semanal, mensal, 6 meses, anual) e cotação atual | Módulo **IBOV / Ações** (`#/ibov`) |
| 2 | **Tesouro Direto** — carteira | 98 aportes: título, data de aplicação, quantidade, preço, valor investido e rentabilidade contratada original | Módulo **Tesouro Direto** (`#/tesouro`) |
| 3 | **Alertas** | 34 regras de alerta de preço (acima/abaixo) com valor-alvo, preço atual, condição atendida, status, última verificação e observação | Módulo **Alertas** (`#/alertas`) |
| 4 | **PGBL** | Painel do ano vigente (renda tributável, alíquota, limite 12%, meta, economia de IR), resumo 2026–2030, matriz de aportes mensais e instruções de uso | Módulo **Previdência PGBL** (`#/pgbl`) |

Abas criadas pelo novo Apps Script (não existiam): **Logs** (histórico de execução
dos robôs) e **TaxasTD_Historico** (snapshot diário das taxas oficiais).

## 2. Colunas e bases de dados

### Aba IBOV
`Código | Ação | Qtde. Teórica | Part. (%) | Var. Diária (%) | Var. Semanal (%) |
Var. Mensal (%) | Var. 6 Meses (%) | Var. Anual (%) | Cotação atual`
— mais a linha especial **Redutor** (metadado da carteira teórica da B3).

### Aba Tesouro Direto
`Título | Data aplicação | Quantidade | Preço aplicação (R$) | Valor investido (R$) |
Rentabilidade contratada original`
— 98 aportes em 9 títulos: Prefixado 2029, Prefixado JS 2033, IPCA+ 2026/2029/2032/2045/2050,
Renda+ 2065 e Selic 2031.

### Aba Alertas
`Ativo | Tipo de Alerta | Valor-Alvo | Base da Variação | Preço Atual |
Condição Atendida? | Status | Última Verificação | Observação`
— 34 regras ativas ("Preço acima"/"Preço abaixo"), incluindo ativos fora do IBOV
(LJQQ3, LUPA3, RCSL4).

### Aba PGBL
- **Painel do ano vigente (2026)**: renda tributável estimada (R$ 128.961,99),
  alíquota marginal (27,5%), limite de dedução 12% (R$ 15.475,44), meta anual,
  total aportado (R$ 1.000,00), falta para a meta, % da meta, economia de IR
  garantida e máxima.
- **Resumo anual** (2026–2030) com as mesmas colunas por ano.
- **Matriz `Ano × Jan..Dez × Total`** de aportes mensais (mai/2026 = R$ 500,
  jun/2026 = R$ 500).
- **Bloco "COMO USAR"** documentando o fluxo de importação via Gmail.

## 3. Fórmulas relevantes

| Onde | Fórmula/lógica | Equivalente no painel |
|---|---|---|
| IBOV: cotação e variações | `GOOGLEFINANCE` (cotação atual; variações por janelas: dia vs. último pregão, 7 dias, e `EDATE` p/ mês/6m/12m) | GOOGLEFINANCE **não existe fora do Sheets** → a planilha permanece a fonte "ao vivo" via Web App; o painel embarca o snapshot da auditoria como fallback |
| PGBL: limite 12% | `renda × 12%` | `calcularPainelPGBL()` em `assets/js/utils/finance.js` |
| PGBL: meta anual | meta manual ou, em branco, o limite de 12% | idem |
| PGBL: economia garantida/máxima | `alíquota × min(aportado, limite)` / `alíquota × limite` | idem |
| PGBL: totais anuais | `SOMA(Jan..Dez)` | `totalAportadoAno()` |
| Alertas: condição atendida | comparação preço atual × valor-alvo | `alertEngine.js` (front) + `verificarAlertas()` (Apps Script) |

Observação: a célula de ano "07/1905" no resumo anual da planilha é um artefato
de formatação (número 2026 formatado como data); o painel trata anos de forma
robusta (`extrairAno_` no Code.gs).

## 4. Formatações condicionais e validações

- **Alertas**: destaque visual de condição atendida (✅/❌) → migrado para badges
  (`monitorando` / `condição atingida` / `sem dados`) e linhas coloridas.
- **PGBL**: células amarelas indicam campos editáveis (renda, alíquota, meta) →
  migrado para formulário de parâmetros com persistência local.
- **IBOV**: positivos/negativos em verde/vermelho → classes `pos`/`neg` em todas
  as tabelas, com indicador de sinal.
- Validações de dados da planilha (status Ativo/Pausado, tipos de alerta) →
  selects e switches no painel; máscara e validação de data `DD/MM/AAAA` no CRUD.

## 5. Apps Script — funções, gatilhos e integrações

> **Limitação técnica documentada**: o código-fonte do script vinculado não é
> exposto pela API do Drive (somente o editor do Apps Script tem acesso). O
> comportamento foi auditado pelas instruções "COMO USAR" da própria planilha,
> pelos artefatos das abas (carimbos de verificação, marcadores) e pelos nomes
> de funções documentados. **Todas as automações foram reimplementadas de forma
> equivalente e versionada** em `apps-script/Code.gs`.

| Automação original | Evidência na planilha | Reimplementação |
|---|---|---|
| `importarAportesPGBL()` — lê e-mails da XP no Gmail, extrai "Data para débito mensal" e "Valor solicitado", lança na matriz mensal; deduplicação pelo ID interno da mensagem; marcador visual `PGBL-Importado` | bloco "COMO USAR" da aba PGBL | `importarAportesPGBL()` no Code.gs (mesma busca, mesmos campos, mesma deduplicação e marcador) |
| `criarAcionadorImportacaoPGBL()` — gatilho da importação | bloco "COMO USAR" (passo 3) | `criarAcionadorImportacaoPGBL()` — diário às 07h |
| Verificação de alertas com carimbo de data/hora | coluna "Última Verificação" preenchida em 12/06/2026 13:08:12 (gatilho ativo) | `verificarAlertas()` + `criarAcionadorAlertas()` (horário) + e-mail via `MailApp` |
| Cotações IBOV | `GOOGLEFINANCE` nas colunas de variação | permanece na planilha; exposto ao painel via `doGet` (Web App) |

**Gatilhos necessários** (instaláveis pelo menu `📊 Painel Financeiro → Instalar/atualizar gatilhos`):

1. `importarAportesPGBL` — diário (07h) — Gmail → PGBL.
2. `verificarAlertas` — a cada hora — alertas + e-mail.
3. `atualizarTaxasTesouro` — diário (19h) — histórico oficial de taxas (novo).

## 6. Dependências

- **Entre abas**: Alertas → IBOV/GOOGLEFINANCE (preço atual); PGBL painel →
  matriz mensal (totais); resumo anual → painel.
- **Entre scripts**: importação PGBL → aba PGBL → painel/percentual da meta;
  verificação de alertas → aba Alertas; todos → aba Logs (novo).

## 7. Dados sensíveis (NUNCA publicados no front-end)

| Dado | Tratamento |
|---|---|
| Renda tributável e alíquota de IR (PGBL) | **Não versionados** no repositório. Chegam só em tempo de execução (Web App autenticado por token) ou por digitação local (localStorage do navegador do usuário) |
| Aportes mensais PGBL | idem |
| Conteúdo/remetentes de e-mails da XP | permanecem exclusivamente no Apps Script (GmailApp); o painel recebe apenas valores agregados por mês |
| E-mail pessoal do usuário | não aparece no front-end; o envio de alertas usa `Session.getEffectiveUser()` dentro do Apps Script |
| URL e token do Web App | somente no localStorage do navegador; token validado contra Script Properties |

A carteira de Tesouro e os alertas de preço **já estavam públicos** no repositório
anterior (dados de exemplo do app original) e foram mantidos como seeds.

## 8. O que foi migrado × o que permaneceu no Apps Script

**Migrado para o painel web (GitHub Pages):**
- Carteira Tesouro completa + CRUD + marcação a mercado + simulações.
- Quadro IBOV (com snapshot de fallback) + busca/ordenação + gráficos.
- Painel PGBL completo (limite 12%, metas, matriz mensal, projeções).
- Motor de alertas (avaliação, ativar/pausar, histórico) + novos tipos.
- Logs, status das fontes, backups e premissas configuráveis.

**Permanece no Apps Script (ambiente seguro Google), conectado por Web App:**
- Leitura do Gmail (importação de aportes PGBL).
- Envio de alertas por e-mail (MailApp) por gatilho, 24/7.
- GOOGLEFINANCE (cotações/variações ao vivo do IBOV).
- Gatilhos agendados e histórico oficial de taxas em aba.

# Checklist de Validação e Status da Migração

## 1. Critérios de aceite (escopo original)

| Critério | Status |
|---|---|
| Todas as abas e scripts analisados | ✅ ver `AUDITORIA-PLANILHA.md` |
| Funcionalidades existentes preservadas | ✅ tabela na seção 2 |
| Dashboard organizado por páginas/módulos | ✅ 6 módulos (Dashboard, Tesouro, IBOV, PGBL, Alertas, Dados) |
| Dados do Tesouro integrados | ✅ API oficial com investimento + resgate, cache e histórico |
| Taxa de resgate parametrizando a marcação a mercado | ✅ `anulRedRate`/`untrRedVal` (ver `MARCACAO-A-MERCADO.md`) |
| Alertas existentes continuam funcionando | ✅ 34 regras migradas + e-mail preservado no Apps Script |
| Extração de e-mails continua funcionando | ✅ `importarAportesPGBL` reimplementada (Gmail/marcador/dedupe) |
| Nenhum dado sensível no front-end público | ✅ PGBL/renda/token nunca versionados |
| Visual profissional | ✅ SPA dark/light, KPIs, gráficos, tabelas ordenáveis, responsivo |
| Código organizado e documentado | ✅ módulos + 5 documentos |
| Pronto para manutenção futura | ✅ sem build, sem dependências, arquitetura documentada |

## 2. Funcionalidades preservadas (planilha/app antigo → painel)

| Origem | Funcionalidade | Onde está agora |
|---|---|---|
| App antigo | CRUD de aportes com máscara de data e autocomplete | `#/tesouro` (modal) |
| App antigo | Atualizar mercado: API oficial / upload .xlsx / manual | `#/tesouro` (modal Atualizar mercado) |
| App antigo | Exportar/importar backup JSON da carteira (formato compatível) | `#/tesouro` |
| App antigo | Restaurar dados iniciais | `#/tesouro` |
| App antigo | Filtro por título, ordenação, cards de resumo, toasts | `#/tesouro` |
| App antigo | Chaves localStorage `tesouro_portfolio`/`tesouro_market_prices` | mantidas (sem migração p/ o usuário) |
| Planilha IBOV | Quadro com variações dia/semana/mês/6m/12m + cotação | `#/ibov` (ao vivo via Web App; snapshot como fallback) |
| Planilha Alertas | 34 regras preço acima/abaixo + status + última verificação | `#/alertas` (seed) + `verificarAlertas` no Apps Script |
| Planilha PGBL | Painel 12%, meta, economia IR, resumo anual, matriz mensal | `#/pgbl` |
| Planilha PGBL | Importação de aportes via Gmail (XP) com marcador e dedupe | `apps-script/Code.gs` + botão remoto no painel |
| Apps Script | Gatilhos agendados | 3 gatilhos (`IMPLANTACAO.md` §2.4) |
| — novo | Marcação a mercado completa (IR, B3, líquido, Δtaxa, simulador) | `#/tesouro` |
| — novo | Alertas de taxa TD, variação, vencimento, meta PGBL, saúde dos dados | `#/alertas` |
| — novo | Histórico diário de taxas (local + aba `TaxasTD_Historico`) | `#/tesouro` + Apps Script |
| — novo | Logs, status de robôs, diagnóstico, backup completo, dark/light | `#/dados` |

## 3. Roteiro de teste manual

**Sem backend (só GitHub Pages):**
- [ ] As 6 rotas abrem sem erro no console (`#/`, `#/tesouro`, `#/ibov`, `#/pgbl`, `#/alertas`, `#/dados`).
- [ ] Dashboard mostra KPIs coerentes com a carteira seed (98 aportes).
- [ ] "Atualizar" (topo) busca a API do Tesouro; tabela exibe badges `API` e Δtaxa.
- [ ] Criar/editar/excluir aporte funciona e sobrevive a F5.
- [ ] Upload da planilha de resgate preenche os PUs.
- [ ] Simulador (ícone de gráfico na linha) mostra vender hoje × manter, com metodologia.
- [ ] Alertas: pausar/reativar, criar (ação e taxa TD), histórico registra disparos.
- [ ] PGBL: preencher renda → limite 12%/meta/economia calculam; matriz editável.
- [ ] Dados: exportar backup completo → limpar site data → importar → estado volta.
- [ ] Tema claro/escuro persiste; layout ok em ~375px de largura.
- [ ] Modo offline: página carrega com seeds e avisos de fallback (sem tela branca).

**Com backend (após `IMPLANTACAO.md`):**
- [ ] Diagnóstico: `✓ conectado` com latência.
- [ ] IBOV passa a indicar fonte "Planilha (ao vivo)".
- [ ] `importarAportesPGBL` remoto roda e a matriz reflete o Gmail.
- [ ] Alerta de teste dispara e-mail em até 1h; aba Logs registra.
- [ ] `TaxasTD_Historico` recebe snapshot diário.

## 4. Limitações técnicas (documentadas)

1. **Código do Apps Script original não é exportável** pela API do Drive —
   automações foram **reimplementadas de forma equivalente** a partir da
   documentação embutida na planilha (bloco "COMO USAR") e dos artefatos das
   abas. Validar lado a lado antes de remover o script antigo.
2. **GOOGLEFINANCE não existe fora do Google Sheets** — cotações ao vivo do
   IBOV dependem do Web App; sem ele, o painel usa o snapshot da auditoria
   (26/05/2026), sempre identificado como tal.
3. **CORS da API do Tesouro** pode bloquear a chamada direta no navegador;
   mitigação com proxies públicos + cache do último dado válido + upload manual.
4. **Projeções "manter até o vencimento"** usam premissas macro configuráveis
   (não são curva de juros) — metodologia exibida em cada simulação.
5. **Web App "qualquer pessoa"**: a proteção é o token; sem gerá-lo o endpoint
   fica aberto (alerta em `IMPLANTACAO.md`).
6. localStorage é por navegador/dispositivo — backups manuais recomendados
   (botões em `#/dados` e `#/tesouro`).

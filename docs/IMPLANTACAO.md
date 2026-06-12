# Guia de Implantação

Passo a passo completo: publicar o painel no GitHub Pages e conectar o backend
Apps Script (Gmail, alertas por e-mail, GOOGLEFINANCE e gatilhos).

---

## Parte 1 — Front-end no GitHub Pages

O repositório já contém o workflow `.github/workflows/deploy-pages.yml`, que
publica o site a cada push na `main`.

1. Em **Settings → Pages → Build and deployment → Source**, selecione
   **GitHub Actions** (uma única vez).
2. Faça merge/push na `main`. O site sobe em
   `https://<usuário>.github.io/Tesouro-Direto/`.
3. Para rodar localmente: `python3 -m http.server 8000` na raiz e abra
   `http://localhost:8000` (ES Modules não funcionam via `file://`).

O painel já funciona neste ponto com: carteira do Tesouro (com API oficial),
snapshot do IBOV, alertas locais e PGBL manual. A Parte 2 liga o "modo completo".

---

## Parte 2 — Backend Apps Script (planilha)

### 2.1 Instalar o código

1. Abra a planilha **IBOV_26-05-26** → **Extensões → Apps Script**.
2. Cole o conteúdo de [`apps-script/Code.gs`](../apps-script/Code.gs) em um
   arquivo novo do projeto (mantenha o script antigo até validar — nada é
   sobrescrito automaticamente).
3. Confira o bloco `CONFIG` no topo: os nomes das abas (`IBOV`,
   `Tesouro Direto`, `Alertas`, `PGBL`) devem bater com os da sua planilha.
4. Salve. Recarregue a planilha — o menu **📊 Painel Financeiro** aparece.

### 2.2 Autorizar permissões

Na primeira execução (ex.: menu → *Importar aportes PGBL*), o Google pedirá
autorização para os escopos usados:

| Escopo | Por quê |
|---|---|
| Planilhas (spreadsheets) | ler/escrever abas, logs e histórico de taxas |
| Gmail (gmail.modify) | buscar e-mails da XP e aplicar o marcador `PGBL-Importado` |
| Enviar e-mail (mail.send) | alertas por e-mail |
| Serviços externos (script.external_request) | consultar a API do Tesouro |
| Gatilhos (script.scriptapp) | criar os acionadores agendados |

### 2.3 Gerar o token e publicar o Web App

1. Menu **📊 Painel Financeiro → Gerar token do Web App** — copie o token
   (fica salvo em *Script Properties*, chave `API_TOKEN`).
2. **Implantar → Novo deployment → Tipo: App da Web**:
   - *Executar como*: **Eu**;
   - *Quem pode acessar*: **Qualquer pessoa** (a proteção é o token).
3. Copie a URL terminada em `/exec`.

### 2.4 Instalar os gatilhos

Menu **📊 Painel Financeiro → Instalar/atualizar gatilhos**. Cria:

| Função | Frequência | O que faz |
|---|---|---|
| `importarAportesPGBL` | diário, 07h | Gmail (XP) → matriz mensal da aba PGBL |
| `verificarAlertas` | a cada hora | avalia a aba Alertas e envia e-mails |
| `atualizarTaxasTesouro` | diário, 19h | snapshot oficial de taxas → `TaxasTD_Historico` |

(Equivalente ao antigo `criarAcionadorImportacaoPGBL()`, que continua existindo
para compatibilidade.)

### 2.5 Conectar o painel

No site: **Dados & Integrações → Conexão com o Apps Script** → cole a URL
`/exec` e o token → **Salvar conexão** → **🩺 Diagnóstico de conexão** (deve
mostrar `✓ conectado` com a latência). A partir daí:

- IBOV passa a vir **ao vivo** da planilha (GOOGLEFINANCE);
- PGBL sincroniza os aportes importados do Gmail;
- os botões ▶ executam as funções remotamente;
- os logs da aba `Logs` aparecem na página.

### 2.6 Endpoints expostos (referência)

```
GET {URL}?token=...&modulo=ping     → { ok, versao, geradoEm }
GET {URL}?token=...&modulo=all      → { ibov, pgbl, alertas, logs, geradoEm }
GET {URL}?token=...&modulo=ibov|pgbl|alertas|logs
GET {URL}?token=...&acao=importarAportesPGBL | verificarAlertas | atualizarTaxasTesouro
```

Erros retornam `{ "erro": "..." }`. Sem `API_TOKEN` definido o endpoint fica
aberto — **gere sempre o token**.

---

## Parte 3 — Validação pós-implantação

Siga o roteiro de [`CHECKLIST-VALIDACAO.md`](CHECKLIST-VALIDACAO.md). Resumo:

1. `modulo=ping` responde no navegador (com token).
2. Dashboard mostra "Planilha / Apps Script" como conectado.
3. *Importar aportes agora* (página PGBL) processa/marca e-mails e o valor
   aparece na matriz.
4. Um alerta de teste com condição verdadeira gera e-mail em até 1h.
5. Aba `TaxasTD_Historico` ganha um snapshot por dia.

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| `Token inválido` no diagnóstico | token diferente do Script Properties | regenerar pelo menu e recolar no painel |
| HTTP 302/HTML em vez de JSON | URL de */dev* ou deployment desatualizado | use a URL `/exec` do deployment ativo |
| IBOV continua "snapshot" | endpoint não configurado ou aba com outro nome | conferir `CONFIG.ABA_IBOV` |
| Importação PGBL não acha e-mails | filtro de busca | ajustar `CONFIG.GMAIL_BUSCA` |
| API do Tesouro falha no site | CORS/instabilidade | o painel usa proxies e o último cache válido; tente "Atualizar API" mais tarde |

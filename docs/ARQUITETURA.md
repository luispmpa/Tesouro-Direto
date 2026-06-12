# Arquitetura do Painel Financeiro

## Visão geral

O GitHub Pages só serve arquivos estáticos — não guarda segredos nem roda
tarefas agendadas. Por isso a arquitetura divide as responsabilidades em três
camadas:

```
┌─────────────────────────────────────────────────────────────────────┐
│  GitHub Pages (front-end estático, público)                         │
│  SPA em HTML/CSS/JS puro (ES Modules) — sem build, sem framework     │
│  • UI, gráficos (Chart.js), tabelas, CRUD da carteira                │
│  • Cálculos: marcação a mercado, IR, B3, PGBL, alertas               │
│  • Persistência: localStorage (dados do usuário ficam no navegador)  │
└───────────────┬─────────────────────────────┬───────────────────────┘
                │ fetch JSON (público)        │ fetch JSON (token)
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────────┐
│ API oficial Tesouro Direto │   │ Apps Script Web App (backend seguro) │
│ treasurybondsinfo.json     │   │ • doGet: IBOV, PGBL, alertas, logs   │
│ • PU/taxa investimento     │   │ • ações remotas (importar/verificar) │
│ • PU/taxa RESGATE (m.a.m.) │   └────────────────┬────────────────────┘
└───────────────────────────┘                    │ vinculado
                                                  ▼
                                  ┌─────────────────────────────────────┐
                                  │ Planilha Google "IBOV_26-05-26"      │
                                  │ • GOOGLEFINANCE (cotações IBOV)      │
                                  │ • Gmail → PGBL (gatilho diário)      │
                                  │ • Alertas + e-mail (gatilho/hora)    │
                                  │ • Logs e histórico de taxas          │
                                  └─────────────────────────────────────┘
```

**Princípios de segurança**
- Nenhum token, credencial ou dado fiscal no repositório público.
- O Web App valida `API_TOKEN` (Script Properties); o usuário guarda URL+token
  apenas no localStorage, via página *Dados & Integrações*.
- Tudo que precisa de Gmail, e-mail ou agendamento roda no Apps Script.

**Resiliência (fallback em camadas)**
1. Dado ao vivo (API do Tesouro / Web App da planilha);
2. Último dado válido em cache (localStorage, com idade exibida);
3. Seed estático migrado na auditoria (sempre disponível).

## Estrutura de arquivos

```
Tesouro-Direto/
├── index.html                  # casca da SPA (sidebar, topbar, #view)
├── assets/
│   ├── css/main.css            # design system (dark/light, cards, tabelas…)
│   └── js/
│       ├── app.js              # bootstrap: router por hash, tema, refresh global
│       ├── data/seeds.js       # dados migrados da planilha (carteira, IBOV, alertas)
│       ├── utils/
│       │   ├── format.js       # moeda/percentual/data pt-BR, escape HTML
│       │   ├── finance.js      # IR, B3, marcação a mercado, simulações, PGBL
│       │   └── ui.js           # tabela ordenável, gráficos Chart.js, modais
│       ├── services/
│       │   ├── storage.js      # chaves e acesso ao localStorage
│       │   ├── logger.js       # log de execução do front
│       │   ├── tesouroApi.js   # API oficial TD + cache + histórico de taxas
│       │   ├── sheetsBridge.js # conexão com o Web App do Apps Script
│       │   ├── dataStore.js    # estado central (carteira, IBOV, PGBL, prefs)
│       │   └── alertEngine.js  # avaliação de alertas + histórico de disparos
│       └── pages/
│           ├── dashboard.js    # visão consolidada (KPIs, distribuição, robôs)
│           ├── tesouro.js      # carteira, CRUD, mercado, simulador
│           ├── ibov.js         # carteira teórica, variações, top altas/baixas
│           ├── pgbl.js         # painel 12%, matriz mensal, projeções, Gmail
│           ├── alertas.js      # painel de alertas + histórico de disparos
│           └── dados.js        # status, conexão, premissas, logs, backup
├── apps-script/
│   └── Code.gs                 # backend completo (colar no editor da planilha)
├── docs/
│   ├── AUDITORIA-PLANILHA.md   # mapa das abas/funcionalidades migradas
│   ├── ARQUITETURA.md          # este documento
│   ├── MARCACAO-A-MERCADO.md   # metodologia de cálculo
│   ├── IMPLANTACAO.md          # GitHub Pages + Apps Script passo a passo
│   └── CHECKLIST-VALIDACAO.md  # critérios de aceite e limitações
└── .github/workflows/deploy-pages.yml   # deploy automático no Pages
```

## Fluxos principais

### Roteamento e renderização
`app.js` mapeia `#/rota → pages/*.render(view)`. Cada página é uma função pura
que recebe o contêiner, lê o estado via `dataStore`/serviços e monta o DOM.
Erros de render caem num boundary com mensagem amigável e log.

### Estado e prioridade de dados
`dataStore.js` resolve cada módulo na ordem: **ajustes do usuário (localStorage)
→ Web App (planilha) → seeds**. Chaves legadas `tesouro_portfolio` e
`tesouro_market_prices` foram mantidas — carteiras salvas em versões anteriores
do app continuam funcionando sem migração.

### Marcação a mercado
`tesouroApi.js` busca a API oficial (com 2 proxies CORS de fallback), guarda o
último retorno válido e alimenta o histórico diário de taxas.
`finance.marcarPosicao()` aplica PU de resgate, IR regressivo, taxa B3 e
compara taxa contratada × taxa atual (detalhes em `MARCACAO-A-MERCADO.md`).

### Alertas
`alertEngine.js` replica as regras da aba Alertas e soma alertas automáticos
(vencimento, meta PGBL, saúde dos dados). Disparos vão para um histórico com
janela anti-spam de 24h. **E-mails continuam no Apps Script** — o painel pode
acionar `verificarAlertas` remotamente, mas o gatilho roda sozinho.

### Logs e rastreabilidade
Todo serviço registra em `logger.js` (front) e `registrarLog` (Apps Script,
aba Logs). A página *Dados & Integrações* exibe os dois, o status de cada
fonte, o carimbo da última atualização por módulo e oferece backup/restauração
completos.

## Decisões e trade-offs

| Decisão | Motivo |
|---|---|
| SPA sem framework/build | manutenção simples, deploy direto no Pages, sem dependências para auditar |
| ES Modules nativos | organização por módulo sem bundler (Pages serve com MIME correto) |
| Planilha continua viva | GOOGLEFINANCE, Gmail e gatilhos não existem fora do Google; reescrevê-los seria perder funcionalidade |
| Token em Script Properties | o Web App "qualquer pessoa" precisa de uma barreira que não vaze no repositório |
| Seeds estáticos no repo | o painel nunca abre vazio, mesmo offline ou sem backend configurado |

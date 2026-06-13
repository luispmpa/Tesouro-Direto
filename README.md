# 📊 Painel Financeiro — Tesouro Direto · IBOV · PGBL · Alertas

Plataforma financeira pessoal publicada no GitHub Pages, nascida da migração da
planilha Google **IBOV_26-05-26** (e dos seus Apps Scripts) para um dashboard
web profissional, organizado por módulos.

🔗 **Site:** https://luispmpa.github.io/Tesouro-Direto/

> ⚠️ Ferramenta de acompanhamento pessoal. Valores e simulações são estimativas
> e **não constituem recomendação de investimento**.

---

## Módulos

| Rota | Módulo | O que faz |
|---|---|---|
| `#/` | **Dashboard** | patrimônio, investido, bruto/líquido a mercado, rentabilidade, distribuição (tipo/indexador/vencimento), alertas ativos e status dos robôs |
| `#/tesouro` | **Tesouro Direto** | carteira completa com **marcação a mercado** (PU e taxa de **resgate** oficiais), IR regressivo, taxa B3, Δ taxa contratada × atual, simulador *vender hoje × manter até o vencimento*, CRUD de aportes, atualização de cada título por Extrato Analítico Excel sem duplicatas, importação da planilha de resgate, backups |
| `#/ibov` | **IBOV / Ações** | carteira teórica do índice com variações (dia/semana/mês/6m/12m), busca, ordenação e top altas/baixas — ao vivo via planilha (GOOGLEFINANCE) quando conectado |
| `#/pgbl` | **Previdência PGBL** | limite de 12%, meta anual, economia de IR, matriz de aportes mensais (importados do **Gmail** pelo Apps Script), projeções |
| `#/alertas` | **Alertas** | as 34 regras migradas da planilha + alertas de taxa do Tesouro, vencimento, meta PGBL e saúde dos dados; histórico de disparos; e-mail continua no Apps Script |
| `#/dados` | **Dados & Integrações** | status das fontes, conexão com o Web App (URL+token só no seu navegador), premissas de cálculo, logs locais e da planilha, backup completo |

## Arquitetura (resumo)

- **GitHub Pages**: SPA estática em HTML/CSS/JS puro (ES Modules, sem build),
  gráficos com Chart.js, dados do usuário em `localStorage`.
- **API oficial do Tesouro Direto**: preços/taxas de investimento e **resgate**
  — a *Rentabilidade Anual de resgate* parametriza a marcação a mercado.
- **Apps Script (backend seguro)**: Gmail → PGBL, alertas por e-mail,
  GOOGLEFINANCE, gatilhos e histórico de taxas; exposto ao painel por Web App
  com token. **Nenhuma credencial ou dado fiscal no repositório.**

Detalhes: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/AUDITORIA-PLANILHA.md`](docs/AUDITORIA-PLANILHA.md) | mapa das abas, fórmulas, scripts e o que foi migrado |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | camadas, estrutura de arquivos, fluxos e decisões |
| [`docs/MARCACAO-A-MERCADO.md`](docs/MARCACAO-A-MERCADO.md) | metodologia de cálculo e aproximações |
| [`docs/IMPLANTACAO.md`](docs/IMPLANTACAO.md) | publicar no Pages + instalar Apps Script, permissões, token, gatilhos e endpoints |
| [`docs/CHECKLIST-VALIDACAO.md`](docs/CHECKLIST-VALIDACAO.md) | critérios de aceite, roteiro de testes e limitações |
| [`apps-script/Code.gs`](apps-script/Code.gs) | backend completo para colar no editor da planilha |

## Rodando localmente

```bash
python3 -m http.server 8000   # ou: npx serve .
# abra http://localhost:8000  (ES Modules não funcionam via file://)
```

## Publicação

Push na `main` → o workflow `.github/workflows/deploy-pages.yml` publica no
GitHub Pages automaticamente (ative *Settings → Pages → Source: GitHub Actions*
uma única vez).

## Privacidade e compatibilidade

- Dados sensíveis (renda/aportes PGBL, token) nunca vão ao repositório: vivem
  na planilha (lado Google) e/ou no `localStorage` do seu navegador.
- As chaves `tesouro_portfolio` e `tesouro_market_prices` da versão anterior
  do app foram mantidas — carteiras já salvas continuam funcionando.
- Faça backups periódicos (botões **Exportar** em `#/tesouro` e `#/dados`).

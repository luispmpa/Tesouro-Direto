# Backend Apps Script

Há **dois arquivos**, para dois cenários diferentes. Escolha **um**:

## `WebApp-Bridge.gs` — você JÁ tem a automação na planilha ✅ (caso do projeto "Alertas IBOV")

Se o seu projeto Apps Script já contém `importarAportesPGBL`, `verificarAlertas`
etc. (a automação original), **use este arquivo**. Ele:

- **não redeclara** `CONFIG` nem nenhuma função existente — tudo é prefixado
  com `PAINEL_`/`painel_`, evitando o erro
  `Identifier 'CONFIG' has already been declared`;
- adiciona **apenas** o endpoint Web App (`doGet`) em JSON que o painel consome;
- **reaproveita** as suas funções ao receber `?acao=importarAportesPGBL` /
  `?acao=verificarAlertas` (não duplica a lógica → sem risco de reimportar
  aportes em dobro).

Passos: cole o conteúdo em um arquivo novo do projeto, rode `painel_gerarToken`
uma vez (copie o token no Registro de execução), publique como App da Web e
informe URL + token no painel (*Dados & Integrações*). Seus arquivos antigos
permanecem **intactos**.

## `Code.gs` — instalação do ZERO (planilha sem automação)

Reimplementa **tudo** (importação PGBL via Gmail, alertas + e-mail, histórico de
taxas, Web App, gatilhos e menu). Use somente se a planilha ainda **não** tem
esses scripts — caso contrário haverá colisão de nomes no escopo global do
Apps Script.

---

Detalhes de instalação, permissões, token e gatilhos:
[`../docs/IMPLANTACAO.md`](../docs/IMPLANTACAO.md). O que cada função substitui na
planilha: [`../docs/AUDITORIA-PLANILHA.md`](../docs/AUDITORIA-PLANILHA.md).

> ⚠️ No Apps Script, todos os arquivos `.gs` compartilham o **mesmo escopo
> global** — diferente do front-end (ES Modules). Por isso **não** se cola o
> `Code.gs` completo por cima de um script que já existe: use o
> `WebApp-Bridge.gs`.

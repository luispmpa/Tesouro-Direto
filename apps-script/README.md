# Backend Apps Script

`Code.gs` reimplementa, de forma equivalente e versionada, as automações da
planilha **IBOV_26-05-26** (importação PGBL via Gmail, verificação de alertas
com e-mail, histórico de taxas do Tesouro) e adiciona o Web App em JSON que
alimenta o painel do GitHub Pages.

- Instalação, permissões, token e gatilhos: [`../docs/IMPLANTACAO.md`](../docs/IMPLANTACAO.md)
- O que cada função substitui na planilha: [`../docs/AUDITORIA-PLANILHA.md`](../docs/AUDITORIA-PLANILHA.md)

> O script antigo da planilha não precisa ser apagado imediatamente — rode os
> dois em paralelo até validar (a deduplicação por ID de mensagem evita
> lançamentos PGBL duplicados).

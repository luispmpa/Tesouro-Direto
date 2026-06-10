# 💰 Minha Carteira Tesouro

Painel web para acompanhar uma carteira de **Tesouro Direto**, com cálculo de
rentabilidade por **marcação a mercado**. É uma aplicação **100% estática**
(HTML, CSS e JavaScript puro) — não precisa de servidor nem de banco de dados:
todos os dados ficam salvos no seu próprio navegador (`localStorage`).

🔗 **Demo:** https://luispmpa.github.io/Tesouro-Direto/

> ⚠️ Ferramenta de acompanhamento pessoal. Os valores de saldo e rentabilidade
> são estimativas baseadas nos preços de mercado que você informar e **não
> constituem recomendação de investimento**.

---

## ✨ Funcionalidades

- 📊 **Dashboard** com Total Investido, Saldo Bruto Atual e Rentabilidade (R$ e %).
- 🧾 **Tabela de aportes** com preço de compra, valor investido, taxa contratada,
  preço de mercado, valor atual e rentabilidade por posição.
- 🏷️ **Cards de resumo por título** e **filtro** para visualizar um título específico.
- ↕️ **Ordenação** por qualquer coluna (clique no cabeçalho).
- ➕ **Cadastro, edição e exclusão** de aportes, com máscara de data e autocompletar de títulos.
- 📈 **Marcação a mercado**: busque os preços atuais **automaticamente na API
  oficial do Tesouro Direto**, importe a **planilha de resgate** (`.xlsx`,
  `.xls` ou `.csv`) ou informe manualmente.
- 💾 **Backup**: exporte a carteira em JSON e importe novamente quando quiser.
- ♻️ **Restaurar dados iniciais** de exemplo a qualquer momento.
- 🔔 **Notificações (toasts)** e validação de formulário.
- 📱 **Layout responsivo** com visual *glassmorphism*.

---

## 🚀 Como executar localmente

Por ser um site estático, basta abrir o `index.html`. Para evitar restrições do
navegador (CORS ao ler arquivos), o ideal é servir por HTTP:

```bash
# Opção 1 — Python
python3 -m http.server 8000

# Opção 2 — Node
npx serve .
```

Depois acesse `http://localhost:8000`.

---

## 📥 Importando a planilha do Tesouro

No modal **Atualizar Mercado** o botão **🔄 Buscar preços atuais** consulta a API
oficial do Tesouro Direto e preenche o preço unitário de resgate (PU de venda) de
cada título automaticamente. Caso o navegador bloqueie a chamada (CORS) ou você
prefira, também é possível enviar a planilha de resgate exportada pelo site do
Tesouro Direto. A leitura da planilha considera:

- **Coluna 1** → nome do título (deve bater exatamente com o título cadastrado);
- **Coluna 3** → *Preço unitário de resgate*.

Os preços reconhecidos são destacados em verde. Confira os valores e clique em
**Atualizar e Calcular**.

---

## 🗂️ Estrutura do projeto

```
Tesouro-Direto/
├── index.html                     # Estrutura da página e modais
├── styles.css                     # Design system (glassmorphism, tabela, toasts)
├── app.js                         # Estado, cálculos, render e interações
├── .nojekyll                      # Evita processamento Jekyll no GitHub Pages
└── .github/workflows/
    └── deploy-pages.yml           # Deploy automático no GitHub Pages
```

### Modelo de dados (cada aporte)

```js
{
  id: "aporte-...",              // identificador único
  titulo: "Tesouro IPCA+ 2045",  // nome do título
  dataAplicacao: "11/04/2024",   // DD/MM/AAAA
  quantidade: 0.1,               // fração de título
  precoUnitario: 1238.77,        // preço de compra (R$)
  valorInvestido: 123.87,        // R$ aportados
  taxaContratada: "IPCA + 6,06%" // taxa no momento da compra
}
```

Os dados são persistidos em `localStorage` nas chaves `tesouro_portfolio`
(aportes) e `tesouro_market_prices` (preços de mercado por título).

---

## 🌐 Publicando no GitHub Pages

O repositório já inclui o workflow `.github/workflows/deploy-pages.yml`, que
publica o site automaticamente a cada push na branch `main`. Para ativar:

1. Acesse **Settings → Pages** no repositório.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça um push na `main` (ou rode o workflow manualmente em **Actions**).

O site ficará disponível em `https://<usuário>.github.io/Tesouro-Direto/`.

---

## 🛠️ Tecnologias

- HTML5, CSS3 e JavaScript (sem frameworks)
- [SheetJS (xlsx)](https://sheetjs.com/) para leitura de planilhas
- Fonte [Inter](https://fonts.google.com/specimen/Inter)
- GitHub Actions + GitHub Pages para o deploy

---

## 🔒 Privacidade

Nenhum dado é enviado para servidores externos. Toda a carteira é processada e
armazenada localmente no navegador. Faça **backups periódicos** (botão
*Exportar*), pois limpar os dados do navegador apaga a carteira.

# Metodologia — Marcação a Mercado e Simulações

Este documento explica **exatamente** como o painel calcula a marcação a
mercado dos títulos do Tesouro Direto, quais dados oficiais são usados e quais
aproximações são feitas quando não há dado exato (exigência do escopo: indicar
claramente a metodologia).

## 1. Origem dos dados (atualização manual)

O site do Tesouro Direto **bloqueia** o consumo automático da API pública
(`treasurybondsinfo.json`), então o painel **não faz nenhuma chamada online**.
Os dados de mercado de cada título são informados **manualmente** pelo usuário em
*Tesouro Direto › Atualizar preços*, de duas formas:

- **digitando** o PU de resgate e, opcionalmente, a taxa de resgate atual; ou
- **importando** a planilha de resgate do site do Tesouro (.xlsx/.xls/.csv),
  que preenche os campos para conferência.

| Dado manual | Significado | Uso no painel |
|---|---|---|
| **PU de resgate** | preço unitário de venda antecipada | **preço atual** de cada posição |
| **Taxa de resgate** (opcional) | Rentabilidade Anual de resgate | **taxa atual de mercado** — Δ contra a taxa contratada |
| data de vencimento | derivada do nome do título (convenções do TD) | prazos, IR projetado, gráficos |

Os dados ficam guardados no `localStorage` do navegador. Cada atualização manual
grava uma amostra no **histórico diário de taxas** (gráfico de evolução).

## 2. Valor bruto (marcação a mercado exata)

```
valor_bruto = PU_resgate × quantidade
```

O PU de resgate **já é** o valor que o Tesouro pagaria na venda hoje — ele
embute a precificação pela taxa de resgate corrente. Por isso, com o PU
informado, a marcação reflete o valor real de venda (não é estimativa).

Prioridade do preço por posição (badge na tabela indica a origem):
1. **manual** — PU digitado pelo usuário ou importado da planilha de resgate (.xlsx/.csv);
2. **compra** — fallback no preço de aquisição (título sem dado de mercado informado), claramente sinalizado.

## 3. Valor líquido estimado

```
lucro          = valor_bruto − valor_investido
IR             = lucro > 0 ? lucro × alíquota_regressiva(dias_corridos) : 0
taxa_B3        = base × 0,20% a.a. × (dias_corridos / 365)
valor_líquido  = valor_bruto − IR − taxa_B3
```

**IR regressivo** (sobre o lucro, por dias corridos desde a aplicação):
≤180 dias → 22,5% · 181–360 → 20% · 361–720 → 17,5% · >720 → 15%.

**Taxa B3 (custódia 0,20% a.a.)** — aproximação pró-rata sobre o valor atual.
Para **Tesouro Selic**, a isenção sobre os primeiros R$ 10.000 é aplicada por
posição (`base = max(0, valor − 10.000)`). Simplificações documentadas: a B3
cobra semestralmente sobre o saldo diário e a isenção vale por investidor
(não por posição) — o painel adota a forma conservadora e contínua.

## 4. Taxa contratada × taxa atual (sinal da marcação)

A taxa contratada de cada aporte (ex.: `IPCA + 6,01%`, `11,45%`,
`SELIC + 0,098%`) é comparada com a **Rentabilidade Anual de resgate** atual do
mesmo título:

```
Δtaxa = taxa_resgate_atual − taxa_contratada
Δtaxa < 0  →  marcação A FAVOR (PU acima da curva de compra → ganho na venda)
Δtaxa > 0  →  marcação CONTRA  (PU abaixo da curva → perda na venda antecipada)
```

A tabela mostra Δ em pontos percentuais com ▲/▼; o simulador detalha o efeito.
Para o Tesouro Selic o efeito é residual (spread pequeno sobre a Selic diária).

## 5. Rentabilidades

- **Acumulada**: `lucro / investido`.
- **Anualizada**: `(valor_atual / investido)^(365 / dias) − 1` (exibida só com
  ≥30 dias de aplicação para evitar anualizações distorcidas).

## 6. Simulação: vender hoje × manter até o vencimento

**Vender hoje** usa os valores exatos da seção 2–3.

**Manter até o vencimento** é projeção e depende do tipo (premissas de IPCA e
Selic configuráveis em *Dados & Integrações*; padrão IPCA 4,5% a.a., Selic
12,0% a.a.):

| Tipo | Projeção do bruto no vencimento | Natureza |
|---|---|---|
| Prefixado (LTN) | R$ 1.000 × quantidade (valor nominal) | **exata** |
| Prefixado JS (NTN-F) | taxa contratada composta com cupons reinvestidos à mesma taxa | aproximação |
| IPCA+ / Renda+ / Educa+ | valor de mercado atual composto por `(1+IPCA proj.)×(1+taxa real contratada)−1` até o vencimento | aproximação (IPCA futuro é premissa) |
| Selic (LFT) | valor atual composto por `(1+Selic proj.)×(1+spread)−1` | aproximação |

Sobre o bruto projetado aplicam-se IR (pela alíquota do prazo **total**) e
taxa B3 acumulada, gerando o líquido projetado e a **vantagem líquida** de
manter vs. vender — sempre com a metodologia exibida no próprio modal.

## 7. Vencimentos estimados (fallback)

Quando o título não está mais na API (ex.: fora de negociação), o vencimento é
estimado pelas convenções do Tesouro: LTN/NTN-F → 01/01; LFT → 01/03;
NTN-B Principal → 15/05 (anos ímpares) / 15/08 (anos pares); Renda+/Educa+ →
15/12 do ano-base. A data oficial (`mtrtyDt`) sempre tem prioridade.

## 8. Limitações conhecidas

- Sem API e sem preço manual, a posição fica avaliada **ao preço de compra**
  (badge `compra`) — sem marcação, mas nunca silenciosamente.
- A projeção de IPCA+/Selic usa premissas macro do usuário; não é curva de juros.
- Renda+ é tratado como acumulação até a conversão (não modela as 240 parcelas).
- A taxa B3 real pode divergir centavos da aproximação pró-rata contínua.

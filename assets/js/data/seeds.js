// Dados migrados da planilha Google "IBOV_26-05-26" (auditoria de 12/06/2026).
// A carteira Tesouro espelha a aba "Tesouro Direto"; IBOV espelha a carteira teórica
// importada da B3; os alertas espelham a aba "Alertas" (valores-alvo e status).
// Dados do módulo PGBL NÃO são versionados aqui por conterem informação fiscal sensível —
// eles chegam apenas em tempo de execução via endpoint do Apps Script ou digitação local.

export const CARTEIRA_SEED = [
  {
    "id": "Tesouro-Prefixado-2029-02-10-2023-34.04",
    "titulo": "Tesouro Prefixado 2029",
    "dataAplicacao": "02/10/2023",
    "quantidade": 0.06,
    "precoUnitario": 567.48,
    "valorInvestido": 34.04,
    "taxaContratada": "11,45%"
  },
  {
    "id": "Tesouro-Prefixado-2029-01-11-2023-34.02",
    "titulo": "Tesouro Prefixado 2029",
    "dataAplicacao": "01/11/2023",
    "quantidade": 0.06,
    "precoUnitario": 567.11,
    "valorInvestido": 34.02,
    "taxaContratada": "11,66%"
  },
  {
    "id": "Tesouro-Prefixado-com-Juros-Semestrais-2033-06-10-2023-46.15",
    "titulo": "Tesouro Prefixado com Juros Semestrais 2033",
    "dataAplicacao": "06/10/2023",
    "quantidade": 0.05,
    "precoUnitario": 923.14,
    "valorInvestido": 46.15,
    "taxaContratada": "11,98%"
  },
  {
    "id": "Tesouro-IPCA+-2026-22-11-2021-58.9",
    "titulo": "Tesouro IPCA+ 2026",
    "dataAplicacao": "22/11/2021",
    "quantidade": 0.02,
    "precoUnitario": 2945.05,
    "valorInvestido": 58.9,
    "taxaContratada": "IPCA + 5,17%"
  },
  {
    "id": "Tesouro-IPCA+-2045-06-10-2023-82.69",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "06/10/2023",
    "quantidade": 0.07,
    "precoUnitario": 1181.32,
    "valorInvestido": 82.69,
    "taxaContratada": "IPCA + 6,01%"
  },
  {
    "id": "Tesouro-IPCA+-2045-06-10-2023-70.87",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "06/10/2023",
    "quantidade": 0.06,
    "precoUnitario": 1181.32,
    "valorInvestido": 70.87,
    "taxaContratada": "IPCA + 6,01%"
  },
  {
    "id": "Tesouro-IPCA+-2045-23-10-2023-294.49",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "23/10/2023",
    "quantidade": 0.25,
    "precoUnitario": 1177.98,
    "valorInvestido": 294.49,
    "taxaContratada": "IPCA + 6,04%"
  },
  {
    "id": "Tesouro-IPCA+-2045-20-10-2023-305.55",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "20/10/2023",
    "quantidade": 0.26,
    "precoUnitario": 1175.21,
    "valorInvestido": 305.55,
    "taxaContratada": "IPCA + 6,05%"
  },
  {
    "id": "Tesouro-IPCA+-2045-11-04-2024-123.87",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "11/04/2024",
    "quantidade": 0.1,
    "precoUnitario": 1238.77,
    "valorInvestido": 123.87,
    "taxaContratada": "IPCA + 6,06%"
  },
  {
    "id": "Tesouro-IPCA+-2045-27-05-2024-49.59",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "27/05/2024",
    "quantidade": 0.04,
    "precoUnitario": 1239.89,
    "valorInvestido": 49.59,
    "taxaContratada": "IPCA + 6,12%"
  },
  {
    "id": "Tesouro-IPCA+-2045-28-05-2024-49.61",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "28/05/2024",
    "quantidade": 0.04,
    "precoUnitario": 1240.32,
    "valorInvestido": 49.61,
    "taxaContratada": "IPCA + 6,12%"
  },
  {
    "id": "Tesouro-IPCA+-2045-27-05-2024-98.8",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "27/05/2024",
    "quantidade": 0.08,
    "precoUnitario": 1235.02,
    "valorInvestido": 98.8,
    "taxaContratada": "IPCA + 6,14%"
  },
  {
    "id": "Tesouro-IPCA+-2045-28-05-2024-148.25",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "28/05/2024",
    "quantidade": 0.12,
    "precoUnitario": 1235.46,
    "valorInvestido": 148.25,
    "taxaContratada": "IPCA + 6,14%"
  },
  {
    "id": "Tesouro-IPCA+-2045-28-05-2024-147.67",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "28/05/2024",
    "quantidade": 0.12,
    "precoUnitario": 1230.62,
    "valorInvestido": 147.67,
    "taxaContratada": "IPCA + 6,16%"
  },
  {
    "id": "Tesouro-IPCA+-2045-31-05-2024-98.58",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "31/05/2024",
    "quantidade": 0.08,
    "precoUnitario": 1232.29,
    "valorInvestido": 98.58,
    "taxaContratada": "IPCA + 6,16%"
  },
  {
    "id": "Tesouro-IPCA+-2045-05-06-2024-98.49",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "05/06/2024",
    "quantidade": 0.08,
    "precoUnitario": 1231.24,
    "valorInvestido": 98.49,
    "taxaContratada": "IPCA + 6,17%"
  },
  {
    "id": "Tesouro-IPCA+-2045-29-05-2024-195.88",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "29/05/2024",
    "quantidade": 0.16,
    "precoUnitario": 1224.28,
    "valorInvestido": 195.88,
    "taxaContratada": "IPCA + 6,19%"
  },
  {
    "id": "Tesouro-IPCA+-2045-06-06-2024-243.93",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "06/06/2024",
    "quantidade": 0.2,
    "precoUnitario": 1219.68,
    "valorInvestido": 243.93,
    "taxaContratada": "IPCA + 6,22%"
  },
  {
    "id": "Tesouro-IPCA+-2045-10-06-2024-145.36",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "10/06/2024",
    "quantidade": 0.12,
    "precoUnitario": 1211.38,
    "valorInvestido": 145.36,
    "taxaContratada": "IPCA + 6,26%"
  },
  {
    "id": "Tesouro-IPCA+-2029-29-08-2024-64.93",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "29/08/2024",
    "quantidade": 0.02,
    "precoUnitario": 3246.53,
    "valorInvestido": 64.93,
    "taxaContratada": "IPCA + 6,29%"
  },
  {
    "id": "Tesouro-IPCA+-2045-19-07-2024-36.45",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "19/07/2024",
    "quantidade": 0.03,
    "precoUnitario": 1215.07,
    "valorInvestido": 36.45,
    "taxaContratada": "IPCA + 6,30%"
  },
  {
    "id": "Tesouro-IPCA+-2045-24-06-2024-48.2",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "24/06/2024",
    "quantidade": 0.04,
    "precoUnitario": 1205.09,
    "valorInvestido": 48.2,
    "taxaContratada": "IPCA + 6,31%"
  },
  {
    "id": "Tesouro-IPCA+-2045-21-06-2024-95.99",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "21/06/2024",
    "quantidade": 0.08,
    "precoUnitario": 1199.97,
    "valorInvestido": 95.99,
    "taxaContratada": "IPCA + 6,33%"
  },
  {
    "id": "Tesouro-IPCA+-2045-20-06-2024-143.91",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "20/06/2024",
    "quantidade": 0.12,
    "precoUnitario": 1199.27,
    "valorInvestido": 143.91,
    "taxaContratada": "IPCA + 6,33%"
  },
  {
    "id": "Tesouro-IPCA+-2029-30-08-2024-32.4",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "30/08/2024",
    "quantidade": 0.01,
    "precoUnitario": 3240.24,
    "valorInvestido": 32.4,
    "taxaContratada": "IPCA + 6,34%"
  },
  {
    "id": "Tesouro-IPCA+-2045-23-07-2024-48.25",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "23/07/2024",
    "quantidade": 0.04,
    "precoUnitario": 1206.49,
    "valorInvestido": 48.25,
    "taxaContratada": "IPCA + 6,34%"
  },
  {
    "id": "Tesouro-IPCA+-2045-12-06-2024-489.54",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "12/06/2024",
    "quantidade": 0.41,
    "precoUnitario": 1194.01,
    "valorInvestido": 489.54,
    "taxaContratada": "IPCA + 6,34%"
  },
  {
    "id": "Tesouro-IPCA+-2045-09-07-2024-48.01",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "09/07/2024",
    "quantidade": 0.04,
    "precoUnitario": 1200.47,
    "valorInvestido": 48.01,
    "taxaContratada": "IPCA + 6,35%"
  },
  {
    "id": "Tesouro-IPCA+-2045-18-06-2024-95.31",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "18/06/2024",
    "quantidade": 0.08,
    "precoUnitario": 1191.41,
    "valorInvestido": 95.31,
    "taxaContratada": "IPCA + 6,36%"
  },
  {
    "id": "Tesouro-IPCA+-2029-09-07-2024-31.94",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "09/07/2024",
    "quantidade": 0.01,
    "precoUnitario": 3194.67,
    "valorInvestido": 31.94,
    "taxaContratada": "IPCA + 6,37%"
  },
  {
    "id": "Tesouro-IPCA+-2045-26-06-2024-189.59",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "26/06/2024",
    "quantidade": 0.16,
    "precoUnitario": 1184.95,
    "valorInvestido": 189.59,
    "taxaContratada": "IPCA + 6,40%"
  },
  {
    "id": "Tesouro-IPCA+-2045-28-06-2024-590.57",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "28/06/2024",
    "quantidade": 0.5,
    "precoUnitario": 1181.14,
    "valorInvestido": 590.57,
    "taxaContratada": "IPCA + 6,42%"
  },
  {
    "id": "Tesouro-IPCA+-2045-03-07-2024-35.12",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "03/07/2024",
    "quantidade": 0.03,
    "precoUnitario": 1170.89,
    "valorInvestido": 35.12,
    "taxaContratada": "IPCA + 6,47%"
  },
  {
    "id": "Tesouro-IPCA+-2045-01-07-2024-994.56",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "01/07/2024",
    "quantidade": 0.85,
    "precoUnitario": 1170.08,
    "valorInvestido": 994.56,
    "taxaContratada": "IPCA + 6,47%"
  },
  {
    "id": "Tesouro-IPCA+-2045-16-10-2024-155.52",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "16/10/2024",
    "quantidade": 0.13,
    "precoUnitario": 1196.31,
    "valorInvestido": 155.52,
    "taxaContratada": "IPCA + 6,50%"
  },
  {
    "id": "Tesouro-IPCA+-2045-02-07-2024-93.09",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "02/07/2024",
    "quantidade": 0.08,
    "precoUnitario": 1163.67,
    "valorInvestido": 93.09,
    "taxaContratada": "IPCA + 6,50%"
  },
  {
    "id": "Tesouro-IPCA+-2029-19-09-2024-193.69",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "19/09/2024",
    "quantidade": 0.06,
    "precoUnitario": 3228.26,
    "valorInvestido": 193.69,
    "taxaContratada": "IPCA + 6,52%"
  },
  {
    "id": "Tesouro-IPCA+-2045-02-07-2024-127.5",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "02/07/2024",
    "quantidade": 0.11,
    "precoUnitario": 1159.14,
    "valorInvestido": 127.5,
    "taxaContratada": "IPCA + 6,52%"
  },
  {
    "id": "Tesouro-IPCA+-2029-03-07-2024-31.63",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "03/07/2024",
    "quantidade": 0.01,
    "precoUnitario": 3163.75,
    "valorInvestido": 31.63,
    "taxaContratada": "IPCA + 6,55%"
  },
  {
    "id": "Tesouro-IPCA+-2029-20-09-2024-322.52",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "20/09/2024",
    "quantidade": 0.1,
    "precoUnitario": 3225.29,
    "valorInvestido": 322.52,
    "taxaContratada": "IPCA + 6,56%"
  },
  {
    "id": "Tesouro-IPCA+-2029-02-07-2024-94.79",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "02/07/2024",
    "quantidade": 0.03,
    "precoUnitario": 3159.78,
    "valorInvestido": 94.79,
    "taxaContratada": "IPCA + 6,57%"
  },
  {
    "id": "Tesouro-IPCA+-2045-17-10-2024-494.05",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "17/10/2024",
    "quantidade": 0.42,
    "precoUnitario": 1176.32,
    "valorInvestido": 494.05,
    "taxaContratada": "IPCA + 6,59%"
  },
  {
    "id": "Tesouro-IPCA+-2029-03-10-2024-64.6",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "03/10/2024",
    "quantidade": 0.02,
    "precoUnitario": 3230.28,
    "valorInvestido": 64.6,
    "taxaContratada": "IPCA + 6,61%"
  },
  {
    "id": "Tesouro-IPCA+-2029-07-10-2024-32.31",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "07/10/2024",
    "quantidade": 0.01,
    "precoUnitario": 3231.13,
    "valorInvestido": 32.31,
    "taxaContratada": "IPCA + 6,63%"
  },
  {
    "id": "Tesouro-IPCA+-2029-02-07-2024-125.93",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "02/07/2024",
    "quantidade": 0.04,
    "precoUnitario": 3148.34,
    "valorInvestido": 125.93,
    "taxaContratada": "IPCA + 6,65%"
  },
  {
    "id": "Tesouro-IPCA+-2029-09-10-2024-96.91",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "09/10/2024",
    "quantidade": 0.03,
    "precoUnitario": 3230.47,
    "valorInvestido": 96.91,
    "taxaContratada": "IPCA + 6,65%"
  },
  {
    "id": "Tesouro-IPCA+-2045-23-10-2024-244.22",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "23/10/2024",
    "quantidade": 0.21,
    "precoUnitario": 1162.97,
    "valorInvestido": 244.22,
    "taxaContratada": "IPCA + 6,66%"
  },
  {
    "id": "Tesouro-IPCA+-2029-09-10-2024-96.7",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "09/10/2024",
    "quantidade": 0.03,
    "precoUnitario": 3223.59,
    "valorInvestido": 96.7,
    "taxaContratada": "IPCA + 6,70%"
  },
  {
    "id": "Tesouro-IPCA+-2045-24-10-2024-345.05",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "24/10/2024",
    "quantidade": 0.3,
    "precoUnitario": 1150.17,
    "valorInvestido": 345.05,
    "taxaContratada": "IPCA + 6,72%"
  },
  {
    "id": "Tesouro-IPCA+-2029-23-09-2024-543.83",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "23/09/2024",
    "quantidade": 0.17,
    "precoUnitario": 3199.0,
    "valorInvestido": 543.83,
    "taxaContratada": "IPCA + 6,76%"
  },
  {
    "id": "Tesouro-IPCA+-2045-31-10-2024-205.6",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "31/10/2024",
    "quantidade": 0.18,
    "precoUnitario": 1142.27,
    "valorInvestido": 205.6,
    "taxaContratada": "IPCA + 6,77%"
  },
  {
    "id": "Tesouro-IPCA+-2045-06-11-2024-148.8",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "06/11/2024",
    "quantidade": 0.13,
    "precoUnitario": 1144.67,
    "valorInvestido": 148.8,
    "taxaContratada": "IPCA + 6,77%"
  },
  {
    "id": "Tesouro-IPCA+-2029-23-10-2024-96.8",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "23/10/2024",
    "quantidade": 0.03,
    "precoUnitario": 3226.74,
    "valorInvestido": 96.8,
    "taxaContratada": "IPCA + 6,79%"
  },
  {
    "id": "Tesouro-IPCA+-2029-23-10-2024-128.96",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "23/10/2024",
    "quantidade": 0.04,
    "precoUnitario": 3224.01,
    "valorInvestido": 128.96,
    "taxaContratada": "IPCA + 6,81%"
  },
  {
    "id": "Tesouro-IPCA+-2045-09-12-2024-399.95",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "09/12/2024",
    "quantidade": 0.35,
    "precoUnitario": 1142.74,
    "valorInvestido": 399.95,
    "taxaContratada": "IPCA + 6,83%"
  },
  {
    "id": "Tesouro-IPCA+-2029-24-10-2024-193.27",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "24/10/2024",
    "quantidade": 0.06,
    "precoUnitario": 3221.31,
    "valorInvestido": 193.27,
    "taxaContratada": "IPCA + 6,84%"
  },
  {
    "id": "Tesouro-IPCA+-2045-10-12-2024-294.56",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "10/12/2024",
    "quantidade": 0.26,
    "precoUnitario": 1132.95,
    "valorInvestido": 294.56,
    "taxaContratada": "IPCA + 6,88%"
  },
  {
    "id": "Tesouro-IPCA+-2029-31-10-2024-225.62",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "31/10/2024",
    "quantidade": 0.07,
    "precoUnitario": 3223.18,
    "valorInvestido": 225.62,
    "taxaContratada": "IPCA + 6,89%"
  },
  {
    "id": "Tesouro-IPCA+-2029-01-11-2024-289.82",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "01/11/2024",
    "quantidade": 0.09,
    "precoUnitario": 3220.33,
    "valorInvestido": 289.82,
    "taxaContratada": "IPCA + 6,93%"
  },
  {
    "id": "Tesouro-IPCA+-2029-13-11-2024-32.31",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "13/11/2024",
    "quantidade": 0.01,
    "precoUnitario": 3231.87,
    "valorInvestido": 32.31,
    "taxaContratada": "IPCA + 6,94%"
  },
  {
    "id": "Tesouro-IPCA+-2029-27-11-2024-32.42",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "27/11/2024",
    "quantidade": 0.01,
    "precoUnitario": 3242.63,
    "valorInvestido": 32.42,
    "taxaContratada": "IPCA + 6,95%"
  },
  {
    "id": "Tesouro-IPCA+-2045-16-12-2024-798.94",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "16/12/2024",
    "quantidade": 0.72,
    "precoUnitario": 1109.65,
    "valorInvestido": 798.94,
    "taxaContratada": "IPCA + 7,00%"
  },
  {
    "id": "Tesouro-IPCA+-2029-13-11-2024-225.57",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "13/11/2024",
    "quantidade": 0.07,
    "precoUnitario": 3222.47,
    "valorInvestido": 225.57,
    "taxaContratada": "IPCA + 7,01%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-17-12-2025-101.6",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "17/12/2025",
    "quantidade": 0.56,
    "precoUnitario": 181.43,
    "valorInvestido": 101.6,
    "taxaContratada": "IPCA + 7,01%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-28-04-2026-100.52",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "28/04/2026",
    "quantidade": 0.53,
    "precoUnitario": 189.67,
    "valorInvestido": 100.52,
    "taxaContratada": "IPCA + 7,02%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-20-05-2026-51.2",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "20/05/2026",
    "quantidade": 0.27,
    "precoUnitario": 189.65,
    "valorInvestido": 51.2,
    "taxaContratada": "IPCA + 7,04%"
  },
  {
    "id": "Tesouro-IPCA+-2029-27-11-2024-322.92",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "27/11/2024",
    "quantidade": 0.1,
    "precoUnitario": 3229.26,
    "valorInvestido": 322.92,
    "taxaContratada": "IPCA + 7,05%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-22-12-2025-101.34",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "22/12/2025",
    "quantidade": 0.57,
    "precoUnitario": 177.8,
    "valorInvestido": 101.34,
    "taxaContratada": "IPCA + 7,06%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-18-12-2025-69.26",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "18/12/2025",
    "quantidade": 0.39,
    "precoUnitario": 177.6,
    "valorInvestido": 69.26,
    "taxaContratada": "IPCA + 7,06%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-19-03-2026-51.02",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "19/03/2026",
    "quantidade": 0.28,
    "precoUnitario": 182.22,
    "valorInvestido": 51.02,
    "taxaContratada": "IPCA + 7,07%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-13-01-2026-100.18",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "13/01/2026",
    "quantidade": 0.57,
    "precoUnitario": 175.77,
    "valorInvestido": 100.18,
    "taxaContratada": "IPCA + 7,10%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-23-12-2025-127.67",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "23/12/2025",
    "quantidade": 0.73,
    "precoUnitario": 174.9,
    "valorInvestido": 127.67,
    "taxaContratada": "IPCA + 7,10%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-21-05-2026-101.69",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "21/05/2026",
    "quantidade": 0.55,
    "precoUnitario": 184.9,
    "valorInvestido": 101.69,
    "taxaContratada": "IPCA + 7,10%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-26-05-2026-151.74",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "26/05/2026",
    "quantidade": 0.83,
    "precoUnitario": 182.82,
    "valorInvestido": 151.74,
    "taxaContratada": "IPCA + 7,13%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-05-06-2026-151.66",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "05/06/2026",
    "quantidade": 0.83,
    "precoUnitario": 182.73,
    "valorInvestido": 151.66,
    "taxaContratada": "IPCA + 7,14%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-24-03-2026-100.9",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "24/03/2026",
    "quantidade": 0.57,
    "precoUnitario": 177.03,
    "valorInvestido": 100.9,
    "taxaContratada": "IPCA + 7,14%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-20-01-2026-100.4",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "20/01/2026",
    "quantidade": 0.58,
    "precoUnitario": 173.12,
    "valorInvestido": 100.4,
    "taxaContratada": "IPCA + 7,14%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-15-01-2026-201.35",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "15/01/2026",
    "quantidade": 1.18,
    "precoUnitario": 170.64,
    "valorInvestido": 201.35,
    "taxaContratada": "IPCA + 7,17%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-21-08-2025-39.08",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "21/08/2025",
    "quantidade": 0.24,
    "precoUnitario": 162.84,
    "valorInvestido": 39.08,
    "taxaContratada": "IPCA + 7,19%"
  },
  {
    "id": "Tesouro-IPCA+-2045-17-12-2024-499.54",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "17/12/2024",
    "quantidade": 0.47,
    "precoUnitario": 1062.87,
    "valorInvestido": 499.54,
    "taxaContratada": "IPCA + 7,23%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-12-03-2025-48.95",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "12/03/2025",
    "quantidade": 0.33,
    "precoUnitario": 148.36,
    "valorInvestido": 48.95,
    "taxaContratada": "IPCA + 7,29%"
  },
  {
    "id": "Tesouro-IPCA+-2045-16-01-2025-295.03",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "16/01/2025",
    "quantidade": 0.28,
    "precoUnitario": 1053.68,
    "valorInvestido": 295.03,
    "taxaContratada": "IPCA + 7,33%"
  },
  {
    "id": "Tesouro-Renda+-Aposentadoria-Extra-2065-18-03-2025-63.75",
    "titulo": "Tesouro Renda+ Aposentadoria Extra 2065",
    "dataAplicacao": "18/03/2025",
    "quantidade": 0.44,
    "precoUnitario": 144.9,
    "valorInvestido": 63.75,
    "taxaContratada": "IPCA + 7,35%"
  },
  {
    "id": "Tesouro-IPCA+-2029-09-12-2024-191.82",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "09/12/2024",
    "quantidade": 0.06,
    "precoUnitario": 3197.04,
    "valorInvestido": 191.82,
    "taxaContratada": "IPCA + 7,38%"
  },
  {
    "id": "Tesouro-IPCA+-2045-20-01-2025-31.21",
    "titulo": "Tesouro IPCA+ 2045",
    "dataAplicacao": "20/01/2025",
    "quantidade": 0.03,
    "precoUnitario": 1040.54,
    "valorInvestido": 31.21,
    "taxaContratada": "IPCA + 7,40%"
  },
  {
    "id": "Tesouro-IPCA+-2050-28-02-2025-65.23",
    "titulo": "Tesouro IPCA+ 2050",
    "dataAplicacao": "28/02/2025",
    "quantidade": 0.09,
    "precoUnitario": 724.78,
    "valorInvestido": 65.23,
    "taxaContratada": "IPCA + 7,43%"
  },
  {
    "id": "Tesouro-IPCA+-2050-06-02-2025-35.01",
    "titulo": "Tesouro IPCA+ 2050",
    "dataAplicacao": "06/02/2025",
    "quantidade": 0.05,
    "precoUnitario": 700.25,
    "valorInvestido": 35.01,
    "taxaContratada": "IPCA + 7,52%"
  },
  {
    "id": "Tesouro-IPCA+-2029-16-12-2024-285.9",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "16/12/2024",
    "quantidade": 0.09,
    "precoUnitario": 3176.7,
    "valorInvestido": 285.9,
    "taxaContratada": "IPCA + 7,61%"
  },
  {
    "id": "Tesouro-IPCA+-2029-18-12-2024-126.01",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "18/12/2024",
    "quantidade": 0.04,
    "precoUnitario": 3150.36,
    "valorInvestido": 126.01,
    "taxaContratada": "IPCA + 7,84%"
  },
  {
    "id": "Tesouro-IPCA+-2029-18-12-2024-126.01-b",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "18/12/2024",
    "quantidade": 0.04,
    "precoUnitario": 3150.36,
    "valorInvestido": 126.01,
    "taxaContratada": "IPCA + 7,84%"
  },
  {
    "id": "Tesouro-IPCA+-2029-19-12-2024-220.54",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "19/12/2024",
    "quantidade": 0.07,
    "precoUnitario": 3150.67,
    "valorInvestido": 220.54,
    "taxaContratada": "IPCA + 7,85%"
  },
  {
    "id": "Tesouro-IPCA+-2029-2-1-2025-158.14",
    "titulo": "Tesouro IPCA+ 2029",
    "dataAplicacao": "2/1/2025",
    "quantidade": 0.05,
    "precoUnitario": 3162.94,
    "valorInvestido": 158.14,
    "taxaContratada": "IPCA + 7,87%"
  },
  {
    "id": "Tesouro-IPCA+-2032-9-6-2026-173.38",
    "titulo": "Tesouro IPCA+ 2032",
    "dataAplicacao": "9/6/2026",
    "quantidade": 1.0,
    "precoUnitario": 173.38,
    "valorInvestido": 173.38,
    "taxaContratada": "IPCA + 8,32"
  },
  {
    "id": "Tesouro-Selic-2031-05-06-2026-190.94",
    "titulo": "Tesouro Selic 2031",
    "dataAplicacao": "05/06/2026",
    "quantidade": 0.01,
    "precoUnitario": 19094.13,
    "valorInvestido": 190.94,
    "taxaContratada": "SELIC + 0,074%"
  },
  {
    "id": "Tesouro-Selic-2031-08-04-2026-3923.98",
    "titulo": "Tesouro Selic 2031",
    "dataAplicacao": "08/04/2026",
    "quantidade": 0.21,
    "precoUnitario": 18685.66,
    "valorInvestido": 3923.98,
    "taxaContratada": "SELIC + 0,086%"
  },
  {
    "id": "Tesouro-Selic-2031-25-03-2026-3717.53",
    "titulo": "Tesouro Selic 2031",
    "dataAplicacao": "25/03/2026",
    "quantidade": 0.2,
    "precoUnitario": 18587.65,
    "valorInvestido": 3717.53,
    "taxaContratada": "SELIC + 0,093%"
  },
  {
    "id": "Tesouro-Selic-2031-27-01-2026-45464.6",
    "titulo": "Tesouro Selic 2031",
    "dataAplicacao": "27/01/2026",
    "quantidade": 2.5,
    "precoUnitario": 18185.84,
    "valorInvestido": 45464.6,
    "taxaContratada": "SELIC + 0,098%"
  },
  {
    "id": "Tesouro-IPCA+-2032-10-06-2026-489.81",
    "titulo": "Tesouro IPCA+ 2032",
    "dataAplicacao": "10/06/2026",
    "quantidade": 1.0,
    "precoUnitario": 489.81,
    "valorInvestido": 489.81,
    "taxaContratada": "IPCA + 8,38"
  }
];

export const IBOV_SEED = {
  "snapshotLabel": "Carteira teórica do dia 26/05/2026",
  "ativos": [
    {
      "codigo": "WEGE3",
      "acao": "WEG",
      "qtdeTeorica": 1485954732.0,
      "part": 0.02603,
      "varDia": 0.013223,
      "varSemana": 0.010598,
      "varMes": -0.011062,
      "var6m": -0.133481,
      "var12m": 0.015381,
      "cotacao": 42.91
    },
    {
      "codigo": "TOTS3",
      "acao": "TOTVS",
      "qtdeTeorica": 533997411.0,
      "part": 0.00689,
      "varDia": -0.000999,
      "varSemana": -0.093353,
      "varMes": -0.091707,
      "var6m": -0.350995,
      "var12m": -0.273542,
      "cotacao": 30.01
    },
    {
      "codigo": "MBRF3",
      "acao": "MARFRIG",
      "qtdeTeorica": 761175338.0,
      "part": 0.005,
      "varDia": -0.010625,
      "varSemana": 0.004442,
      "varMes": -0.062759,
      "var6m": -0.20292,
      "var12m": -0.373813,
      "cotacao": 15.83
    },
    {
      "codigo": "USIM5",
      "acao": "USIMINAS",
      "qtdeTeorica": 518256757.0,
      "part": 0.0021,
      "varDia": 0.014747,
      "varSemana": -0.026525,
      "varMes": 0.227425,
      "var6m": 0.853535,
      "var12m": 1.171598,
      "cotacao": 11.01
    },
    {
      "codigo": "GGBR4",
      "acao": "GERDAU",
      "qtdeTeorica": 1258208269.0,
      "part": 0.01231,
      "varDia": 0.010076,
      "varSemana": 0.024702,
      "varMes": 0.018628,
      "var6m": 0.207225,
      "var12m": 0.421986,
      "cotacao": 24.06
    },
    {
      "codigo": "GOAU4",
      "acao": "GERDAU MET",
      "qtdeTeorica": 830837767.0,
      "part": 0.00349,
      "varDia": 0.018217,
      "varSemana": 0.045276,
      "varMes": 0.024108,
      "var6m": 0.227746,
      "var12m": 0.530259,
      "cotacao": 10.62
    },
    {
      "codigo": "CSMG3",
      "acao": "COPASA",
      "qtdeTeorica": 188467895.0,
      "part": 0.00404,
      "varDia": -0.036923,
      "varSemana": -0.008971,
      "varMes": 0.063019,
      "var6m": 0.289835,
      "var12m": 1.246411,
      "cotacao": 56.34
    },
    {
      "codigo": "PETR4",
      "acao": "PETROBRAS",
      "qtdeTeorica": 4410960450.0,
      "part": 0.07745,
      "varDia": -0.018439,
      "varSemana": 0.002446,
      "varMes": -0.102671,
      "var6m": 0.297563,
      "var12m": 0.291024,
      "cotacao": 40.99
    },
    {
      "codigo": "PETR3",
      "acao": "PETROBRAS",
      "qtdeTeorica": 2237877167.0,
      "part": 0.04408,
      "varDia": -0.01688,
      "varSemana": 0.006563,
      "varMes": -0.083831,
      "var6m": 0.382512,
      "var12m": 0.343358,
      "cotacao": 46.01
    },
    {
      "codigo": "NATU3",
      "acao": "NATURA",
      "qtdeTeorica": 838359453.0,
      "part": 0.00357,
      "varDia": 0.001175,
      "varSemana": -0.123457,
      "varMes": -0.140262,
      "var6m": 0.069009,
      "var12m": null,
      "cotacao": 8.52
    },
    {
      "codigo": "BRAV3",
      "acao": "BRAVA",
      "qtdeTeorica": 462883017.0,
      "part": 0.00373,
      "varDia": -0.003325,
      "varSemana": -0.000952,
      "varMes": 0.188669,
      "var6m": 0.559851,
      "var12m": 0.024915,
      "cotacao": 20.98
    },
    {
      "codigo": "PRIO3",
      "acao": "PRIO",
      "qtdeTeorica": 757265605.0,
      "part": 0.01971,
      "varDia": -0.017083,
      "varSemana": -0.002127,
      "varMes": -0.056321,
      "var6m": 0.547577,
      "var12m": 0.411152,
      "cotacao": 60.99
    },
    {
      "codigo": "KLBN11",
      "acao": "KLABIN S/A",
      "qtdeTeorica": 804572623.0,
      "part": 0.00539,
      "varDia": 0.003576,
      "varSemana": -0.012317,
      "varMes": 0.001189,
      "var6m": -0.092672,
      "var12m": -0.074217,
      "cotacao": 16.84
    },
    {
      "codigo": "CSAN3",
      "acao": "COSAN",
      "qtdeTeorica": 2242671999.0,
      "part": 0.00399,
      "varDia": -0.002967,
      "varSemana": -0.064067,
      "varMes": -0.301455,
      "var6m": -0.423671,
      "var12m": -0.592233,
      "cotacao": 3.36
    },
    {
      "codigo": "RECV3",
      "acao": "PETRORECSA",
      "qtdeTeorica": 274624898.0,
      "part": 0.00137,
      "varDia": -0.009001,
      "varSemana": 0.021336,
      "varMes": -0.099018,
      "var6m": 0.028011,
      "var12m": -0.273267,
      "cotacao": 11.01
    },
    {
      "codigo": "VALE3",
      "acao": "VALE",
      "qtdeTeorica": 3535764048.0,
      "part": 0.11957,
      "varDia": 0.009391,
      "varSemana": 0.010673,
      "varMes": -0.044565,
      "var6m": 0.159306,
      "var12m": 0.505584,
      "cotacao": 79.54
    },
    {
      "codigo": "SUZB3",
      "acao": "SUZANO S.A.",
      "qtdeTeorica": 612918471.0,
      "part": 0.01027,
      "varDia": 0.003148,
      "varSemana": -0.007667,
      "varMes": -0.029522,
      "var6m": -0.155728,
      "var12m": -0.217753,
      "cotacao": 41.42
    },
    {
      "codigo": "BEEF3",
      "acao": "MINERVA",
      "qtdeTeorica": 454804863.0,
      "part": 0.0007,
      "varDia": -0.005291,
      "varSemana": 0.021739,
      "varMes": -0.115294,
      "var6m": -0.376451,
      "var12m": -0.259843,
      "cotacao": 3.76
    },
    {
      "codigo": "UGPA3",
      "acao": "ULTRAPAR",
      "qtdeTeorica": 1067870496.0,
      "part": 0.01229,
      "varDia": -0.004804,
      "varSemana": -0.004006,
      "varMes": -0.173537,
      "var6m": 0.156279,
      "var12m": 0.452951,
      "cotacao": 24.86
    },
    {
      "codigo": "VIVT3",
      "acao": "TELEF BRASIL",
      "qtdeTeorica": 707125712.0,
      "part": 0.00959,
      "varDia": 0.000886,
      "varSemana": 0.028528,
      "varMes": -0.067162,
      "var6m": 0.013154,
      "var12m": 0.13916,
      "cotacao": 33.89
    },
    {
      "codigo": "YDUQ3",
      "acao": "YDUQS PART",
      "qtdeTeorica": 261365845.0,
      "part": 0.00103,
      "varDia": 0,
      "varSemana": -0.010124,
      "varMes": -0.141463,
      "var6m": -0.296563,
      "var12m": -0.475253,
      "cotacao": 8.8
    },
    {
      "codigo": "ENEV3",
      "acao": "ENEVA",
      "qtdeTeorica": 1913352180.0,
      "part": 0.01952,
      "varDia": 0.010656,
      "varSemana": 0.032231,
      "varMes": -0.067322,
      "var6m": 0.199416,
      "var12m": 0.801315,
      "cotacao": 24.66
    },
    {
      "codigo": "ASAI3",
      "acao": "ASSAI",
      "qtdeTeorica": 1338623499.0,
      "part": 0.00494,
      "varDia": -0.007282,
      "varSemana": -0.051044,
      "varMes": -0.085011,
      "var6m": -0.002439,
      "var12m": -0.269643,
      "cotacao": 8.18
    },
    {
      "codigo": "SLCE3",
      "acao": "SLC AGRICOLA",
      "qtdeTeorica": 220403658.0,
      "part": 0.00145,
      "varDia": -0.016349,
      "varSemana": -0.024983,
      "varMes": -0.172493,
      "var6m": -0.071979,
      "var12m": -0.11682,
      "cotacao": 14.44
    },
    {
      "codigo": "ISAE4",
      "acao": "ISA ENERGIA",
      "qtdeTeorica": 415568772.0,
      "part": 0.00472,
      "varDia": -0.00073,
      "varSemana": 0.016327,
      "varMes": -0.079018,
      "var6m": 0.008097,
      "var12m": 0.185714,
      "cotacao": 27.39
    },
    {
      "codigo": "VAMO3",
      "acao": "VAMOS",
      "qtdeTeorica": 448052066.0,
      "part": 0.00061,
      "varDia": 0.027211,
      "varSemana": 0.023729,
      "varMes": -0.168044,
      "var6m": -0.168044,
      "var12m": -0.365546,
      "cotacao": 3.02
    },
    {
      "codigo": "ALOS3",
      "acao": "ALLOS",
      "qtdeTeorica": 478558715.0,
      "part": 0.00557,
      "varDia": 0.001103,
      "varSemana": 0.01039,
      "varMes": -0.07381,
      "var6m": -0.065866,
      "var12m": 0.255996,
      "cotacao": 27.23
    },
    {
      "codigo": "BRAP4",
      "acao": "BRADESPAR",
      "qtdeTeorica": 250914708.0,
      "part": 0.00235,
      "varDia": 0.021798,
      "varSemana": 0.028336,
      "varMes": -0.035163,
      "var6m": 0.076555,
      "var12m": 0.417769,
      "cotacao": 22.5
    },
    {
      "codigo": "AXIA3",
      "acao": "AXIA ENERGIA",
      "qtdeTeorica": 1863816444.0,
      "part": 0.04102,
      "varDia": -0.003635,
      "varSemana": 0.026005,
      "varMes": -0.091892,
      "var6m": 0.029452,
      "var12m": 0.587805,
      "cotacao": 52.08
    },
    {
      "codigo": "RAIL3",
      "acao": "RUMO S.A.",
      "qtdeTeorica": 1221155293.0,
      "part": 0.00709,
      "varDia": -0.008895,
      "varSemana": -0.04089,
      "varMes": -0.151111,
      "var6m": -0.153262,
      "var12m": -0.297794,
      "cotacao": 13.37
    },
    {
      "codigo": "MOTV3",
      "acao": "MOTIVA SA",
      "qtdeTeorica": 1002196725.0,
      "part": 0.00597,
      "varDia": -0.002128,
      "varSemana": 0.00788,
      "varMes": -0.071287,
      "var6m": -0.121723,
      "var12m": 0.05,
      "cotacao": 14.07
    },
    {
      "codigo": "EGIE3",
      "acao": "ENGIE BRASIL",
      "qtdeTeorica": 357310487.0,
      "part": 0.00471,
      "varDia": 0.02403,
      "varSemana": 0.048621,
      "varMes": 0.066647,
      "var6m": 0.161576,
      "var12m": 0.227273,
      "cotacao": 35.37
    },
    {
      "codigo": "CPFE3",
      "acao": "CPFL ENERGIA",
      "qtdeTeorica": 187732538.0,
      "part": 0.00329,
      "varDia": 0.005634,
      "varSemana": 0.04521,
      "varMes": -0.042284,
      "var6m": -0.109914,
      "var12m": 0.105002,
      "cotacao": 44.62
    },
    {
      "codigo": "CSNA3",
      "acao": "SID NACIONAL",
      "qtdeTeorica": 727975012.0,
      "part": 0.00198,
      "varDia": 0.013311,
      "varSemana": 0.015,
      "varMes": -0.070229,
      "var6m": -0.372165,
      "var12m": -0.26538,
      "cotacao": 6.09
    },
    {
      "codigo": "TAEE11",
      "acao": "TAESA",
      "qtdeTeorica": 218568234.0,
      "part": 0.00349,
      "varDia": 0.003778,
      "varSemana": 0.032383,
      "varMes": 0.002012,
      "var6m": -0.045966,
      "var12m": 0.172749,
      "cotacao": 39.85
    },
    {
      "codigo": "TIMS3",
      "acao": "TIM",
      "qtdeTeorica": 777451080.0,
      "part": 0.00714,
      "varDia": -0.00482,
      "varSemana": 0.032273,
      "varMes": 0.000441,
      "var6m": -0.030316,
      "var12m": 0.085564,
      "cotacao": 22.71
    },
    {
      "codigo": "EMBJ3",
      "acao": "EMBRAER",
      "qtdeTeorica": 711833141.0,
      "part": 0.0211,
      "varDia": 0.025,
      "varSemana": 0.008987,
      "varMes": 0.004542,
      "var6m": -0.166514,
      "var12m": 0.059832,
      "cotacao": 72.98
    },
    {
      "codigo": "PSSA3",
      "acao": "PORTO SEGURO",
      "qtdeTeorica": 178825403.0,
      "part": 0.00356,
      "varDia": 0.015754,
      "varSemana": 0.051872,
      "varMes": 0.004594,
      "var6m": 0.017193,
      "var12m": -0.058063,
      "cotacao": 50.29
    },
    {
      "codigo": "CMIN3",
      "acao": "CSNMINERACAO",
      "qtdeTeorica": 1646519336.0,
      "part": 0.00299,
      "varDia": -0.006912,
      "varSemana": -0.01373,
      "varMes": -0.132797,
      "var6m": -0.249129,
      "var12m": -0.143141,
      "cotacao": 4.31
    },
    {
      "codigo": "EQTL3",
      "acao": "EQUATORIAL",
      "qtdeTeorica": 1247728993.0,
      "part": 0.01943,
      "varDia": -0.000257,
      "varSemana": -0.000771,
      "varMes": -0.049389,
      "var6m": -0.023851,
      "var12m": 0.064331,
      "cotacao": 38.88
    },
    {
      "codigo": "BBSE3",
      "acao": "BBSEGURIDADE",
      "qtdeTeorica": 616248544.0,
      "part": 0.00863,
      "varDia": 0.008995,
      "varSemana": 0.077706,
      "varMes": 0.114879,
      "var6m": 0.071047,
      "var12m": 0.080759,
      "cotacao": 38.14
    },
    {
      "codigo": "IGTI11",
      "acao": "IGUATEMI S.A",
      "qtdeTeorica": 205800982.0,
      "part": 0.00222,
      "varDia": -0.005611,
      "varSemana": -0.000403,
      "varMes": -0.083149,
      "var6m": -0.045402,
      "var12m": 0.116562,
      "cotacao": 24.81
    },
    {
      "codigo": "CMIG4",
      "acao": "CEMIG",
      "qtdeTeorica": 1904057894.0,
      "part": 0.00868,
      "varDia": 0.004625,
      "varSemana": -0.001838,
      "varMes": -0.053182,
      "var6m": -0.023381,
      "var12m": 0.031339,
      "cotacao": 10.86
    },
    {
      "codigo": "SBSP3",
      "acao": "SABESP",
      "qtdeTeorica": 2870627990.0,
      "part": 0.0338,
      "varDia": -0.003591,
      "varSemana": 0.014996,
      "varMes": -0.060914,
      "var6m": 0.045592,
      "var12m": 0.23553,
      "cotacao": 27.75
    },
    {
      "codigo": "CPLE3",
      "acao": "COPEL",
      "qtdeTeorica": 2969406694.0,
      "part": 0.01786,
      "varDia": 0.013793,
      "varSemana": 0.018006,
      "varMes": -0.02,
      "var6m": 0.088889,
      "var12m": 0.271626,
      "cotacao": 14.7
    },
    {
      "codigo": "ENGI11",
      "acao": "ENERGISA",
      "qtdeTeorica": 325503046.0,
      "part": 0.00645,
      "varDia": 0.008071,
      "varSemana": 0.020645,
      "varMes": -0.060012,
      "var6m": -0.034777,
      "var12m": 0.119868,
      "cotacao": 47.46
    },
    {
      "codigo": "ABEV3",
      "acao": "AMBEV S/A",
      "qtdeTeorica": 4273841357.0,
      "part": 0.02836,
      "varDia": -0.000601,
      "varSemana": 0.028448,
      "varMes": 0.030998,
      "var6m": 0.184473,
      "var12m": 0.205072,
      "cotacao": 16.63
    },
    {
      "codigo": "POMO4",
      "acao": "MARCOPOLO",
      "qtdeTeorica": 728266241.0,
      "part": 0.00183,
      "varDia": 0.022414,
      "varSemana": 0.049558,
      "varMes": -0.027869,
      "var6m": 0.029514,
      "var12m": -0.143064,
      "cotacao": 5.93
    },
    {
      "codigo": "B3SA3",
      "acao": "B3",
      "qtdeTeorica": 4997059816.0,
      "part": 0.03489,
      "varDia": -0.003886,
      "varSemana": -0.001947,
      "varMes": -0.110983,
      "var6m": 0.073273,
      "var12m": 0.1849,
      "cotacao": 15.38
    },
    {
      "codigo": "BBAS3",
      "acao": "BRASIL",
      "qtdeTeorica": 2842496541.0,
      "part": 0.0249,
      "varDia": 0.007728,
      "varSemana": 0.020344,
      "varMes": -0.082552,
      "var6m": -0.098618,
      "var12m": -0.086835,
      "cotacao": 19.56
    },
    {
      "codigo": "CEAB3",
      "acao": "CEA MODAS",
      "qtdeTeorica": 204964309.0,
      "part": 0.00099,
      "varDia": -0.020499,
      "varSemana": -0.033421,
      "varMes": 0.001823,
      "var6m": -0.188331,
      "var12m": -0.368391,
      "cotacao": 10.99
    },
    {
      "codigo": "AZZA3",
      "acao": "AZZAS 2154",
      "qtdeTeorica": 109571260.0,
      "part": 0.00093,
      "varDia": -0.004569,
      "varSemana": 0.017513,
      "varMes": -0.101546,
      "var6m": -0.312968,
      "var12m": -0.589979,
      "cotacao": 17.43
    },
    {
      "codigo": "LREN3",
      "acao": "LOJAS RENNER",
      "qtdeTeorica": 982593716.0,
      "part": 0.00613,
      "varDia": 0.005848,
      "varSemana": 0.039624,
      "varMes": 0.130752,
      "var6m": 0.090141,
      "var12m": -0.160521,
      "cotacao": 15.48
    },
    {
      "codigo": "HAPV3",
      "acao": "HAPVIDA",
      "qtdeTeorica": 271662290.0,
      "part": 0.00136,
      "varDia": 0.018119,
      "varSemana": 0.078611,
      "varMes": -0.056,
      "var6m": -0.197279,
      "var12m": -0.701417,
      "cotacao": 11.8
    },
    {
      "codigo": "RENT3",
      "acao": "LOCALIZA",
      "qtdeTeorica": 978479038.0,
      "part": 0.01777,
      "varDia": 0.004412,
      "varSemana": 0.009857,
      "varMes": -0.110677,
      "var6m": -0.103871,
      "var12m": -0.042747,
      "cotacao": 40.98
    },
    {
      "codigo": "BPAC11",
      "acao": "BTGP BANCO",
      "qtdeTeorica": 1194624560.0,
      "part": 0.02702,
      "varDia": 0.004952,
      "varSemana": 0.001579,
      "varMes": -0.11,
      "var6m": -0.082474,
      "var12m": 0.231012,
      "cotacao": 50.73
    },
    {
      "codigo": "MULT3",
      "acao": "MULTIPLAN",
      "qtdeTeorica": 320022221.0,
      "part": 0.00393,
      "varDia": 0.004912,
      "varSemana": 0.010229,
      "varMes": -0.066188,
      "var6m": -0.001743,
      "var12m": 0.094383,
      "cotacao": 28.64
    },
    {
      "codigo": "ITSA4",
      "acao": "ITAUSA",
      "qtdeTeorica": 5970738360.0,
      "part": 0.03167,
      "varDia": 0.005414,
      "varSemana": 0.036683,
      "varMes": -0.002302,
      "var6m": 0.124567,
      "var12m": 0.225259,
      "cotacao": 13
    },
    {
      "codigo": "SANB11",
      "acao": "SANTANDER BR",
      "qtdeTeorica": 360347199.0,
      "part": 0.00403,
      "varDia": 0.01509,
      "varSemana": 0.031799,
      "varMes": -0.002532,
      "var6m": -0.136776,
      "var12m": -0.0779,
      "cotacao": 27.58
    },
    {
      "codigo": "ITUB4",
      "acao": "ITAUUNIBANCO",
      "qtdeTeorica": 5050269111.0,
      "part": 0.08238,
      "varDia": 0.010617,
      "varSemana": 0.054082,
      "varMes": 0.026586,
      "var6m": 0.060363,
      "var12m": 0.15166,
      "cotacao": 40.93
    },
    {
      "codigo": "CXSE3",
      "acao": "CAIXA SEGURI",
      "qtdeTeorica": 600000000.0,
      "part": 0.00428,
      "varDia": 0.004828,
      "varSemana": 0.066022,
      "varMes": 0.083912,
      "var6m": 0.14277,
      "var12m": 0.285518,
      "cotacao": 18.73
    },
    {
      "codigo": "COGN3",
      "acao": "COGNA ON",
      "qtdeTeorica": 1915914094.0,
      "part": 0.00198,
      "varDia": -0.016327,
      "varSemana": 0,
      "varMes": -0.090566,
      "var6m": -0.301449,
      "var12m": -0.080153,
      "cotacao": 2.41
    },
    {
      "codigo": "FLRY3",
      "acao": "FLEURY",
      "qtdeTeorica": 447150822.0,
      "part": 0.00288,
      "varDia": 0.005277,
      "varSemana": 0.03322,
      "varMes": -0.062154,
      "var6m": 0.01061,
      "var12m": 0.179567,
      "cotacao": 15.24
    },
    {
      "codigo": "BBDC4",
      "acao": "BRADESCO",
      "qtdeTeorica": 5100889966.0,
      "part": 0.03729,
      "varDia": 0.00905,
      "varSemana": 0.021179,
      "varMes": -0.006682,
      "var6m": -0.043944,
      "var12m": 0.082524,
      "cotacao": 17.84
    },
    {
      "codigo": "BBDC3",
      "acao": "BRADESCO",
      "qtdeTeorica": 1464429403.0,
      "part": 0.00927,
      "varDia": 0.006485,
      "varSemana": 0.025777,
      "varMes": -0.007673,
      "var6m": -0.031815,
      "var12m": 0.086835,
      "cotacao": 15.52
    },
    {
      "codigo": "VBBR3",
      "acao": "VIBRA",
      "qtdeTeorica": 1192004780.0,
      "part": 0.01557,
      "varDia": -0.00237,
      "varSemana": 0.01973,
      "varMes": -0.125816,
      "var6m": 0.154841,
      "var12m": 0.494673,
      "cotacao": 29.46
    },
    {
      "codigo": "RADL3",
      "acao": "RAIADROGASIL",
      "qtdeTeorica": 1313915830.0,
      "part": 0.00982,
      "varDia": 0.007378,
      "varSemana": 0.016609,
      "varMes": -0.132029,
      "var6m": -0.275806,
      "var12m": 0.23866,
      "cotacao": 17.75
    },
    {
      "codigo": "MRVE3",
      "acao": "MRV",
      "qtdeTeorica": 374681353.0,
      "part": 0.00095,
      "varDia": 0.026871,
      "varSemana": -0.044643,
      "varMes": -0.152139,
      "var6m": -0.355422,
      "var12m": -0.09322,
      "cotacao": 5.35
    },
    {
      "codigo": "RDOR3",
      "acao": "REDE D OR",
      "qtdeTeorica": 1091469308.0,
      "part": 0.01524,
      "varDia": 0.010282,
      "varSemana": 0.049756,
      "varMes": -0.044191,
      "var6m": -0.235778,
      "var12m": -0.024397,
      "cotacao": 34.39
    },
    {
      "codigo": "AURE3",
      "acao": "AUREN",
      "qtdeTeorica": 317799925.0,
      "part": 0.00161,
      "varDia": 0.003404,
      "varSemana": 0.001699,
      "varMes": -0.097243,
      "var6m": -0.038336,
      "var12m": 0.188508,
      "cotacao": 11.79
    },
    {
      "codigo": "SMFT3",
      "acao": "SMART FIT",
      "qtdeTeorica": 556651316.0,
      "part": 0.00437,
      "varDia": -0.007235,
      "varSemana": 0.03894,
      "varMes": -0.026849,
      "var6m": -0.222267,
      "var12m": -0.217834,
      "cotacao": 19.21
    },
    {
      "codigo": "HYPE3",
      "acao": "HYPERA",
      "qtdeTeorica": 321083946.0,
      "part": 0.00299,
      "varDia": 0.007526,
      "varSemana": 0.020972,
      "varMes": -0.077519,
      "var6m": -0.085397,
      "var12m": -0.213945,
      "cotacao": 21.42
    },
    {
      "codigo": "MGLU3",
      "acao": "MAGAZ LUIZA",
      "qtdeTeorica": 373155063.0,
      "part": 0.00102,
      "varDia": -0.003752,
      "varSemana": -0.023897,
      "varMes": -0.25838,
      "var6m": -0.435106,
      "var12m": -0.420306,
      "cotacao": 5.31
    },
    {
      "codigo": "VIVA3",
      "acao": "VIVARA S.A.",
      "qtdeTeorica": 123698325.0,
      "part": 0.00114,
      "varDia": 0.015559,
      "varSemana": 0.054848,
      "varMes": -0.090372,
      "var6m": -0.391181,
      "var12m": -0.126166,
      "cotacao": 21.54
    },
    {
      "codigo": "CYRE3",
      "acao": "CYRELA REALT",
      "qtdeTeorica": 281609283.0,
      "part": 0.00258,
      "varDia": 0.024645,
      "varSemana": 0.090267,
      "varMes": -0.027003,
      "var6m": -0.223977,
      "var12m": 0.03693,
      "cotacao": 21.62
    },
    {
      "codigo": "CURY3",
      "acao": "CURY S/A",
      "qtdeTeorica": 160988231.0,
      "part": 0.00208,
      "varDia": 0.020703,
      "varSemana": 0.133798,
      "varMes": 0.070043,
      "var6m": -0.103581,
      "var12m": 0.095623,
      "cotacao": 32.54
    },
    {
      "codigo": "DIRR3",
      "acao": "DIRECIONAL",
      "qtdeTeorica": 327091595.0,
      "part": 0.00179,
      "varDia": 0.014022,
      "varSemana": 0.112551,
      "varMes": 0.033083,
      "var6m": -0.219761,
      "var12m": 0.011038,
      "cotacao": 13.74
    },
    {
      "codigo": "BRKM5",
      "acao": "BRASKEM",
      "qtdeTeorica": 265709734.0,
      "part": 0.00133,
      "varDia": -0.030769,
      "varSemana": 0.07631,
      "varMes": -0.203875,
      "var6m": 0.190176,
      "var12m": -0.105114,
      "cotacao": 9.45
    },
    {
      "codigo": "AXIA6",
      "acao": "AXIA ENERGIA",
      "qtdeTeorica": 266311915.0,
      "part": 0.00645,
      "varDia": null,
      "varSemana": 0,
      "varMes": -0.114181,
      "var6m": 0.040866,
      "var12m": 0.533682,
      "cotacao": 55.78
    },
    {
      "codigo": "Quantidade Teórica Total",
      "acao": "",
      "qtdeTeorica": 93123685158.0,
      "part": 1.0,
      "varDia": null,
      "varSemana": null,
      "varMes": null,
      "var6m": null,
      "var12m": null,
      "cotacao": null
    }
  ]
};

export const ALERTAS_SEED = [
  {
    "ativo": "ABEV3",
    "tipo": "Preço abaixo",
    "valorAlvo": 14.33,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-1"
  },
  {
    "ativo": "AURE3",
    "tipo": "Preço abaixo",
    "valorAlvo": 8.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-2"
  },
  {
    "ativo": "AZZA3",
    "tipo": "Preço acima",
    "valorAlvo": 35.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-3"
  },
  {
    "ativo": "AZZA3",
    "tipo": "Preço abaixo",
    "valorAlvo": 16.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-4"
  },
  {
    "ativo": "BBAS3",
    "tipo": "Preço acima",
    "valorAlvo": 24.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-5"
  },
  {
    "ativo": "BBAS3",
    "tipo": "Preço abaixo",
    "valorAlvo": 18.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-6"
  },
  {
    "ativo": "BEEF3",
    "tipo": "Preço abaixo",
    "valorAlvo": 3.3,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-7"
  },
  {
    "ativo": "BEEF3",
    "tipo": "Preço acima",
    "valorAlvo": 5.23,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-8"
  },
  {
    "ativo": "BRAV3",
    "tipo": "Preço abaixo",
    "valorAlvo": 16.89,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-9"
  },
  {
    "ativo": "CMIN3",
    "tipo": "Preço abaixo",
    "valorAlvo": 4.08,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-10"
  },
  {
    "ativo": "CMIN3",
    "tipo": "Preço acima",
    "valorAlvo": 5.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-11"
  },
  {
    "ativo": "COGN3",
    "tipo": "Preço acima",
    "valorAlvo": 3.29,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-12"
  },
  {
    "ativo": "COGN3",
    "tipo": "Preço abaixo",
    "valorAlvo": 2.3,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-13"
  },
  {
    "ativo": "CSAN3",
    "tipo": "Preço abaixo",
    "valorAlvo": 3.2,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-14"
  },
  {
    "ativo": "CSAN3",
    "tipo": "Preço acima",
    "valorAlvo": 5.5,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-15"
  },
  {
    "ativo": "FLRY3",
    "tipo": "Preço abaixo",
    "valorAlvo": 14.3,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-16"
  },
  {
    "ativo": "FLRY3",
    "tipo": "Preço acima",
    "valorAlvo": 16.6,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-17"
  },
  {
    "ativo": "GOAU4",
    "tipo": "Preço abaixo",
    "valorAlvo": 7.82,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-18"
  },
  {
    "ativo": "HYPE3",
    "tipo": "Preço abaixo",
    "valorAlvo": 20.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-19"
  },
  {
    "ativo": "HYPE3",
    "tipo": "Preço acima",
    "valorAlvo": 23.8,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-20"
  },
  {
    "ativo": "LJQQ3",
    "tipo": "Preço acima",
    "valorAlvo": 2.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-21"
  },
  {
    "ativo": "LUPA3",
    "tipo": "Preço acima",
    "valorAlvo": 2.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-22"
  },
  {
    "ativo": "MOTV3",
    "tipo": "Preço abaixo",
    "valorAlvo": 12.35,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-23"
  },
  {
    "ativo": "MRVE3",
    "tipo": "Preço abaixo",
    "valorAlvo": 5.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-24"
  },
  {
    "ativo": "MRVE3",
    "tipo": "Preço acima",
    "valorAlvo": 8.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-25"
  },
  {
    "ativo": "RADL3",
    "tipo": "Preço abaixo",
    "valorAlvo": 17.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-26"
  },
  {
    "ativo": "RAIL3",
    "tipo": "Preço abaixo",
    "valorAlvo": 13.1,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-27"
  },
  {
    "ativo": "RAIL3",
    "tipo": "Preço acima",
    "valorAlvo": 15.27,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-28"
  },
  {
    "ativo": "RCSL4",
    "tipo": "Preço acima",
    "valorAlvo": 2.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-29"
  },
  {
    "ativo": "RDOR3",
    "tipo": "Preço abaixo",
    "valorAlvo": 31.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-30"
  },
  {
    "ativo": "RDOR3",
    "tipo": "Preço acima",
    "valorAlvo": 40.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-31"
  },
  {
    "ativo": "SLCE3",
    "tipo": "Preço abaixo",
    "valorAlvo": 14.2,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-32"
  },
  {
    "ativo": "SUZB3",
    "tipo": "Preço abaixo",
    "valorAlvo": 39.9,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-33"
  },
  {
    "ativo": "SUZB3",
    "tipo": "Preço acima",
    "valorAlvo": 52.0,
    "base": "",
    "status": "Ativo",
    "obs": "",
    "id": "al-acao-34"
  }
];

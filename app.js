// Initial Data from Prompt
const INITIAL_DATA = [
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

// State management
let portfolio = [];
let marketPrices = {}; // Guarda os preços de mercado atuais mapeados pelo nome do título
let currentFilter = 'Todos';
let currentSortColumn = '';
let currentSortAsc = true;
let editingId = null;

// Formatação de Moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number.isFinite(value) ? value : 0);
};

// Geração de ID robusta (evita colisões do Date.now quando há aportes em sequência)
function generateId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
        return 'aporte-' + crypto.randomUUID();
    }
    return 'aporte-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Notificações (toast)
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Remove aportes com ID duplicado (mantém o primeiro) e garante que todo item tenha um ID
function sanitizePortfolio(list) {
    const seen = new Set();
    const result = [];
    (Array.isArray(list) ? list : []).forEach(item => {
        if (!item || typeof item !== 'object') return;
        if (!item.id) item.id = generateId();
        if (seen.has(item.id)) return; // descarta duplicado
        seen.add(item.id);
        result.push(item);
    });
    return result;
}

// Inicialização
function init() {
    const saved = localStorage.getItem('tesouro_portfolio');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            const clean = sanitizePortfolio(parsed);
            portfolio = clean;
            // Se a limpeza removeu duplicatas (dados corrompidos por versões antigas), persiste a correção
            if (clean.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
                saveData();
            }
        } catch (e) {
            console.error('Falha ao ler a carteira salva, restaurando dados iniciais:', e);
            portfolio = sanitizePortfolio(INITIAL_DATA);
            saveData();
        }
    } else {
        portfolio = sanitizePortfolio(INITIAL_DATA);
        saveData();
    }

    const savedPrices = localStorage.getItem('tesouro_market_prices');
    if (savedPrices) {
        try {
            marketPrices = JSON.parse(savedPrices) || {};
        } catch (e) {
            marketPrices = {};
        }
    }

    renderDashboard();
    renderTable();
    setupModals();
    setupFilter();
    setupSorting();
    setupDataTools();
}

function saveData() {
    localStorage.setItem('tesouro_portfolio', JSON.stringify(portfolio));
}

function savePrices() {
    localStorage.setItem('tesouro_market_prices', JSON.stringify(marketPrices));
}

// Cálculos Principais
function getCalculatedData() {
    let totalInvestido = 0;
    let saldoBrutoAtual = 0;

    const enrichedPortfolio = portfolio.map(item => {
        const inv = item.valorInvestido || (item.quantidade * item.precoUnitario);
        totalInvestido += inv;

        const currentPrice = marketPrices[item.titulo] || item.precoUnitario; // fallback para preço de compra
        const valorAtual = currentPrice * item.quantidade;
        saldoBrutoAtual += valorAtual;

        const rentabilidadeRS = valorAtual - inv;
        const rentabilidadePct = inv > 0 ? (rentabilidadeRS / inv) * 100 : 0;

        return {
            ...item,
            investidoCalc: inv,
            precoMercado: currentPrice,
            valorAtual: valorAtual,
            rentabilidadeRS,
            rentabilidadePct
        };
    });

    const rentabilidadeTotalRS = saldoBrutoAtual - totalInvestido;
    const rentabilidadeTotalPct = totalInvestido > 0 ? (rentabilidadeTotalRS / totalInvestido) * 100 : 0;

    return {
        enrichedPortfolio,
        totalInvestido,
        saldoBrutoAtual,
        rentabilidadeTotalRS,
        rentabilidadeTotalPct
    };
}

// Renderização
function renderDashboard() {
    const data = getCalculatedData();
    
    document.getElementById('total-investido').innerText = formatCurrency(data.totalInvestido);
    document.getElementById('saldo-bruto').innerText = formatCurrency(data.saldoBrutoAtual);
    
    const valEl = document.getElementById('rentabilidade-valor');
    const pctEl = document.getElementById('rentabilidade-percent');
    
    valEl.innerText = (data.rentabilidadeTotalRS >= 0 ? '+' : '') + formatCurrency(data.rentabilidadeTotalRS);
    pctEl.innerText = (data.rentabilidadeTotalPct >= 0 ? '+' : '') + data.rentabilidadeTotalPct.toFixed(2) + '%';
    
    valEl.className = 'metric-value ' + (data.rentabilidadeTotalRS >= 0 ? 'success' : 'danger');
    pctEl.className = 'badge ' + (data.rentabilidadeTotalRS >= 0 ? 'badge-success' : 'badge-danger');
}

function renderSummaries() {
    const data = getCalculatedData();
    const container = document.getElementById('title-summary-cards');
    if (!container) return;

    // Aggregate data by title
    const aggregates = {};
    data.enrichedPortfolio.forEach(item => {
        if (!aggregates[item.titulo]) aggregates[item.titulo] = 0;
        aggregates[item.titulo] += item.valorAtual;
    });

    // Create cards
    container.innerHTML = '';
    
    // "Todos" card
    const allCard = document.createElement('div');
    allCard.className = `summary-card ${currentFilter === 'Todos' ? 'active' : ''}`;
    allCard.innerHTML = `
        <span class="summary-card-title">Todos os Títulos</span>
        <span class="summary-card-value">${formatCurrency(data.saldoBrutoAtual)}</span>
    `;
    allCard.onclick = () => {
        const filterSelect = document.getElementById('titulo-filter');
        if (filterSelect) filterSelect.value = 'Todos';
        currentFilter = 'Todos';
        renderTable();
    };
    container.appendChild(allCard);

    // Individual title cards
    Object.keys(aggregates).sort().forEach(titulo => {
        const card = document.createElement('div');
        card.className = `summary-card ${currentFilter === titulo ? 'active' : ''}`;
        card.innerHTML = `
            <span class="summary-card-title" title="${titulo}">${titulo}</span>
            <span class="summary-card-value">${formatCurrency(aggregates[titulo])}</span>
        `;
        card.onclick = () => {
            const filterSelect = document.getElementById('titulo-filter');
            if (filterSelect) filterSelect.value = titulo;
            currentFilter = titulo;
            renderTable();
        };
        container.appendChild(card);
    });
}

function renderTable() {
    const data = getCalculatedData();
    const tbody = document.querySelector('#portfolio-table tbody');
    tbody.innerHTML = '';

    const filteredPortfolio = data.enrichedPortfolio.filter(item => 
        currentFilter === 'Todos' || item.titulo === currentFilter
    );

    if (currentSortColumn) {
        filteredPortfolio.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            // Parse DD/MM/YYYY for dates
            if (currentSortColumn === 'dataAplicacao') {
                const pA = valA.split('/');
                const pB = valB.split('/');
                valA = new Date(pA[2], pA[1] - 1, pA[0]).getTime();
                valB = new Date(pB[2], pB[1] - 1, pB[0]).getTime();
            }

            if (valA < valB) return currentSortAsc ? -1 : 1;
            if (valA > valB) return currentSortAsc ? 1 : -1;
            return 0;
        });
    }

    const countBadge = document.getElementById('aportes-count');
    if (countBadge) countBadge.textContent = filteredPortfolio.length;

    if (filteredPortfolio.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-state';
        tr.innerHTML = `<td colspan="11">Nenhum aporte encontrado. Clique em <strong>Novo Aporte</strong> para começar.</td>`;
        tbody.appendChild(tr);
        renderSummaries();
        return;
    }

    filteredPortfolio.forEach(item => {
        const tr = document.createElement('tr');

        const rentClass = item.rentabilidadeRS >= 0 ? 'td-success' : 'td-danger';
        const rentSign = item.rentabilidadeRS >= 0 ? '+' : '';

        tr.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.dataAplicacao}</td>
            <td>${item.quantidade.toFixed(4)}</td>
            <td>${formatCurrency(item.precoUnitario)}</td>
            <td>${formatCurrency(item.investidoCalc)}</td>
            <td>${item.taxaContratada}</td>
            <td><strong>${formatCurrency(item.precoMercado)}</strong></td>
            <td>${formatCurrency(item.valorAtual)}</td>
            <td class="${rentClass}">
                ${rentSign}${formatCurrency(item.rentabilidadeRS)}
            </td>
            <td class="${rentClass}">
                ${rentSign}${item.rentabilidadePct.toFixed(2)}%
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editInvestment('${item.id}')" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteInvestment('${item.id}')" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderSummaries();
}

// Interações e Modais
function editInvestment(id) {
    const item = portfolio.find(p => p.id === id);
    if (!item) return;

    editingId = id;
    document.getElementById('modal-new-title').innerText = 'Editar Aporte';
    
    document.getElementById('titulo').value = item.titulo;
    document.getElementById('dataAplicacao').value = item.dataAplicacao;
    document.getElementById('taxaContratada').value = item.taxaContratada;
    document.getElementById('quantidade').value = item.quantidade;
    document.getElementById('precoUnitario').value = item.precoUnitario;

    document.getElementById('modal-new').classList.add('active');
}

function deleteInvestment(id) {
    if (confirm('Tem certeza que deseja excluir este aporte?')) {
        portfolio = portfolio.filter(p => p.id !== id);
        saveData();
        updateTitleLists();
        renderDashboard();
        renderTable();
        showToast('Aporte excluído.', 'info');
    }
}

function setupModals() {
    // Mask for Data da Aplicação
    const dataInput = document.getElementById('dataAplicacao');
    if (dataInput) {
        dataInput.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length > 4) {
                v = v.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
            } else if (v.length > 2) {
                v = v.replace(/(\d{2})(\d+)/, '$1/$2');
            }
            e.target.value = v;
        });
    }

    // Strict Autocomplete for Título
    const tituloInput = document.getElementById('titulo');
    if (tituloInput) {
        tituloInput.addEventListener('input', function (e) {
            const val = e.target.value.toLowerCase();
            const datalist = document.getElementById('titulos-list');
            if (!datalist) return;
            
            const titulosUnicos = [...new Set(portfolio.map(p => p.titulo))].sort();
            datalist.innerHTML = '';
            titulosUnicos.forEach(t => {
                if (t.toLowerCase().includes(val)) {
                    const option = document.createElement('option');
                    option.value = t;
                    datalist.appendChild(option);
                }
            });
        });
    }

    // Novo Aporte
    const modalNew = document.getElementById('modal-new');
    const btnNew = document.getElementById('btn-new-investment');
    
    btnNew.addEventListener('click', () => {
        editingId = null;
        document.getElementById('modal-new-title').innerText = 'Cadastrar Novo Aporte';
        document.getElementById('form-new-investment').reset();
        modalNew.classList.add('active');
    });
    
    document.getElementById('form-new-investment').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo').value.trim();
        const data = document.getElementById('dataAplicacao').value.trim();
        const taxa = document.getElementById('taxaContratada').value.trim();
        const qtd = parseFloat(document.getElementById('quantidade').value);
        const preco = parseFloat(document.getElementById('precoUnitario').value);

        // Validação básica
        if (!titulo || !data || !taxa) {
            showToast('Preencha todos os campos do aporte.', 'error');
            return;
        }
        if (!Number.isFinite(qtd) || qtd <= 0 || !Number.isFinite(preco) || preco <= 0) {
            showToast('Quantidade e preço devem ser números maiores que zero.', 'error');
            return;
        }
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            showToast('Informe a data no formato DD/MM/AAAA.', 'error');
            return;
        }

        if (editingId) {
            // Update existing
            const index = portfolio.findIndex(p => p.id === editingId);
            if (index !== -1) {
                portfolio[index] = {
                    ...portfolio[index],
                    titulo,
                    dataAplicacao: data,
                    quantidade: qtd,
                    precoUnitario: preco,
                    valorInvestido: qtd * preco,
                    taxaContratada: taxa
                };
            }
        } else {
            // Create new
            const novoAporte = {
                id: generateId(),
                titulo,
                dataAplicacao: data,
                quantidade: qtd,
                precoUnitario: preco,
                valorInvestido: qtd * preco,
                taxaContratada: taxa
            };
            portfolio.push(novoAporte);
        }

        saveData();
        updateTitleLists();
        renderDashboard();
        renderTable();

        e.target.reset();
        modalNew.classList.remove('active');
        showToast(editingId ? 'Aporte atualizado com sucesso.' : 'Aporte cadastrado com sucesso.', 'success');
    });

    // Atualizar Mercado
    const modalMarket = document.getElementById('modal-market');
    const btnMarket = document.getElementById('btn-update-market');
    const marketContainer = document.getElementById('market-prices-container');

    btnMarket.addEventListener('click', () => {
        // Coletar títulos únicos
        const titulosUnicos = [...new Set(portfolio.map(p => p.titulo))].sort();
        
        marketContainer.innerHTML = '';
        titulosUnicos.forEach(t => {
            const div = document.createElement('div');
            div.className = 'market-price-item';
            
            // Pega o precoMercado atual (se existir) ou o ultimo preco unitario de compra
            const lastPrice = marketPrices[t] || portfolio.find(p => p.titulo === t).precoUnitario;
            
            div.innerHTML = `
                <span class="market-price-title">${t}</span>
                <input type="number" step="0.01" class="market-price-input" data-titulo="${t}" value="${lastPrice.toFixed(2)}" required>
            `;
            marketContainer.appendChild(div);
        });
        
        modalMarket.classList.add('active');
    });

    const uploadExcel = document.getElementById('upload-excel');
    if (uploadExcel) {
        uploadExcel.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    let matched = 0;
                    json.forEach(row => {
                        if (row.length >= 3) {
                            const titulo = row[0] ? row[0].toString().trim() : '';
                            const precoBruto = row[2];

                            const input = document.querySelector(`.market-price-input[data-titulo="${titulo}"]`);
                            if (input && precoBruto) {
                                let parsedPrice = 0;
                                if (typeof precoBruto === 'number') {
                                    parsedPrice = precoBruto;
                                } else if (typeof precoBruto === 'string') {
                                    let clean = precoBruto.replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.').trim();
                                    parsedPrice = parseFloat(clean);
                                }

                                if (!isNaN(parsedPrice) && parsedPrice > 0) {
                                    input.value = parsedPrice.toFixed(2);
                                    input.style.borderColor = 'var(--success-color)';
                                    input.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                                    matched++;
                                }
                            }
                        }
                    });

                    if (matched > 0) {
                        showToast(`${matched} preço(s) reconhecido(s) na planilha. Confira e clique em Atualizar.`, 'success');
                    } else {
                        showToast('Nenhum título da carteira foi encontrado na planilha. Verifique as colunas "Título" e "Preço unitário de resgate".', 'error', 5000);
                    }
                } catch(error) {
                    console.error("Erro ao ler o arquivo Excel:", error);
                    showToast('Erro ao ler o arquivo. Certifique-se de que é uma planilha válida.', 'error', 5000);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    document.getElementById('form-update-market').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputs = document.querySelectorAll('.market-price-input');
        inputs.forEach(input => {
            const t = input.getAttribute('data-titulo');
            const val = parseFloat(input.value);
            if (Number.isFinite(val) && val > 0) {
                marketPrices[t] = val;
            }
        });

        savePrices();
        renderDashboard();
        renderTable();

        modalMarket.classList.remove('active');
        showToast('Preços de mercado atualizados.', 'success');
    });

    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Interações e Modais
function updateTitleLists() {
    const titulosUnicos = [...new Set(portfolio.map(p => p.titulo))].sort();
    
    // Update Filter Select
    const filterSelect = document.getElementById('titulo-filter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="Todos">Todos os Títulos</option>';
        titulosUnicos.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentFilter;
    }

    // Update Datalist (Autocomplete)
    const datalist = document.getElementById('titulos-list');
    if (datalist) {
        datalist.innerHTML = '';
        titulosUnicos.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            datalist.appendChild(option);
        });
    }
}

function setupFilter() {
    updateTitleLists();
    
    const filterSelect = document.getElementById('titulo-filter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTable();
    });
}

function setupSorting() {
    const headers = document.querySelectorAll('th[data-sort]');
    headers.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            if (currentSortColumn === column) {
                currentSortAsc = !currentSortAsc;
            } else {
                currentSortColumn = column;
                currentSortAsc = true;
            }
            
            headers.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            th.classList.add(currentSortAsc ? 'sort-asc' : 'sort-desc');
            
            renderTable();
        });
    });
}

// Ferramentas de dados: Exportar / Importar / Restaurar
function setupDataTools() {
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const importFile = document.getElementById('import-file');
    const btnReset = document.getElementById('btn-reset');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const backup = {
                versao: 1,
                exportadoEm: new Date().toISOString(),
                portfolio,
                marketPrices
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `carteira-tesouro-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showToast('Backup exportado.', 'success');
        });
    }

    if (btnImport && importFile) {
        btnImport.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    // Aceita tanto o formato de backup { portfolio, marketPrices } quanto um array puro de aportes
                    const incoming = Array.isArray(parsed) ? parsed : parsed.portfolio;
                    if (!Array.isArray(incoming)) {
                        throw new Error('Estrutura inválida');
                    }
                    if (!confirm('Importar este backup substituirá a carteira atual. Deseja continuar?')) {
                        return;
                    }
                    portfolio = sanitizePortfolio(incoming);
                    if (parsed && parsed.marketPrices && typeof parsed.marketPrices === 'object') {
                        marketPrices = parsed.marketPrices;
                        savePrices();
                    }
                    saveData();
                    updateTitleLists();
                    renderDashboard();
                    renderTable();
                    showToast(`Backup importado: ${portfolio.length} aporte(s).`, 'success');
                } catch (err) {
                    console.error('Erro ao importar backup:', err);
                    showToast('Arquivo inválido. Selecione um backup JSON gerado por esta ferramenta.', 'error', 5000);
                } finally {
                    importFile.value = ''; // permite reimportar o mesmo arquivo
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (!confirm('Isto substituirá sua carteira pelos dados iniciais de exemplo. Esta ação não pode ser desfeita. Deseja continuar?')) {
                return;
            }
            portfolio = sanitizePortfolio(INITIAL_DATA);
            marketPrices = {};
            saveData();
            savePrices();
            currentFilter = 'Todos';
            updateTitleLists();
            renderDashboard();
            renderTable();
            showToast('Carteira restaurada para os dados iniciais.', 'info');
        });
    }
}

// Iniciar Aplicação
init();

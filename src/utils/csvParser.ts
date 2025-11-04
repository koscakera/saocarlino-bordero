import { BorderoData, RevenueItem, ExpenseItem, ProfitDivision } from "@/types/bordero";

export async function parseBorderoCSV(csvPath: string): Promise<BorderoData> {
  const response = await fetch(csvPath);
  const text = await response.text();
  const lines = text.split('\n');

  // Parse event info
  const eventName = lines[3]?.split(';')[1]?.replace(/"/g, '') || '';
  const eventDate = lines[4]?.split(';')[1] || '';
  const eventLocation = lines[5]?.split(';')[1] || '';

  // Parse revenues
  const revenues: RevenueItem[] = [];
  const sympla = lines[8]?.split(';');
  if (sympla && sympla.length >= 4) {
    revenues.push({
      origem: sympla[0],
      valorBruto: parseValue(sympla[1]),
      desconto: parseValue(sympla[2]),
      valorLiquido: parseValue(sympla[3]),
    });
  }

  const pix = lines[9]?.split(';');
  if (pix && pix.length >= 4) {
    revenues.push({
      origem: pix[0],
      valorBruto: parseValue(pix[1]),
      desconto: parseValue(pix[2]),
      valorLiquido: parseValue(pix[3]),
    });
  }

  // Parse divulgação
  const divulgacao = parseValue(lines[12]?.split(';')[2]);

  // Parse profit divisions
  const profitDivisions: ProfitDivision[] = [];
  const division1 = lines[16]?.split(';');
  const division2 = lines[17]?.split(';');

  if (division1 && division1.length >= 4) {
    profitDivisions.push({
      beneficiario: division1[1],
      percentual: parseFloat(division1[2]),
      valor: parseValue(division1[3]),
    });
  }

  if (division2 && division2.length >= 4) {
    profitDivisions.push({
      beneficiario: division2[1],
      percentual: parseFloat(division2[2]),
      valor: parseValue(division2[3]),
    });
  }

  // Calculate totals
  const totalBruto = revenues.reduce((sum, r) => sum + r.valorBruto, 0);
  const totalLiquido = parseValue(lines[13]?.split(';')[2]);

  return {
    eventInfo: {
      name: eventName,
      date: eventDate,
      location: eventLocation,
    },
    revenues,
    expenses: [],
    divulgacao,
    profitDivisions,
    totalBruto,
    totalLiquido,
  };
}

export async function parseDespesasCSV(csvPath: string): Promise<ExpenseItem[]> {
  const response = await fetch(csvPath);
  const text = await response.text();
  const lines = text.split('\n');

  const expenses: ExpenseItem[] = [];

  // Parse expenses starting from line 8
  const logistica = lines[8]?.split(';');
  if (logistica && logistica.length >= 4) {
    expenses.push({
      despesa: logistica[0],
      valorBruto: parseValue(logistica[1]),
      desconto: parseValue(logistica[2]),
      valorLiquido: parseValue(logistica[3]),
    });
  }

  const hotel = lines[9]?.split(';');
  if (hotel && hotel.length >= 4) {
    expenses.push({
      despesa: hotel[0],
      valorBruto: parseValue(hotel[1]),
      desconto: parseValue(hotel[2]),
      valorLiquido: parseValue(hotel[3]),
    });
  }

  return expenses;
}

function parseValue(value: string | undefined): number {
  if (!value) return 0;
  // Remove R$, spaces, and convert comma to dot
  const cleaned = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

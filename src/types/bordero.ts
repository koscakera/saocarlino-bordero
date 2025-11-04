export interface EventInfo {
  name: string;
  date: string;
  location: string;
}

export interface RevenueItem {
  origem: string;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
}

export interface ExpenseItem {
  despesa: string;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
}

export interface ProfitDivision {
  beneficiario: string;
  percentual: number;
  valor: number;
}

export interface BorderoData {
  eventInfo: EventInfo;
  revenues: RevenueItem[];
  expenses: ExpenseItem[];
  divulgacao: number;
  profitDivisions: ProfitDivision[];
  totalBruto: number;
  totalLiquido: number;
}

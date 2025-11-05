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

export const initialBorderoData: BorderoData = {
  eventInfo: {
    name: "Novo Evento",
    date: new Date().toLocaleDateString("pt-BR"),
    location: "Local do Evento",
  },
  revenues: [
    { origem: "Vendas Sympla", valorBruto: 0, desconto: 0, valorLiquido: 0 },
    { origem: "Vendas Pix", valorBruto: 0, desconto: 0, valorLiquido: 0 },
  ],
  expenses: [],
  divulgacao: 0,
  profitDivisions: [
    { beneficiario: "Novo Evento", percentual: 50, valor: 0 },
    { beneficiario: "São Carlino", percentual: 50, valor: 0 },
  ],
  totalBruto: 0,
  totalLiquido: 0,
};

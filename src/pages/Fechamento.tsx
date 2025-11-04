import { useEffect, useState } from "react";
import { DollarSign, TrendingDown, Receipt } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseDespesasCSV, formatCurrency } from "@/utils/csvParser";
import { ExpenseItem } from "@/types/bordero";

const Fechamento = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseDespesasCSV("/data/despesas.csv")
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalBruto = expenses.reduce((sum, expense) => sum + expense.valorBruto, 0);
  const totalDesconto = expenses.reduce((sum, expense) => sum + expense.desconto, 0);
  const totalLiquido = expenses.reduce((sum, expense) => sum + expense.valorLiquido, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Fechamento</h1>
          <p className="text-muted-foreground">Despesas do evento</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Bruto"
            value={formatCurrency(totalBruto)}
            icon={DollarSign}
            iconColor="bg-primary"
          />
          <StatsCard
            title="Descontos"
            value={formatCurrency(totalDesconto)}
            icon={TrendingDown}
            iconColor="bg-secondary"
          />
          <StatsCard
            title="Total Líquido"
            value={formatCurrency(totalLiquido)}
            icon={Receipt}
            iconColor="bg-accent"
          />
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Despesa</TableHead>
                    <TableHead className="text-right">Valor Bruto</TableHead>
                    <TableHead className="text-right">Desconto</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{expense.despesa}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expense.valorBruto)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expense.desconto)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(expense.valorLiquido)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalBruto)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalDesconto)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalLiquido)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma despesa encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fechamento;

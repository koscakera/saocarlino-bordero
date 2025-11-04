import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
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
import { parseBorderoCSV, formatCurrency } from "@/utils/csvParser";
import { BorderoData } from "@/types/bordero";

const Bordero = () => {
  const [data, setData] = useState<BorderoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseBorderoCSV("/data/bordero.csv")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Borderô</h1>
          <p className="text-muted-foreground">Fechamento de valores do evento</p>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Evento: </span>
              {data.eventInfo.name}
            </div>
            <div>
              <span className="font-semibold">Data: </span>
              {data.eventInfo.date}
            </div>
            <div>
              <span className="font-semibold">Local: </span>
              {data.eventInfo.location}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Valor Bruto Total"
            value={formatCurrency(data.totalBruto)}
            icon={DollarSign}
            iconColor="bg-primary"
          />
          <StatsCard
            title="Divulgação"
            value={formatCurrency(data.divulgacao)}
            icon={TrendingUp}
            iconColor="bg-secondary"
          />
          <StatsCard
            title="Total Líquido"
            value={formatCurrency(data.totalLiquido)}
            icon={Calendar}
            iconColor="bg-accent"
          />
        </div>

        {/* Revenue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Origem das Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Valor Bruto</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Valor Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenues.map((revenue, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{revenue.origem}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(revenue.valorBruto)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(revenue.desconto)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(revenue.valorLiquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Profit Division Table */}
        <Card>
          <CardHeader>
            <CardTitle>Divisão de Lucros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiário</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.profitDivisions.map((division, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{division.beneficiario}</TableCell>
                    <TableCell className="text-right">{division.percentual}%</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(division.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bordero;

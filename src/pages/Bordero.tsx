import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, Edit, Save, X } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const [editedData, setEditedData] = useState<BorderoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    parseBorderoCSV("/data/bordero.csv")
      .then((parsedData) => {
        setData(parsedData);
        setEditedData(parsedData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedData) {
      setData(editedData);
      setIsEditing(false);
      toast.success("Valores salvos com sucesso!");
    }
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
    toast.info("Edição cancelada");
  };

  const updateRevenue = (index: number, field: keyof typeof editedData.revenues[0], value: string) => {
    if (!editedData) return;
    
    const numValue = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
    const newRevenues = [...editedData.revenues];
    newRevenues[index] = { ...newRevenues[index], [field]: numValue };
    
    // Recalcular valor líquido
    if (field === "valorBruto" || field === "desconto") {
      newRevenues[index].valorLiquido = newRevenues[index].valorBruto - newRevenues[index].desconto;
    }
    
    // Recalcular totais
    const totalBruto = newRevenues.reduce((sum, r) => sum + r.valorBruto, 0);
    const totalLiquido = newRevenues.reduce((sum, r) => sum + r.valorLiquido, 0);
    
    setEditedData({
      ...editedData,
      revenues: newRevenues,
      totalBruto,
      totalLiquido,
    });
  };

  const updateProfitDivision = (index: number, field: "percentual" | "valor", value: string) => {
    if (!editedData) return;
    
    const numValue = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
    const newDivisions = [...editedData.profitDivisions];
    newDivisions[index] = { ...newDivisions[index], [field]: numValue };
    
    setEditedData({
      ...editedData,
      profitDivisions: newDivisions,
    });
  };

  const currentData = isEditing ? editedData : data;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Borderô</h1>
            <p className="text-muted-foreground">Fechamento de valores do evento</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Evento: </span>
              {currentData.eventInfo.name}
            </div>
            <div>
              <span className="font-semibold">Data: </span>
              {currentData.eventInfo.date}
            </div>
            <div>
              <span className="font-semibold">Local: </span>
              {currentData.eventInfo.location}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Valor Bruto Total"
            value={formatCurrency(currentData.totalBruto)}
            icon={DollarSign}
            iconColor="bg-primary"
          />
          <StatsCard
            title="Divulgação"
            value={formatCurrency(currentData.divulgacao)}
            icon={TrendingUp}
            iconColor="bg-secondary"
          />
          <StatsCard
            title="Total Líquido"
            value={formatCurrency(currentData.totalLiquido)}
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
                {currentData.revenues.map((revenue, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{revenue.origem}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formatCurrency(revenue.valorBruto)}
                          onChange={(e) => updateRevenue(index, "valorBruto", e.target.value)}
                          className="text-right"
                        />
                      ) : (
                        formatCurrency(revenue.valorBruto)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formatCurrency(revenue.desconto)}
                          onChange={(e) => updateRevenue(index, "desconto", e.target.value)}
                          className="text-right"
                        />
                      ) : (
                        formatCurrency(revenue.desconto)
                      )}
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
                {currentData.profitDivisions.map((division, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{division.beneficiario}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={division.percentual.toString()}
                          onChange={(e) => updateProfitDivision(index, "percentual", e.target.value)}
                          className="text-right"
                        />
                      ) : (
                        `${division.percentual}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formatCurrency(division.valor)}
                          onChange={(e) => updateProfitDivision(index, "valor", e.target.value)}
                          className="text-right"
                        />
                      ) : (
                        formatCurrency(division.valor)
                      )}
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

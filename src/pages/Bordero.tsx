import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar as CalendarIcon, Edit, Save, X, FileDown, Plus } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
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

  const handleNovo = () => {
    const nomeEvento = "Novo Evento";
    const novoBordero: BorderoData = {
      eventInfo: {
        name: nomeEvento,
        date: format(new Date(), "dd/MM/yyyy"),
        location: "Local a definir"
      },
      revenues: [
        { origem: "Ingressos", valorBruto: 0, desconto: 0, valorLiquido: 0 },
        { origem: "Pix", valorBruto: 0, desconto: 0, valorLiquido: 0 }
      ],
      expenses: [],
      divulgacao: 0,
      profitDivisions: [
        { beneficiario: nomeEvento, percentual: 50, valor: 0 },
        { beneficiario: "SãoCarlino", percentual: 50, valor: 0 }
      ],
      totalBruto: 0,
      totalLiquido: 0
    };
    
    setData(novoBordero);
    setEditedData(novoBordero);
    setIsEditing(true);
    toast.success("Novo borderô criado! Configure os valores.");
  };

  const updateRevenue = (index: number, field: keyof typeof editedData.revenues[0], value: string | number) => {
    if (!editedData) return;
    
    let numValue: number;
    if (typeof value === "string") {
      numValue = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
    } else {
      numValue = value;
    }
    
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

  const updateProfitDivision = (index: number, value: string) => {
    if (!editedData) return;
    
    const percentual = parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
    const newDivisions = [...editedData.profitDivisions];
    
    // 1. Atualiza o percentual
    newDivisions[index] = { ...newDivisions[index], percentual };
    
    // 2. Calcula o novo valor com base no total bruto
    const valorBase = editedData.totalBruto;
    const novoValor = (percentual / 100) * valorBase;
    
    newDivisions[index].valor = novoValor;
    
    setEditedData({
      ...editedData,
      profitDivisions: newDivisions,
    });
  };

  const updateEventInfo = (field: keyof typeof editedData.eventInfo, value: string) => {
    if (!editedData) return;
    
    const updatedEventInfo = {
      ...editedData.eventInfo,
      [field]: value
    };
    
    // Se o nome do evento mudar, atualizar o primeiro beneficiário
    const updatedProfitDivisions = field === "name" 
      ? editedData.profitDivisions.map((div, idx) => 
          idx === 0 ? { ...div, beneficiario: value } : div
        )
      : editedData.profitDivisions;
    
    setEditedData({
      ...editedData,
      eventInfo: updatedEventInfo,
      profitDivisions: updatedProfitDivisions
    });
  };

  const currentData = isEditing ? editedData : data;

  const exportToPDF = () => {
    if (!currentData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Cores do sistema
    const primaryColor: [number, number, number] = [6, 182, 212]; // cyan-500
    const secondaryColor: [number, number, number] = [239, 68, 68]; // red-500
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("BORDERÔ - SÃO CARLINO COMEDY", pageWidth / 2, 20, { align: "center" });
    
    // Informações do Evento
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("INFORMAÇÕES DO EVENTO", 14, 35);
    doc.setFontSize(10);
    doc.text(`Evento: ${currentData.eventInfo.name}`, 14, 42);
    doc.text(`Data: ${currentData.eventInfo.date}`, 14, 48);
    doc.text(`Local: ${currentData.eventInfo.location}`, 14, 54);
    
    // Resumo Financeiro
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("RESUMO FINANCEIRO", 14, 65);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Valor Bruto Total: ${formatCurrency(currentData.totalBruto)}`, 14, 72);
    doc.text(`Divulgação: ${formatCurrency(currentData.divulgacao)}`, 14, 78);
    doc.text(`Total Líquido: ${formatCurrency(currentData.totalLiquido)}`, 14, 84);
    
    // Tabela de Receitas
    autoTable(doc, {
      startY: 92,
      head: [["Origem", "Valor Bruto", "Desconto", "Valor Líquido"]],
      body: currentData.revenues.map(r => [
        r.origem,
        formatCurrency(r.valorBruto),
        formatCurrency(r.desconto),
        formatCurrency(r.valorLiquido)
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 9
      },
      theme: "grid"
    });
    
    // Tabela de Divisão de Lucros
    const finalY = (doc as any).lastAutoTable.finalY || 92;
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("DIVISÃO DE LUCROS", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Beneficiário", "Percentual", "Valor"]],
      body: currentData.profitDivisions.map(d => [
        d.beneficiario,
        `${d.percentual}%`,
        formatCurrency(d.valor)
      ]),
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 9
      },
      theme: "grid"
    });
    
    // Salvar o PDF
    const fileName = `bordero_${currentData.eventInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success("PDF exportado com sucesso!");
  };

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
            {!isEditing && (
              <>
                <Button onClick={handleNovo} variant="secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo
                </Button>
                <Button onClick={exportToPDF} variant="default">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </>
            )}
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
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">Evento: </span>
              {isEditing ? (
                <Input
                  type="text"
                  value={currentData.eventInfo.name}
                  onChange={(e) => updateEventInfo("name", e.target.value)}
                  className="mt-1"
                  placeholder="Nome do evento"
                />
              ) : (
                currentData.eventInfo.name
              )}
            </div>
            <div>
              <span className="font-semibold">Data: </span>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1 w-full justify-start text-left font-normal",
                        !currentData.eventInfo.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentData.eventInfo.date || <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        currentData.eventInfo.date
                          ? parse(currentData.eventInfo.date, "dd/MM/yyyy", new Date())
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          updateEventInfo("date", format(date, "dd/MM/yyyy"));
                        }
                      }}
                      locale={ptBR}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                currentData.eventInfo.date
              )}
            </div>
            <div>
              <span className="font-semibold">Local: </span>
              {isEditing ? (
                <Input
                  type="text"
                  value={currentData.eventInfo.location}
                  onChange={(e) => updateEventInfo("location", e.target.value)}
                  className="mt-1"
                  placeholder="Local do evento"
                />
              ) : (
                currentData.eventInfo.location
              )}
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
            icon={CalendarIcon}
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
                          type="number"
                          step="0.01"
                          value={revenue.valorBruto}
                          onFocus={(e) => {
                            if (parseFloat(e.target.value) === 0) {
                              e.target.value = "";
                            }
                          }}
                          onChange={(e) => updateRevenue(index, "valorBruto", parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      ) : (
                        formatCurrency(revenue.valorBruto)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={revenue.desconto}
                          onFocus={(e) => {
                            if (parseFloat(e.target.value) === 0) {
                              e.target.value = "";
                            }
                          }}
                          onChange={(e) => updateRevenue(index, "desconto", parseFloat(e.target.value) || 0)}
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
                <TableRow className="border-t-2 border-primary font-bold">
                  <TableCell colSpan={3} className="text-right">TOTAL</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(currentData.revenues.reduce((sum, r) => sum + r.valorLiquido, 0))}
                  </TableCell>
                </TableRow>
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
<<<<<<< HEAD
                          type="text"
                          value={division.percentual.toString()}
                          onChange={(e) => updateProfitDivision(index, e.target.value)}
=======
                          type="number"
                          step="1"
                          value={division.percentual}
                          onFocus={(e) => {
                            if (parseFloat(e.target.value) === 0) {
                              e.target.value = "";
                            }
                          }}
                          onChange={(e) => updateProfitDivision(index, "percentual", e.target.value)}
>>>>>>> 97812cb8171da4a455edfabc678181a58762b587
                          className="text-right"
                        />
                      ) : (
                        `${division.percentual}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
<<<<<<< HEAD
                      {formatCurrency(division.valor)}
=======
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={division.valor}
                          onFocus={(e) => {
                            if (parseFloat(e.target.value) === 0) {
                              e.target.value = "";
                            }
                          }}
                          onChange={(e) => updateProfitDivision(index, "valor", e.target.value)}
                          className="text-right"
                        />
                      ) : (
                        formatCurrency(division.valor)
                      )}
>>>>>>> 97812cb8171da4a455edfabc678181a58762b587
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

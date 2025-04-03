"use client"

import { useAppContext } from "@/contexts/app-context"
import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { exportToCSV, exportToPDF, prepareCategoriasSummaryForExport } from "@/lib/export-utils"
import { useMobileDetect } from "@/hooks/use-mobile"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57"]

interface RelatorioCategoriaProps {
  periodo: string
  tipo: string
}

export function RelatorioCategoria({ periodo, tipo }: RelatorioCategoriaProps) {
  const { transacoes, categorias } = useAppContext()
  const isMobile = useMobileDetect()

  // Filtrar transações com base no período e tipo
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      const data = new Date(t.data)
      const hoje = new Date()
      const mesAtual = hoje.getMonth()
      const anoAtual = hoje.getFullYear()

      // Filtrar por tipo
      if (tipo !== "todos" && t.tipo !== tipo) return false

      // Filtrar por período
      switch (periodo) {
        case "atual":
          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
        case "anterior":
          const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
          const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual
          return data.getMonth() === mesAnterior && data.getFullYear() === anoAnterior
        case "ultimos3":
          const tresAtras = new Date(hoje)
          tresAtras.setMonth(hoje.getMonth() - 3)
          return data >= tresAtras
        case "ultimos6":
          const seisAtras = new Date(hoje)
          seisAtras.setMonth(hoje.getMonth() - 6)
          return data >= seisAtras
        case "ano":
          return data.getFullYear() === anoAtual
        default:
          return true
      }
    })
  }, [transacoes, periodo, tipo])

  // Agrupar transações por categoria
  const dadosPorCategoria = useMemo(() => {
    const resultado: Record<string, { total: number; count: number; tipo: string }> = {}

    transacoesFiltradas.forEach((t) => {
      if (!resultado[t.categoria]) {
        const categoria = categorias.find((c) => c.id === t.categoria)
        resultado[t.categoria] = {
          total: 0,
          count: 0,
          tipo: categoria?.tipo || t.tipo,
        }
      }
      resultado[t.categoria].total += t.valor
      resultado[t.categoria].count += 1
    })

    return Object.entries(resultado)
      .map(([categoriaId, dados]) => {
        const categoria = categorias.find((c) => c.id === categoriaId)
        return {
          id: categoriaId,
          name: categoria?.nome || categoriaId,
          value: dados.total,
          count: dados.count,
          tipo: dados.tipo,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [transacoesFiltradas, categorias])

  const handleExportCSV = () => {
    const dadosExportacao = prepareCategoriasSummaryForExport(transacoesFiltradas, categorias, periodo)
    exportToCSV(dadosExportacao, `categorias-${periodo}-${tipo}`)
  }

  const handleExportPDF = () => {
    const dadosExportacao = prepareCategoriasSummaryForExport(transacoesFiltradas, categorias, periodo)

    // Definir título com base nos filtros
    const titulo = "Relatório por Categorias"
    let subtitulo = ""

    // Período
    switch (periodo) {
      case "atual":
        subtitulo += "Mês Atual"
        break
      case "anterior":
        subtitulo += "Mês Anterior"
        break
      case "ultimos3":
        subtitulo += "Últimos 3 Meses"
        break
      case "ultimos6":
        subtitulo += "Últimos 6 Meses"
        break
      case "ano":
        subtitulo += "Este Ano"
        break
    }

    // Tipo
    if (tipo !== "todos") {
      subtitulo += ` - ${tipo === "receita" ? "Receitas" : "Despesas"}`
    }

    // Formatadores personalizados
    const formatters = {
      total: (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)
      },
      media: (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)
      },
    }

    exportToPDF(dadosExportacao, `categorias-${periodo}-${tipo}`, titulo, subtitulo, formatters)
  }

  if (dadosPorCategoria.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma transação encontrada para os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dadosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosPorCategoria.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.name}</TableCell>
                  <TableCell>
                    <Badge variant={categoria.tipo === "receita" ? "success" : "destructive"}>
                      {categoria.tipo === "receita" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        categoria.tipo === "receita"
                          ? "text-green-600 dark:text-green-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(categoria.value)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{categoria.count}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(categoria.value / categoria.count)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}


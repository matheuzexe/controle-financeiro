"use client"

import { useAppContext } from "@/contexts/app-context"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format, subMonths, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { useMobileDetect } from "@/hooks/use-mobile"

interface RelatorioResumoProps {
  periodo: string
  tipo: string
}

export function RelatorioResumo({ periodo, tipo }: RelatorioResumoProps) {
  const { transacoes } = useAppContext()
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

  // Calcular totais
  const totais = useMemo(() => {
    const receitas = transacoesFiltradas.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)

    const despesas = transacoesFiltradas.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      total: transacoesFiltradas.length,
    }
  }, [transacoesFiltradas])

  // Dados para gráfico de evolução mensal
  const dadosEvolucaoMensal = useMemo(() => {
    const hoje = new Date()
    const meses = []

    // Determinar quantos meses mostrar com base no período
    let numMeses = 6
    if (periodo === "ultimos3") numMeses = 3
    if (periodo === "ano") numMeses = 12

    // Criar array com os meses
    for (let i = 0; i < numMeses; i++) {
      const mes = subMonths(hoje, numMeses - 1 - i)
      meses.push({
        mes: mes.getMonth(),
        ano: mes.getFullYear(),
        name: format(mes, "MMM", { locale: ptBR }),
        receitas: 0,
        despesas: 0,
        saldo: 0,
      })
    }

    // Preencher com os dados
    transacoes.forEach((t) => {
      const data = new Date(t.data)

      meses.forEach((m) => {
        const primeiroDia = new Date(m.ano, m.mes, 1)
        const ultimoDia = new Date(m.ano, m.mes + 1, 0)

        if (isWithinInterval(data, { start: primeiroDia, end: ultimoDia })) {
          if (t.tipo === "receita") {
            m.receitas += t.valor
          } else {
            m.despesas += t.valor
          }
        }
      })
    })

    // Calcular saldo
    meses.forEach((m) => {
      m.saldo = m.receitas - m.despesas
    })

    return meses
  }, [transacoes, periodo])

  // Dados para exportação
  const dadosExportacaoResumo = useMemo(() => {
    return {
      periodo: (() => {
        switch (periodo) {
          case "atual":
            return "Mês Atual"
          case "anterior":
            return "Mês Anterior"
          case "ultimos3":
            return "Últimos 3 Meses"
          case "ultimos6":
            return "Últimos 6 Meses"
          case "ano":
            return "Este Ano"
          default:
            return "Todos"
        }
      })(),
      tipo: (() => {
        switch (tipo) {
          case "receita":
            return "Receitas"
          case "despesa":
            return "Despesas"
          default:
            return "Todos"
        }
      })(),
      totalTransacoes: totais.total,
      totalReceitas: totais.receitas,
      totalDespesas: totais.despesas,
      saldo: totais.saldo,
    }
  }, [totais, periodo, tipo])

  const handleExportCSV = () => {
    // Exportar dados de evolução mensal
    exportToCSV(dadosEvolucaoMensal, `evolucao-mensal-${periodo}-${tipo}`)
  }

  const handleExportPDF = () => {
    // Criar um objeto com os dados do resumo para o PDF
    const resumoData = [
      {
        item: "Período",
        valor: dadosExportacaoResumo.periodo,
      },
      {
        item: "Tipo",
        valor: dadosExportacaoResumo.tipo,
      },
      {
        item: "Total de Transações",
        valor: dadosExportacaoResumo.totalTransacoes,
      },
      {
        item: "Total de Receitas",
        valor: dadosExportacaoResumo.totalReceitas,
      },
      {
        item: "Total de Despesas",
        valor: dadosExportacaoResumo.totalDespesas,
      },
      {
        item: "Saldo",
        valor: dadosExportacaoResumo.saldo,
      },
    ]

    // Formatadores personalizados
    const formatters = {
      valor: (valor: any) => {
        if (typeof valor === "number") {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(valor)
        }
        return valor
      },
    }

    exportToPDF(
      resumoData,
      `resumo-${periodo}-${tipo}`,
      "Relatório de Resumo Financeiro",
      `${dadosExportacaoResumo.periodo} - ${dadosExportacaoResumo.tipo}`,
      formatters,
    )
  }

  if (transacoesFiltradas.length === 0) {
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

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totais.receitas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totais.total} transações no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totais.despesas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totais.total} transações no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totais.saldo >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
              }`}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totais.saldo)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diferença entre receitas e despesas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Receitas e despesas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosEvolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#22c55e" />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Mensal</CardTitle>
          <CardDescription>Evolução do saldo ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosEvolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value)
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


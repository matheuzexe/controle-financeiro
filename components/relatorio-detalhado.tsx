"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { exportToCSV, exportToPDF, prepareTransacoesForExport } from "@/lib/export-utils"
import { useMobileDetect } from "@/hooks/use-mobile"

interface RelatorioDetalhadoProps {
  periodo: string
  tipo: string
}

export function RelatorioDetalhado({ periodo, tipo }: RelatorioDetalhadoProps) {
  const { transacoes, categorias } = useAppContext()
  const isMobile = useMobileDetect()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filtrar transações com base no período e tipo
  const transacoesFiltradas = transacoes
    .filter((t) => {
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
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const getNomeCategoria = (categoriaId: string) => {
    const categoria = categorias.find((c) => c.id === categoriaId)
    return categoria ? categoria.nome : categoriaId
  }

  const handleExportCSV = () => {
    const dadosExportacao = prepareTransacoesForExport(transacoesFiltradas, categorias)
    exportToCSV(dadosExportacao, `transacoes-${periodo}-${tipo}`)
  }

  const handleExportPDF = () => {
    const dadosExportacao = prepareTransacoesForExport(transacoesFiltradas, categorias)

    // Definir título com base nos filtros
    const titulo = "Relatório de Transações"
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
      valor: (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)
      },
    }

    exportToPDF(dadosExportacao, `transacoes-${periodo}-${tipo}`, titulo, subtitulo, formatters)
  }

  // Versão mobile das transações
  const MobileTransactionList = () => {
    return (
      <div className="space-y-4">
        {transacoesFiltradas.map((transacao) => (
          <Card key={transacao.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium truncate">{transacao.descricao || "Sem descrição"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant={transacao.tipo === "receita" ? "success" : "destructive"}>
                  {transacao.tipo === "receita" ? "Receita" : "Despesa"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">{getNomeCategoria(transacao.categoria)}</span>
                <span
                  className={`font-bold ${transacao.tipo === "receita" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(transacao.valor)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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

      {isMobile ? (
        <MobileTransactionList />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoesFiltradas.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell>{format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{transacao.descricao || "—"}</TableCell>
                  <TableCell>{getNomeCategoria(transacao.categoria)}</TableCell>
                  <TableCell>
                    <Badge variant={transacao.tipo === "receita" ? "success" : "destructive"}>
                      {transacao.tipo === "receita" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        transacao.tipo === "receita"
                          ? "text-green-600 dark:text-green-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(transacao.valor)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


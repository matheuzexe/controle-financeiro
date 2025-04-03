"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/contexts/app-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { BudgetSummary } from "@/types/budget"

export function ResumoOrcamentos() {
  const { budgets, categorias, transacoes } = useAppContext()

  // Get current month and year
  const dataAtual = new Date()
  const mesAtual = dataAtual.getMonth()
  const anoAtual = dataAtual.getFullYear()

  // Filter budgets for current month
  const budgetsAtuais = useMemo(() => {
    return budgets.filter((budget) => budget.mes === mesAtual && budget.ano === anoAtual)
  }, [budgets, mesAtual, anoAtual])

  // Calculate budget summaries with spending progress
  const budgetSummaries = useMemo(() => {
    // FIX: Added proper typing for the summaries array
    const summaries: BudgetSummary[] = []

    // First, create a summary for each budget
    for (const budget of budgetsAtuais) {
      const categoria = categorias.find((c) => c.id === budget.categoriaId)

      if (categoria) {
        // Calculate spending for this category in the current month
        const startDate = new Date(anoAtual, mesAtual, 1)
        const endDate = new Date(anoAtual, mesAtual + 1, 0)

        const gastoTotal = transacoes
          .filter(
            (t) =>
              t.categoria === budget.categoriaId &&
              t.tipo === "despesa" &&
              new Date(t.data) >= startDate &&
              new Date(t.data) <= endDate,
          )
          .reduce((sum, t) => sum + t.valor, 0)

        const percentual = budget.valor > 0 ? (gastoTotal / budget.valor) * 100 : 0

        summaries.push({
          categoriaId: budget.categoriaId,
          categoriaNome: categoria.nome,
          orcado: budget.valor,
          gasto: gastoTotal,
          percentual: Math.min(percentual, 100), // Cap at 100% for UI purposes
        })
      }
    }

    // Sort by percentage (highest first)
    return summaries.sort((a, b) => b.percentual - a.percentual).slice(0, 3)
  }, [budgetsAtuais, categorias, transacoes, mesAtual, anoAtual])

  // FIX: Improved function to determine progress bar color based on percentage
  const getProgressColor = (percentual: number): string => {
    if (percentual >= 100) return "bg-red-500"
    if (percentual >= 80) return "bg-orange-500"
    return "bg-green-500"
  }

  if (budgetsAtuais.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <p className="mb-4 text-muted-foreground">Você ainda não possui orçamentos para este mês.</p>
          <Link href="/orcamentos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Orçamento
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {budgetSummaries.map((summary) => (
        <div key={summary.categoriaId} className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{summary.categoriaNome}</h3>
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(summary.gasto)}{" "}
                de{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(summary.orcado)}
              </p>
            </div>
            <Badge
              variant={summary.percentual >= 100 ? "destructive" : summary.percentual >= 80 ? "default" : "success"}
              className={summary.percentual >= 100 ? "" : summary.percentual >= 80 ? "bg-orange-500" : ""}
            >
              {summary.percentual.toFixed(0)}%
            </Badge>
          </div>
          <Progress
            value={summary.percentual}
            className="h-2"
            indicatorClassName={getProgressColor(summary.percentual)}
          />
        </div>
      ))}

      <div className="pt-2 text-center">
        <Link href="/orcamentos">
          <Button variant="outline" size="sm">
            Ver todos os orçamentos
          </Button>
        </Link>
      </div>
    </div>
  )
}


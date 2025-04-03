"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/contexts/app-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight } from "lucide-react"

export function ResumoMetas() {
  const { budgets } = useAppContext()

  // Sort budgets by completion percentage (least complete first)
  const sortedBudgets = useMemo(() => {
    return [...budgets]
      .filter((b) => !b.concluido) // Only show incomplete budgets
      .sort((a, b) => {
        const percentA = a.valorMeta > 0 ? a.valorAtual / a.valorMeta : 0
        const percentB = b.valorMeta > 0 ? b.valorAtual / b.valorMeta : 0
        return percentA - percentB
      })
      .slice(0, 3) // Show only top 3
  }, [budgets])

  // Function to get progress color based on percentage
  const getProgressColor = (atual: number, meta: number): string => {
    const percentual = meta > 0 ? (atual / meta) * 100 : 0

    if (percentual >= 100) return "bg-green-500"
    if (percentual >= 75) return "bg-emerald-500"
    if (percentual >= 50) return "bg-blue-500"
    if (percentual >= 25) return "bg-amber-500"
    return "bg-red-500"
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <p className="mb-4 text-muted-foreground">Você ainda não possui metas de economia.</p>
          <Link href="/orcamentos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Meta
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sortedBudgets.map((budget) => {
        const percentual = budget.valorMeta > 0 ? (budget.valorAtual / budget.valorMeta) * 100 : 0
        const progressColor = getProgressColor(budget.valorAtual, budget.valorMeta)

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{budget.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(budget.valorAtual)}{" "}
                  de{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(budget.valorMeta)}
                </p>
              </div>
              <Badge variant="default" className="bg-blue-500">
                {percentual.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={percentual} className="h-2" indicatorClassName={progressColor} />
          </div>
        )
      })}

      <div className="pt-2 text-center">
        <Link href="/orcamentos">
          <Button variant="outline" size="sm" className="w-full">
            Ver todas as metas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}


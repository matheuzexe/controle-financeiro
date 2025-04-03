"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit, Trash, ChevronDown, CalendarRange, Target } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export default function Orcamentos() {
  const router = useRouter()
  const { budgets, excluirBudget, getSavingsTransactions } = useAppContext()
  const [budgetParaExcluir, setBudgetParaExcluir] = useState<string | null>(null)

  // Sort budgets by completion percentage (least complete first)
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      const percentA = a.valorMeta > 0 ? a.valorAtual / a.valorMeta : 0
      const percentB = b.valorMeta > 0 ? b.valorAtual / b.valorMeta : 0
      return percentA - percentB
    })
  }, [budgets])

  const handleExcluir = (id: string) => {
    excluirBudget(id)
    setBudgetParaExcluir(null)
  }

  const handleEditar = (id: string) => {
    router.push(`/orcamentos/editar/${id}`)
  }

  const handleVerDetalhes = (id: string) => {
    router.push(`/orcamentos/detalhes/${id}`)
  }

  // Function to get progress color based on percentage
  const getProgressColor = (atual: number, meta: number): string => {
    const percentual = meta > 0 ? (atual / meta) * 100 : 0

    if (percentual >= 100) return "bg-green-500"
    if (percentual >= 75) return "bg-emerald-500"
    if (percentual >= 50) return "bg-blue-500"
    if (percentual >= 25) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Metas de Economia</h1>
          <div className="flex items-center gap-2">
            <Link href="/orcamentos/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </Link>
          </div>
        </div>

        {budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="mb-4 text-muted-foreground">Você ainda não possui metas de economia configuradas.</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Crie metas para controlar suas economias e alcançar seus objetivos financeiros.
              </p>
              <Link href="/orcamentos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Meta
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedBudgets.map((budget) => {
              const percentual = budget.valorMeta > 0 ? (budget.valorAtual / budget.valorMeta) * 100 : 0
              const progressColor = getProgressColor(budget.valorAtual, budget.valorMeta)
              const savingsTransactions = getSavingsTransactions(budget.id)
              const lastTransaction =
                savingsTransactions.length > 0
                  ? savingsTransactions.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
                  : null

              return (
                <Card key={budget.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{budget.nome}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerDetalhes(budget.id)}>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditar(budget.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBudgetParaExcluir(budget.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {budget.descricao && <CardDescription className="line-clamp-2">{budget.descricao}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Progresso</p>
                          <p className="text-lg font-semibold">
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
                        <Badge
                          variant={budget.concluido ? "success" : "default"}
                          className={budget.concluido ? "" : "bg-blue-500"}
                        >
                          {percentual.toFixed(0)}%
                        </Badge>
                      </div>

                      <Progress value={percentual} className="h-2" indicatorClassName={progressColor} />

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarRange className="h-4 w-4 text-muted-foreground" />
                          <span>Início: {format(new Date(budget.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        {budget.dataFim && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>Meta: {format(new Date(budget.dataFim), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                        )}
                      </div>

                      {lastTransaction && (
                        <div className="text-sm text-muted-foreground pt-2 border-t">
                          <p>
                            Último depósito: {format(new Date(lastTransaction.data), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p>
                            Valor:{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(lastTransaction.valor)}
                          </p>
                        </div>
                      )}

                      <Button variant="outline" className="w-full" onClick={() => handleVerDetalhes(budget.id)}>
                        Ver detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!budgetParaExcluir}
        onOpenChange={(isOpen) => {
          if (!isOpen) setBudgetParaExcluir(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta de poupança? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => budgetParaExcluir && handleExcluir(budgetParaExcluir)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CalendarRange, Target, Plus, ArrowUpCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/contexts/app-context"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DetalhesBudget({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { budgets, getSavingsTransactions } = useAppContext()
  const [budget, setBudget] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const budgetFound = budgets.find((b) => b.id === params.id)

    if (budgetFound) {
      setBudget(budgetFound)

      // Get savings transactions for this budget
      const savingsTransactions = getSavingsTransactions(params.id)
      // Sort by date (newest first)
      const sortedTransactions = savingsTransactions.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
      )

      setTransactions(sortedTransactions)
      setLoading(false)
    } else {
      router.push("/orcamentos")
    }
  }, [params.id, budgets, getSavingsTransactions, router])

  // Function to get progress color based on percentage
  const getProgressColor = (atual: number, meta: number): string => {
    const percentual = meta > 0 ? (atual / meta) * 100 : 0

    if (percentual >= 100) return "bg-green-500"
    if (percentual >= 75) return "bg-emerald-500"
    if (percentual >= 50) return "bg-blue-500"
    if (percentual >= 25) return "bg-amber-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col p-4 md:p-8">
        <div className="flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  const percentual = budget.valorMeta > 0 ? (budget.valorAtual / budget.valorMeta) * 100 : 0
  const progressColor = getProgressColor(budget.valorAtual, budget.valorMeta)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mb-4">
          <Link href="/orcamentos" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar para Metas de Economia
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{budget.nome}</h1>
          <div className="flex items-center gap-2">
            <Link href={`/transacoes/nova?tipo=poupanca&budgetId=${budget.id}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Depósito
              </Button>
            </Link>
          </div>
        </div>

        {budget.descricao && <p className="text-muted-foreground">{budget.descricao}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progresso</CardTitle>
              <CardDescription>Acompanhe o progresso da sua meta de economia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
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

              <Progress value={percentual} className="h-4" indicatorClassName={progressColor} />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="flex items-center gap-1">
                    <CalendarRange className="h-4 w-4" />
                    {format(new Date(budget.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>

                {budget.dataFim && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Data da Meta</p>
                    <p className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {format(new Date(budget.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {budget.concluido && (
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md mt-4">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    Parabéns! Você atingiu sua meta de economia.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Informações sobre sua meta de economia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(budget.valorMeta)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Atual</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(budget.valorAtual)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Restante</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Math.max(0, budget.valorMeta - budget.valorAtual))}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total de Depósitos</p>
                  <p className="text-lg font-semibold">{transactions.length}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={budget.concluido ? "success" : "default"}
                  className={budget.concluido ? "" : "bg-blue-500"}
                >
                  {budget.concluido ? "Concluído" : "Em andamento"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Depósitos</CardTitle>
            <CardDescription>Todos os depósitos realizados para esta meta</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-6">
                <ArrowUpCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">Nenhum depósito realizado ainda.</p>
                <Link href={`/transacoes/nova?tipo=poupanca&budgetId=${budget.id}`} className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Depósito
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>{transaction.descricao || "—"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(transaction.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


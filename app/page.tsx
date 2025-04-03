"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, PiggyBank, Plus, ShoppingCart, User } from "lucide-react"
import { ResumoMensal } from "@/components/resumo-mensal"
import { UltimasTransacoes } from "@/components/ultimas-transacoes"
import { DistribuicaoDespesas } from "@/components/distribuicao-despesas"
import { useAppContext } from "@/contexts/app-context"
import { useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
// Import the ResumoMetas component
import { ResumoMetas } from "@/components/resumo-metas"

export default function Home() {
  const { transacoes, budgets } = useAppContext()

  const { saldoTotal, receitasMes, despesasMes, economiaMes, totalDevedores, gastosRegulares, totalPoupanca } =
    useMemo(() => {
      const dataAtual = new Date()
      const mesAtual = dataAtual.getMonth()
      const anoAtual = dataAtual.getFullYear()

      // Filtrar transações do mês atual
      const transacoesMesAtual = transacoes.filter((t) => {
        const data = new Date(t.data)
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
      })

      // Calcular totais
      const receitasMes = transacoesMesAtual.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0)

      // Separar despesas regulares e com devedores
      const despesasRegulares = transacoesMesAtual.filter(
        (t) => t.tipo === "despesa" && (t.tipoGasto === "regular" || !t.devedorNome),
      )

      const despesasDevedores = transacoesMesAtual.filter(
        (t) => t.tipo === "despesa" && (t.tipoGasto === "devedor" || !!t.devedorNome),
      )

      // Get savings transactions
      const poupancaTransacoes = transacoesMesAtual.filter((t) => t.tipo === "poupanca")

      const gastosRegulares = despesasRegulares.reduce((acc, t) => acc + t.valor, 0)
      const gastosDevedores = despesasDevedores.reduce((acc, t) => acc + t.valor, 0)
      const totalPoupanca = poupancaTransacoes.reduce((acc, t) => acc + t.valor, 0)

      const despesasMes = gastosRegulares + gastosDevedores

      // Calculate total balance (excluding savings)
      const saldoTotal = transacoes
        .filter((t) => t.tipo !== "poupanca") // Exclude savings from total balance
        .reduce((acc, t) => (t.tipo === "receita" ? acc + t.valor : acc - t.valor), 0)

      const economiaMes = receitasMes - despesasMes - totalPoupanca

      // Calcular total de devedores pendentes
      const totalDevedores = transacoes
        .filter((t) => (t.tipoGasto === "devedor" || !!t.devedorNome) && t.devedorStatus === "pendente")
        .reduce((acc, t) => acc + (t.devedorValor || t.valor), 0)

      return { saldoTotal, receitasMes, despesasMes, economiaMes, totalDevedores, gastosRegulares, totalPoupanca }
    }, [transacoes])

  // Get transactions with debtors
  const transacoesComDevedores = useMemo(() => {
    return transacoes.filter((t) => t.tipoGasto === "devedor" || !!t.devedorNome)
  }, [transacoes])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Painel de Controle</h1>
          <div className="flex items-center gap-2">
            <Link href="/transacoes/nova">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoes.length === 0
                  ? "Adicione transações para ver seu saldo"
                  : "Saldo atual (excluindo poupança)"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receitasMes)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoes.length === 0 ? "Adicione receitas para ver o total" : "Total de receitas do mês atual"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Regulares</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(gastosRegulares)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoes.length === 0 ? "Adicione despesas para ver o total" : "Total de gastos regulares do mês"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia do Mês</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPoupanca)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoes.length === 0 ? "Adicione poupança para ver o total" : "Total economizado no mês"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valores a Receber</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalDevedores)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoesComDevedores.length === 0
                  ? "Adicione devedores para ver o total"
                  : "Total de valores a receber"}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Find the Tabs section in the dashboard and add a Budget tab */}
        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList className="w-full sm:w-auto overflow-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="devedores">Devedores</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>

          {/* Add the Budget tab content */}
          <TabsContent value="metas" className="space-y-4">
            <Card className="bg-card/95 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Metas de Economia</CardTitle>
                <CardDescription>Acompanhe o progresso das suas metas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResumoMetas />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resumo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 bg-card/90 backdrop-blur-sm border">
                <CardHeader>
                  <CardTitle>Resumo Mensal</CardTitle>
                  <CardDescription>Comparativo de receitas e despesas dos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResumoMensal />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3 bg-card/90 backdrop-blur-sm border">
                <CardHeader>
                  <CardTitle>Distribuição de Despesas</CardTitle>
                  <CardDescription>Distribuição de despesas por categoria no mês atual</CardDescription>
                </CardHeader>
                <CardContent>
                  <DistribuicaoDespesas />
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card/90 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Últimas Transações</CardTitle>
                <CardDescription>Visualize suas transações mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <UltimasTransacoes />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transacoes" className="space-y-4">
            <Card className="bg-card/95 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Histórico completo de todas as suas transações</CardDescription>
              </CardHeader>
              <CardContent>
                <UltimasTransacoes />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="devedores" className="space-y-4">
            <Card className="bg-card/95 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Devedores</CardTitle>
                <CardDescription>Pessoas que devem dinheiro a você</CardDescription>
              </CardHeader>
              <CardContent>
                {transacoesComDevedores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="mb-4 text-muted-foreground">Você ainda não possui devedores registrados.</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ao adicionar uma transação, selecione a opção "Gasto com Devedor".
                    </p>
                    <Link href="/transacoes/nova">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Transação com Devedor
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transacoesComDevedores
                      .filter((t) => t.devedorStatus === "pendente")
                      .slice(0, 3)
                      .map((transacao) => (
                        <div key={transacao.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{transacao.devedorNome}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-muted-foreground">{transacao.descricao}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 dark:text-blue-500">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(transacao.devedorValor || transacao.valor)}
                            </p>
                            <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                              Pendente
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {transacoesComDevedores.filter((t) => t.devedorStatus === "pendente").length > 3 && (
                      <div className="text-center mt-2">
                        <Button
                          variant="link"
                          onClick={() => document.querySelector('[data-value="transacoes"]')?.click()}
                        >
                          Ver todas as transações com devedores
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categorias" className="space-y-4">
            <Card className="bg-card/95 backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Gerenciamento de Categorias</CardTitle>
                <CardDescription>Gerencie suas categorias de despesas e receitas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/categorias">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Gerenciar Categorias
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


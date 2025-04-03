"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RelatorioResumo } from "@/components/relatorio-resumo"
import { RelatorioDetalhado } from "@/components/relatorio-detalhado"
import { RelatorioCategoria } from "@/components/relatorio-categorias"
import { useAppContext } from "@/contexts/app-context"

export default function Relatorios() {
  const { transacoes } = useAppContext()
  const [periodo, setPeriodo] = useState("atual")
  const [tipo, setTipo] = useState("todos")
  const [tabAtiva, setTabAtiva] = useState("resumo")

  const temTransacoes = transacoes.length > 0

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="grid gap-2">
            <label htmlFor="periodo" className="text-sm font-medium">
              Período
            </label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger id="periodo" className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atual">Mês Atual</SelectItem>
                <SelectItem value="anterior">Mês Anterior</SelectItem>
                <SelectItem value="ultimos3">Últimos 3 meses</SelectItem>
                <SelectItem value="ultimos6">Últimos 6 meses</SelectItem>
                <SelectItem value="ano">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="tipo" className="text-sm font-medium">
              Tipo
            </label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo" className="w-[180px]">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
          <TabsList className="w-full sm:w-auto overflow-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
            <TabsTrigger value="categorias">Por Categorias</TabsTrigger>
          </TabsList>

          {temTransacoes ? (
            <>
              <TabsContent value="resumo" className="space-y-4">
                <RelatorioResumo periodo={periodo} tipo={tipo} />
              </TabsContent>
              <TabsContent value="detalhado" className="space-y-4">
                <RelatorioDetalhado periodo={periodo} tipo={tipo} />
              </TabsContent>
              <TabsContent value="categorias" className="space-y-4">
                <RelatorioCategoria periodo={periodo} tipo={tipo} />
              </TabsContent>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sem dados para exibir</CardTitle>
                <CardDescription>Adicione transações para gerar relatórios</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">Você ainda não possui dados suficientes para gerar relatórios.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione transações para visualizar seus relatórios financeiros.
                </p>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </main>
    </div>
  )
}


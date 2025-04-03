"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAppContext } from "@/contexts/app-context"
import { useMemo } from "react"
import { useTheme } from "next-themes"
import { useMobileDetect } from "@/hooks/use-mobile"

export function ResumoMensal() {
  const { transacoes } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const isMobile = useMobileDetect()

  const data = useMemo(() => {
    const dataAtual = new Date()
    const mesAtual = dataAtual.getMonth()
    const anoAtual = dataAtual.getFullYear()

    // Criar array com os últimos 6 meses
    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const mes = new Date(anoAtual, mesAtual - 5 + i, 1)
      return {
        mes: mes.getMonth(),
        ano: mes.getFullYear(),
        name:
          mes.toLocaleDateString("pt-BR", { month: "short" }).charAt(0).toUpperCase() +
          mes.toLocaleDateString("pt-BR", { month: "short" }).slice(1),
        receitas: 0,
        despesas: 0,
      }
    })

    // Preencher com os dados das transações
    transacoes.forEach((transacao) => {
      const data = new Date(transacao.data)
      const mes = data.getMonth()
      const ano = data.getFullYear()

      const mesIndex = ultimos6Meses.findIndex((m) => m.mes === mes && m.ano === ano)

      if (mesIndex !== -1) {
        if (transacao.tipo === "receita") {
          ultimos6Meses[mesIndex].receitas += transacao.valor
        } else {
          ultimos6Meses[mesIndex].despesas += transacao.valor
        }
      }
    })

    return ultimos6Meses
  }, [transacoes])

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
        <XAxis dataKey="name" stroke={isDark ? "#ccc" : "#333"} />
        <YAxis stroke={isDark ? "#ccc" : "#333"} />
        <Tooltip
          formatter={(value) => `R$ ${value.toFixed(2)}`}
          labelFormatter={(label) => `Mês: ${label}`}
          contentStyle={{ backgroundColor: isDark ? "#333" : "#fff", borderColor: isDark ? "#555" : "#ddd" }}
          labelStyle={{ color: isDark ? "#fff" : "#333" }}
        />
        <Legend />
        <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}


"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useAppContext } from "@/contexts/app-context"
import { useMemo } from "react"
import { useTheme } from "next-themes"
import { useMobileDetect } from "@/hooks/use-mobile"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57"]

export function DistribuicaoDespesas() {
  const { transacoes, categorias } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const isMobile = useMobileDetect()

  const data = useMemo(() => {
    const dataAtual = new Date()
    const mesAtual = dataAtual.getMonth()
    const anoAtual = dataAtual.getFullYear()

    // Filtrar despesas do mês atual
    const despesasMesAtual = transacoes.filter((t) => {
      const data = new Date(t.data)
      return t.tipo === "despesa" && data.getMonth() === mesAtual && data.getFullYear() === anoAtual
    })

    if (despesasMesAtual.length === 0) {
      return [{ name: "Sem dados", value: 1 }]
    }

    // Agrupar por categoria
    const despesasPorCategoria: Record<string, number> = {}

    despesasMesAtual.forEach((despesa) => {
      if (!despesasPorCategoria[despesa.categoria]) {
        despesasPorCategoria[despesa.categoria] = 0
      }
      despesasPorCategoria[despesa.categoria] += despesa.valor
    })

    // Converter para o formato do gráfico
    return Object.entries(despesasPorCategoria).map(([categoriaId, valor]) => {
      const categoria = categorias.find((c) => c.id === categoriaId)
      return {
        name: categoria ? categoria.nome : categoriaId,
        value: valor,
      }
    })
  }, [transacoes, categorias])

  return (
    <div className="flex flex-col items-center justify-center h-[300px]">
      {data.length === 1 && data[0].name === "Sem dados" ? (
        <div className="text-center text-muted-foreground">
          <p>Sem dados para exibir</p>
          <p className="text-sm mt-2">Adicione despesas para visualizar a distribuição</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: isDark ? "#333" : "#fff", borderColor: isDark ? "#555" : "#ddd" }}
              labelStyle={{ color: isDark ? "#fff" : "#333" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}


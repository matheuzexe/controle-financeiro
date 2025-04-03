import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { Transacao, Categoria } from "@/contexts/app-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Função para exportar para CSV
export function exportToCSV(data: any[], filename: string) {
  // Converter objetos para array de arrays
  const header = Object.keys(data[0])
  const csv = [
    header.join(","), // Cabeçalho
    ...data.map((row) =>
      header
        .map((fieldName) => {
          // Formatar valores especiais
          if (fieldName === "data" && row[fieldName] instanceof Date) {
            return `"${format(row[fieldName], "dd/MM/yyyy", { locale: ptBR })}"`
          }
          // Escapar aspas e vírgulas em strings
          if (typeof row[fieldName] === "string") {
            return `"${row[fieldName].replace(/"/g, '""')}"`
          }
          return row[fieldName]
        })
        .join(","),
    ),
  ].join("\r\n")

  // Criar blob e link para download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Função para exportar para PDF
export function exportToPDF(
  data: any[],
  filename: string,
  title: string,
  subtitle?: string,
  formatters?: Record<string, (value: any) => string>,
) {
  const doc = new jsPDF()

  // Adicionar título
  doc.setFontSize(18)
  doc.text(title, 14, 22)

  // Adicionar subtítulo se fornecido
  if (subtitle) {
    doc.setFontSize(12)
    doc.text(subtitle, 14, 30)
  }

  // Preparar dados para a tabela
  const headers = Object.keys(data[0]).map((key) => {
    // Converter camelCase para Title Case
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  })

  const rows = data.map((row) => {
    return Object.keys(row).map((key) => {
      // Aplicar formatadores personalizados se fornecidos
      if (formatters && formatters[key]) {
        return formatters[key](row[key])
      }

      // Formatação padrão para tipos comuns
      if (key === "data" && row[key] instanceof Date) {
        return format(row[key], "dd/MM/yyyy", { locale: ptBR })
      }
      if (typeof row[key] === "number") {
        return row[key].toLocaleString("pt-BR", { minimumFractionDigits: 2 })
      }
      return row[key]
    })
  })

  // Criar tabela
  const startY = subtitle ? 35 : 30

  // @ts-ignore - jspdf-autotable adiciona este método
  doc.autoTable({
    head: [headers],
    body: rows,
    startY,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  // Adicionar rodapé com data
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const now = new Date()
    const dateStr = format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })
    doc.text(`Gerado em: ${dateStr} - Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10)
  }

  // Salvar o PDF
  doc.save(`${filename}.pdf`)
}

// Função para preparar dados de transações para exportação
export function prepareTransacoesForExport(transacoes: Transacao[], categorias: Categoria[]) {
  return transacoes.map((t) => {
    const categoria = categorias.find((c) => c.id === t.categoria)
    return {
      data: t.data,
      descricao: t.descricao,
      categoria: categoria?.nome || t.categoria,
      tipo: t.tipo === "receita" ? "Receita" : "Despesa",
      valor: t.valor,
    }
  })
}

// Função para preparar dados de resumo por categoria para exportação
export function prepareCategoriasSummaryForExport(transacoes: Transacao[], categorias: Categoria[], periodo: string) {
  // Agrupar transações por categoria
  const categoriasMap: Record<string, { total: number; count: number }> = {}

  transacoes.forEach((t) => {
    if (!categoriasMap[t.categoria]) {
      categoriasMap[t.categoria] = { total: 0, count: 0 }
    }
    categoriasMap[t.categoria].total += t.valor
    categoriasMap[t.categoria].count += 1
  })

  // Converter para array para exportação
  return Object.entries(categoriasMap).map(([categoriaId, dados]) => {
    const categoria = categorias.find((c) => c.id === categoriaId)
    return {
      categoria: categoria?.nome || categoriaId,
      tipo: categoria?.tipo === "receita" ? "Receita" : "Despesa",
      total: dados.total,
      quantidade: dados.count,
      media: dados.total / dados.count,
    }
  })
}


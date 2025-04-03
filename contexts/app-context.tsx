"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Transacao = {
  id: string
  data: Date
  descricao: string
  categoria: string
  tipo: "receita" | "despesa" | "poupanca" // Add "poupanca" (savings) type
  valor: number
  // Add debtor fields to the transaction type
  devedorNome?: string
  devedorValor?: number
  devedorStatus?: "pendente" | "pago"
  // Add budget allocation field
  budgetId?: string
}

export type Categoria = {
  id: string
  nome: string
  tipo: "receita" | "despesa" | "poupanca" // Add "poupanca" type
}

// Add debtor type
export type Debtor = {
  id: string
  nome: string
  valor: number
  data: Date
  descricao?: string
  status: "pendente" | "pago"
}

// Add the Budget type import
import type { Budget, SavingsTransaction } from "@/types/budget"

// Add budgets to the AppContextType
type AppContextType = {
  transacoes: Transacao[]
  adicionarTransacao: (transacao: Omit<Transacao, "id">) => void
  editarTransacao: (id: string, transacao: Omit<Transacao, "id">) => void
  excluirTransacao: (id: string) => void
  atualizarStatusDevedor: (id: string, status: "pendente" | "pago") => void
  categorias: Categoria[]
  adicionarCategoria: (categoria: Omit<Categoria, "id">) => void
  editarCategoria: (id: string, categoria: Omit<Categoria, "id">) => void
  excluirCategoria: (id: string) => void
  limparDados: () => void
  // Update budget state and functions
  budgets: Budget[]
  adicionarBudget: (budget: Omit<Budget, "id" | "valorAtual" | "concluido">) => void
  editarBudget: (id: string, budget: Omit<Budget, "id" | "valorAtual" | "concluido">) => void
  excluirBudget: (id: string) => void
  // Add savings transaction functions
  adicionarSavingsTransaction: (transaction: Omit<SavingsTransaction, "id">) => void
  // Add function to get savings transactions for a budget
  getSavingsTransactions: (budgetId: string) => SavingsTransaction[]
  // Add debtors state and functions
  debtors: Debtor[]
  adicionarDebtor: (debtor: Omit<Debtor, "id">) => void
  editarDebtor: (id: string, debtor: Omit<Debtor, "id">) => void
  excluirDebtor: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Função para serializar datas corretamente
const serializeData = (data: any) => {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

// Função para deserializar datas corretamente
const deserializeData = (jsonString: string) => {
  return JSON.parse(jsonString, (key, value) => {
    if (value && typeof value === "object" && value.__type === "Date") {
      return new Date(value.value)
    }
    return value
  })
}

// Categorias padrão
const categoriasIniciais: Categoria[] = [
  // Categorias padrão de despesas
  { id: "alimentacao", nome: "Alimentação", tipo: "despesa" },
  { id: "moradia", nome: "Moradia", tipo: "despesa" },
  { id: "transporte", nome: "Transporte", tipo: "despesa" },
  { id: "saude", nome: "Saúde", tipo: "despesa" },
  { id: "educacao", nome: "Educação", tipo: "despesa" },
  { id: "lazer", nome: "Lazer", tipo: "despesa" },
  { id: "outros-despesa", nome: "Outros", tipo: "despesa" },

  // Categorias padrão de receitas
  { id: "salario", nome: "Salário", tipo: "receita" },
  { id: "freelance", nome: "Freelance", tipo: "receita" },
  { id: "investimentos", nome: "Investimentos", tipo: "receita" },
  { id: "vendas", nome: "Vendas", tipo: "receita" },
  { id: "outros-receita", nome: "Outros", tipo: "receita" },

  // Add savings category
  { id: "poupanca", nome: "Economia", tipo: "poupanca" },
]

// Add budgets state to the AppProvider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([])
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar dados do localStorage quando o componente montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTransacoes = localStorage.getItem("financeiro_transacoes")
        const storedCategorias = localStorage.getItem("financeiro_categorias")
        const storedDebtors = localStorage.getItem("financeiro_debtors")

        if (storedTransacoes) {
          const parsedTransacoes = deserializeData(storedTransacoes)
          setTransacoes(parsedTransacoes)
        }

        if (storedCategorias) {
          const parsedCategorias = deserializeData(storedCategorias)
          setCategorias(parsedCategorias)
        } else {
          // Se não houver categorias salvas, usar as categorias iniciais
          localStorage.setItem("financeiro_categorias", serializeData(categoriasIniciais))
        }

        if (storedDebtors) {
          const parsedDebtors = deserializeData(storedDebtors)
          setDebtors(parsedDebtors)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        // Em caso de erro, resetar para os valores padrão
        localStorage.setItem("financeiro_categorias", serializeData(categoriasIniciais))
      }

      setIsLoaded(true)
    }
  }, [])

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("financeiro_transacoes", serializeData(transacoes))
    }
  }, [transacoes, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("financeiro_categorias", serializeData(categorias))
    }
  }, [categorias, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("financeiro_debtors", serializeData(debtors))
    }
  }, [debtors, isLoaded])

  // Load budgets
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedBudgets = localStorage.getItem("financeiro_budgets")

        if (storedBudgets) {
          const parsedBudgets = deserializeData(storedBudgets)
          setBudgets(parsedBudgets)
        }

        // Load savings transactions
        const storedSavingsTransactions = localStorage.getItem("financeiro_savings_transactions")

        if (storedSavingsTransactions) {
          const parsedSavingsTransactions = deserializeData(storedSavingsTransactions)
          setSavingsTransactions(parsedSavingsTransactions)
        }
      } catch (error) {
        console.error("Erro ao carregar orçamentos:", error)
      }
    }
  }, [])

  // Save budgets to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("financeiro_budgets", serializeData(budgets))
    }
  }, [budgets, isLoaded])

  // Save savings transactions to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("financeiro_savings_transactions", serializeData(savingsTransactions))
    }
  }, [savingsTransactions, isLoaded])

  const adicionarTransacao = (transacao: Omit<Transacao, "id">) => {
    const novaTransacao = {
      ...transacao,
      id: Date.now().toString(),
    }

    // If it's a savings transaction and has a budgetId, update the budget's current value
    if (transacao.tipo === "poupanca" && transacao.budgetId) {
      const budgetIndex = budgets.findIndex((b) => b.id === transacao.budgetId)

      if (budgetIndex !== -1) {
        const budget = budgets[budgetIndex]
        const novoValorAtual = budget.valorAtual + transacao.valor
        const concluido = novoValorAtual >= budget.valorMeta

        // Update the budget
        const updatedBudgets = [...budgets]
        updatedBudgets[budgetIndex] = {
          ...budget,
          valorAtual: novoValorAtual,
          concluido: concluido,
        }

        setBudgets(updatedBudgets)

        // Add a savings transaction
        adicionarSavingsTransaction({
          budgetId: transacao.budgetId,
          valor: transacao.valor,
          data: transacao.data,
          descricao: transacao.descricao,
        })
      }
    }

    setTransacoes((prev) => [...prev, novaTransacao])
  }

  const editarTransacao = (id: string, transacao: Omit<Transacao, "id">) => {
    const oldTransaction = transacoes.find((t) => t.id === id)

    // If this is a savings transaction with a budgetId, we need to update the budget
    if (oldTransaction?.tipo === "poupanca" && oldTransaction.budgetId) {
      // First, remove the old amount from the budget
      const budgetIndex = budgets.findIndex((b) => b.id === oldTransaction.budgetId)

      if (budgetIndex !== -1) {
        const budget = budgets[budgetIndex]
        const novoValorAtual = Math.max(0, budget.valorAtual - oldTransaction.valor)

        // Update the budget
        const updatedBudgets = [...budgets]
        updatedBudgets[budgetIndex] = {
          ...budget,
          valorAtual: novoValorAtual,
          concluido: novoValorAtual >= budget.valorMeta,
        }

        setBudgets(updatedBudgets)
      }
    }

    // If the new transaction is a savings transaction with a budgetId, add to that budget
    if (transacao.tipo === "poupanca" && transacao.budgetId) {
      const budgetIndex = budgets.findIndex((b) => b.id === transacao.budgetId)

      if (budgetIndex !== -1) {
        const budget = budgets[budgetIndex]
        const novoValorAtual = budget.valorAtual + transacao.valor

        // Update the budget
        const updatedBudgets = [...budgets]
        updatedBudgets[budgetIndex] = {
          ...budget,
          valorAtual: novoValorAtual,
          concluido: novoValorAtual >= budget.valorMeta,
        }

        setBudgets(updatedBudgets)

        // Update or add a savings transaction
        const savingsTransactionIndex = savingsTransactions.findIndex(
          (st) => st.budgetId === transacao.budgetId && st.data.getTime() === transacao.data.getTime(),
        )

        if (savingsTransactionIndex !== -1) {
          const updatedSavingsTransactions = [...savingsTransactions]
          updatedSavingsTransactions[savingsTransactionIndex] = {
            ...updatedSavingsTransactions[savingsTransactionIndex],
            valor: transacao.valor,
            descricao: transacao.descricao,
          }
          setSavingsTransactions(updatedSavingsTransactions)
        } else {
          adicionarSavingsTransaction({
            budgetId: transacao.budgetId,
            valor: transacao.valor,
            data: transacao.data,
            descricao: transacao.descricao,
          })
        }
      }
    }

    setTransacoes((prev) => prev.map((t) => (t.id === id ? { ...transacao, id } : t)))
  }

  const excluirTransacao = (id: string) => {
    const transaction = transacoes.find((t) => t.id === id)

    // If this is a savings transaction with a budgetId, we need to update the budget
    if (transaction?.tipo === "poupanca" && transaction.budgetId) {
      const budgetIndex = budgets.findIndex((b) => b.id === transaction.budgetId)

      if (budgetIndex !== -1) {
        const budget = budgets[budgetIndex]
        const novoValorAtual = Math.max(0, budget.valorAtual - transaction.valor)

        // Update the budget
        const updatedBudgets = [...budgets]
        updatedBudgets[budgetIndex] = {
          ...budget,
          valorAtual: novoValorAtual,
          concluido: novoValorAtual >= budget.valorMeta,
        }

        setBudgets(updatedBudgets)

        // Remove the savings transaction
        setSavingsTransactions((prev) =>
          prev.filter(
            (st) =>
              !(
                st.budgetId === transaction.budgetId &&
                st.data.getTime() === transaction.data.getTime() &&
                st.valor === transaction.valor
              ),
          ),
        )
      }
    }

    setTransacoes((prev) => prev.filter((t) => t.id !== id))
  }

  // Add function to update debtor status
  const atualizarStatusDevedor = (id: string, status: "pendente" | "pago") => {
    setTransacoes((prev) => prev.map((t) => (t.id === id ? { ...t, devedorStatus: status } : t)))
  }

  const adicionarCategoria = (categoria: Omit<Categoria, "id">) => {
    const novaCategoria = {
      ...categoria,
      id: Date.now().toString(),
    }
    setCategorias((prev) => [...prev, novaCategoria])
  }

  const editarCategoria = (id: string, categoria: Omit<Categoria, "id">) => {
    setCategorias((prev) => prev.map((c) => (c.id === id ? { ...categoria, id } : c)))
  }

  const excluirCategoria = (id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  // Debtor functions
  const adicionarDebtor = (debtor: Omit<Debtor, "id">) => {
    const novoDebtor = {
      ...debtor,
      id: Date.now().toString(),
    }
    setDebtors((prev) => [...prev, novoDebtor])
  }

  const editarDebtor = (id: string, debtor: Omit<Debtor, "id">) => {
    setDebtors((prev) => prev.map((d) => (d.id === id ? { ...debtor, id } : d)))
  }

  const excluirDebtor = (id: string) => {
    setDebtors((prev) => prev.filter((d) => d.id !== id))
  }

  const limparDados = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("financeiro_transacoes")
      localStorage.removeItem("financeiro_categorias")
      localStorage.removeItem("financeiro_budgets")
      localStorage.removeItem("financeiro_savings_transactions")
      localStorage.removeItem("financeiro_debtors")
      setTransacoes([])
      setCategorias(categoriasIniciais)
      setBudgets([])
      setSavingsTransactions([])
      setDebtors([])
    }
  }

  // Update budget functions
  const adicionarBudget = (budget: Omit<Budget, "id" | "valorAtual" | "concluido">) => {
    const novoBudget = {
      ...budget,
      id: Date.now().toString(),
      valorAtual: 0,
      concluido: false,
    }
    setBudgets((prev) => [...prev, novoBudget])
  }

  const editarBudget = (id: string, budget: Omit<Budget, "id" | "valorAtual" | "concluido">) => {
    const currentBudget = budgets.find((b) => b.id === id)

    if (currentBudget) {
      const updatedBudget = {
        ...budget,
        id,
        valorAtual: currentBudget.valorAtual,
        concluido: currentBudget.valorAtual >= budget.valorMeta,
      }

      setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)))
    }
  }

  const excluirBudget = (id: string) => {
    // Remove all savings transactions for this budget
    setSavingsTransactions((prev) => prev.filter((st) => st.budgetId !== id))

    // Remove the budget
    setBudgets((prev) => prev.filter((b) => b.id !== id))

    // Update any transactions that reference this budget
    setTransacoes((prev) =>
      prev.map((t) => {
        if (t.budgetId === id) {
          return { ...t, budgetId: undefined }
        }
        return t
      }),
    )
  }

  // Add savings transaction functions
  const adicionarSavingsTransaction = (transaction: Omit<SavingsTransaction, "id">) => {
    const novaTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setSavingsTransactions((prev) => [...prev, novaTransaction])
  }

  // Get savings transactions for a budget
  const getSavingsTransactions = (budgetId: string) => {
    return savingsTransactions.filter((st) => st.budgetId === budgetId)
  }

  // Update the context value
  return (
    <AppContext.Provider
      value={{
        transacoes,
        adicionarTransacao,
        editarTransacao,
        excluirTransacao,
        atualizarStatusDevedor,
        categorias,
        adicionarCategoria,
        editarCategoria,
        excluirCategoria,
        limparDados,
        // Add budget functions
        budgets,
        adicionarBudget,
        editarBudget,
        excluirBudget,
        // Add savings transaction functions
        adicionarSavingsTransaction,
        getSavingsTransactions,
        // Add debtor functions
        debtors,
        adicionarDebtor,
        editarDebtor,
        excluirDebtor,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext deve ser usado dentro de um AppProvider")
  }
  return context
}


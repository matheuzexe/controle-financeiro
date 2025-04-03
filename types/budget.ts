export type Budget = {
  id: string
  nome: string
  descricao?: string
  valorMeta: number // Target amount
  valorAtual: number // Current saved amount
  dataInicio: Date // Start date
  dataFim?: Date // Optional end date
  concluido: boolean // Whether the goal has been reached
  categoria?: string // Optional category
}

export type SavingsTransaction = {
  id: string
  budgetId: string
  valor: number
  data: Date
  descricao?: string
}

export type BudgetSummary = {
  categoriaId?: string
  categoriaNome?: string
  id?: string
  nome?: string
  orcado?: number
  gasto?: number
  valorMeta?: number
  valorAtual?: number
  percentual: number
  dataInicio?: Date
  dataFim?: Date
  concluido?: boolean
}


export type Transacao = {
  id: string
  data: Date
  descricao: string
  categoria: string
  tipo: "receita" | "despesa"
  valor: number
  devedorNome?: string
  devedorValor?: number
  devedorStatus?: "pendente" | "pago"
}


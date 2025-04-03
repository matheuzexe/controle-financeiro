"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { Separator } from "@/components/ui/separator"

// Define the Transacao type
type Transacao = {
  id?: string
  tipo: "receita" | "despesa"
  valor: number
  data: Date
  categoria: string
  descricao?: string
  devedorNome?: string
  devedorValor?: number
  devedorStatus?: "pendente" | "pago"
  tipoGasto?: "regular" | "devedor"
}

const formSchema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  valor: z.string().min(1, { message: "Valor é obrigatório" }),
  data: z.date({ required_error: "Data é obrigatória" }),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  descricao: z.string().optional(),
  // Add expense type field
  tipoGasto: z.enum(["regular", "devedor"]).optional(),
  // Add debtor fields
  devedorNome: z.string().optional(),
  devedorValor: z.string().optional(),
  devedorStatus: z.enum(["pendente", "pago"]).optional(),
})

export default function EditarTransacao({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { transacoes, editarTransacao, categorias } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [showDebtorFields, setShowDebtorFields] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "receita",
      valor: "",
      categoria: "",
      descricao: "",
      tipoGasto: "regular",
      devedorNome: "",
      devedorValor: "",
      devedorStatus: "pendente",
    },
  })

  useEffect(() => {
    const transacaoEncontrada = transacoes.find((t) => t.id === params.id)

    if (transacaoEncontrada) {
      // Check if transaction has debtor information
      const hasDebtor = !!transacaoEncontrada.devedorNome
      const tipoGasto = hasDebtor ? "devedor" : "regular"

      form.reset({
        tipo: transacaoEncontrada.tipo,
        valor: transacaoEncontrada.valor.toString().replace(".", ","),
        data: transacaoEncontrada.data,
        categoria: transacaoEncontrada.categoria,
        descricao: transacaoEncontrada.descricao || "",
        tipoGasto: transacaoEncontrada.tipoGasto || tipoGasto,
        devedorNome: transacaoEncontrada.devedorNome || "",
        devedorValor: transacaoEncontrada.devedorValor
          ? transacaoEncontrada.devedorValor.toString().replace(".", ",")
          : "",
        devedorStatus: transacaoEncontrada.devedorStatus || "pendente",
      })

      setShowDebtorFields(hasDebtor)
      setLoading(false)
    } else {
      toast({
        title: "Erro",
        description: "Transação não encontrada ou você ainda não possui transações.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [params.id, form, router, transacoes])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Converter valor para número
    const valorNumerico = Number.parseFloat(values.valor.replace(/\./g, "").replace(",", "."))

    // Prepare transaction data
    const transacaoData: Omit<Transacao, "id"> = {
      tipo: values.tipo,
      valor: valorNumerico,
      data: values.data,
      categoria: values.categoria,
      descricao: values.descricao || "",
    }

    // Add expense type and debtor information if applicable
    if (values.tipo === "despesa") {
      transacaoData.tipoGasto = values.tipoGasto || "regular"

      if (values.tipoGasto === "devedor" && values.devedorNome) {
        const devedorValorNumerico = values.devedorValor
          ? Number.parseFloat(values.devedorValor.replace(/\./g, "").replace(",", "."))
          : valorNumerico // Default to transaction value if not specified

        transacaoData.devedorNome = values.devedorNome
        transacaoData.devedorValor = devedorValorNumerico
        transacaoData.devedorStatus = values.devedorStatus || "pendente"
      }
    }

    editarTransacao(params.id, transacaoData)

    toast({
      title: "Transação atualizada com sucesso!",
      description: "Suas alterações foram salvas.",
    })

    router.push("/")
  }

  const tipoTransacao = form.watch("tipo")
  const categoriasFiltradas = categorias.filter((cat) => cat.tipo === tipoTransacao)

  // Watch for expense type changes
  const tipoGasto = form.watch("tipoGasto")

  // Update UI state when expense type changes
  React.useEffect(() => {
    if (tipoTransacao === "despesa" && tipoGasto === "devedor") {
      setShowDebtorFields(true)
    } else {
      setShowDebtorFields(false)
    }
  }, [tipoTransacao, tipoGasto])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-3 md:p-8 w-full">
        <Card className="bg-card/95 backdrop-blur-sm border w-full">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-8 w-full">
      <div className="mb-4">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar ao painel
        </Link>
      </div>
      <Card className="bg-card/95 backdrop-blur-sm border w-full">
        <CardHeader>
          <CardTitle>Editar Transação</CardTitle>
          <CardDescription>Atualize os dados da transação selecionada</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <RadioGroup
                value={form.watch("tipo")}
                className="grid grid-cols-2 gap-2 sm:gap-4"
                onValueChange={(value) => {
                  form.setValue("tipo", value as "receita" | "despesa")
                  // Reset expense type when changing transaction type
                  if (value === "receita") {
                    form.setValue("tipoGasto", undefined)
                    setShowDebtorFields(false)
                  } else if (!form.getValues("tipoGasto")) {
                    form.setValue("tipoGasto", "regular")
                  }
                }}
              >
                <div>
                  <RadioGroupItem value="receita" id="receita" className="peer sr-only" />
                  <Label
                    htmlFor="receita"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary min-h-[60px] flex items-center justify-center"
                  >
                    Receita
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="despesa" id="despesa" className="peer sr-only" />
                  <Label
                    htmlFor="despesa"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary min-h-[60px] flex items-center justify-center"
                  >
                    Despesa
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                <Input id="valor" placeholder="0,00" className="pl-10" {...form.register("valor")} />
              </div>
              {form.formState.errors.valor && (
                <p className="text-sm text-red-500">{form.formState.errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("data") ? (
                      format(form.watch("data"), "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("data")}
                    onSelect={(date) => form.setValue("data", date as Date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.data && (
                <p className="text-sm text-red-500">{form.formState.errors.data.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={form.watch("categoria")} onValueChange={(value) => form.setValue("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="sem-categorias" disabled>
                      Nenhuma categoria disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.categoria && (
                <p className="text-sm text-red-500">{form.formState.errors.categoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Adicione uma descrição (opcional)"
                {...form.register("descricao")}
              />
            </div>

            {/* Expense Type Selection - Only show for expenses */}
            {tipoTransacao === "despesa" && (
              <div className="space-y-2 pt-2">
                <Label>Tipo de Gasto</Label>
                <RadioGroup
                  value={tipoGasto}
                  className="grid grid-cols-2 gap-2 sm:gap-4"
                  onValueChange={(value) => {
                    form.setValue("tipoGasto", value as "regular" | "devedor")
                    setShowDebtorFields(value === "devedor")
                  }}
                >
                  <div>
                    <RadioGroupItem value="regular" id="regular" className="peer sr-only" />
                    <Label
                      htmlFor="regular"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary min-h-[60px] flex items-center justify-center"
                    >
                      Gasto Regular
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="devedor" id="devedor" className="peer sr-only" />
                    <Label
                      htmlFor="devedor"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary min-h-[60px] flex items-center justify-center"
                    >
                      Gasto com Devedor
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground mt-1">
                  {tipoGasto === "devedor"
                    ? "Selecione esta opção se alguém deve este valor para você"
                    : "Selecione esta opção para despesas normais sem devedores"}
                </p>
              </div>
            )}

            {/* Debtor section - Only show for debtor expenses */}
            {showDebtorFields && (
              <div className="space-y-4 pt-2">
                <Separator />
                <h3 className="font-medium">Informações do Devedor</h3>

                <div className="space-y-2">
                  <Label htmlFor="devedorNome">Nome do Devedor</Label>
                  <Input id="devedorNome" placeholder="Nome da pessoa" {...form.register("devedorNome")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="devedorValor">Valor a Receber (opcional, se diferente do valor da transação)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                    <Input id="devedorValor" placeholder="0,00" className="pl-10" {...form.register("devedorValor")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <RadioGroup
                    value={form.watch("devedorStatus") || "pendente"}
                    className="grid grid-cols-2 gap-2 sm:gap-4"
                    onValueChange={(value) => form.setValue("devedorStatus", value as "pendente" | "pago")}
                  >
                    <div>
                      <RadioGroupItem value="pendente" id="pendente-edit" className="peer sr-only" />
                      <Label
                        htmlFor="pendente-edit"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Pendente
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="pago" id="pago-edit" className="peer sr-only" />
                      <Label
                        htmlFor="pago-edit"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Pago
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


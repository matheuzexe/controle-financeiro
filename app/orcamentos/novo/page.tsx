"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAppContext } from "@/contexts/app-context"

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  valorMeta: z.string().min(1, { message: "Valor da meta é obrigatório" }),
  dataInicio: z.date({ required_error: "Data de início é obrigatória" }),
  dataFim: z.date().optional(),
})

export default function NovaMeta() {
  const router = useRouter()
  const { adicionarBudget } = useAppContext()
  const [dataInicio, setDataInicio] = useState<Date>(new Date())
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      valorMeta: "",
      dataInicio: new Date(),
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Converter valor para número
    const valorNumerico = Number.parseFloat(values.valorMeta.replace(/\./g, "").replace(",", "."))

    adicionarBudget({
      nome: values.nome,
      descricao: values.descricao,
      valorMeta: valorNumerico,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim,
    })

    toast({
      title: "Meta de poupança adicionada com sucesso!",
      description: "Sua meta foi registrada no sistema.",
    })

    router.push("/orcamentos")
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-8 w-full">
      <div className="mb-4">
        <Link href="/orcamentos" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar para Metas de Economia
        </Link>
      </div>
      <Card className="bg-card/95 backdrop-blur-sm border w-full">
        <CardHeader>
          <CardTitle>Nova Meta de Economia</CardTitle>
          <CardDescription>Adicione uma nova meta para controlar suas economias</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Meta</Label>
              <Input id="nome" placeholder="Ex: Comprar um PS5" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Adicione uma descrição para sua meta"
                {...form.register("descricao")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor da Meta</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                <Input id="valorMeta" placeholder="0,00" className="pl-10" {...form.register("valorMeta")} />
              </div>
              {form.formState.errors.valorMeta && (
                <p className="text-sm text-red-500">{form.formState.errors.valorMeta.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={(date) => {
                        setDataInicio(date as Date)
                        form.setValue("dataInicio", date as Date)
                      }}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.dataInicio && (
                  <p className="text-sm text-red-500">{form.formState.errors.dataInicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data da Meta (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !dataFim && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={(date) => {
                        setDataFim(date as Date)
                        form.setValue("dataFim", date as Date)
                      }}
                      initialFocus
                      locale={ptBR}
                      fromDate={dataInicio} // Can't select a date before the start date
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/orcamentos")}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Meta</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


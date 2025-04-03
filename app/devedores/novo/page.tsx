"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAppContext } from "@/contexts/app-context"

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  valor: z.string().min(1, { message: "Valor é obrigatório" }),
  data: z.date({ required_error: "Data é obrigatória" }),
  descricao: z.string().optional(),
  status: z.enum(["pendente", "pago"]),
})

export default function NovoDevedor() {
  const router = useRouter()
  const { adicionarDebtor } = useAppContext()
  const [date, setDate] = useState<Date>(new Date())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      valor: "",
      data: new Date(),
      descricao: "",
      status: "pendente",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Converter valor para número
    const valorNumerico = Number.parseFloat(values.valor.replace(/\./g, "").replace(",", "."))

    adicionarDebtor({
      nome: values.nome,
      valor: valorNumerico,
      data: values.data,
      descricao: values.descricao || "",
      status: values.status,
    })

    toast({
      title: "Devedor adicionado com sucesso!",
      description: "O registro do devedor foi salvo no sistema.",
    })

    router.push("/devedores")
  }

  return (
    <div className="mx-auto max-w-2xl p-3 md:p-8 w-full">
      <div className="mb-4">
        <Link href="/devedores" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar para Devedores
        </Link>
      </div>
      <Card className="bg-card/95 backdrop-blur-sm border w-full">
        <CardHeader>
          <CardTitle>Novo Devedor</CardTitle>
          <CardDescription>Adicione uma pessoa que deve dinheiro a você</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Devedor</Label>
              <Input id="nome" placeholder="Nome da pessoa" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
              )}
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
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date as Date)
                      form.setValue("data", date as Date)
                    }}
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
              <Label>Status</Label>
              <RadioGroup
                defaultValue="pendente"
                className="grid grid-cols-2 gap-2 sm:gap-4"
                {...form.register("status")}
                onValueChange={(value) => form.setValue("status", value as "pendente" | "pago")}
              >
                <div>
                  <RadioGroupItem value="pendente" id="pendente" className="peer sr-only" />
                  <Label
                    htmlFor="pendente"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Pendente
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pago" id="pago" className="peer sr-only" />
                  <Label
                    htmlFor="pago"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Pago
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Adicione uma descrição (opcional)"
                {...form.register("descricao")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/devedores")}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Devedor</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


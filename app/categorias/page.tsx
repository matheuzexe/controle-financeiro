"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit, Plus, Trash } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  tipo: z.enum(["receita", "despesa"], {
    required_error: "Tipo é obrigatório",
  }),
})

export default function Categorias() {
  const router = useRouter()
  const { categorias, adicionarCategoria, editarCategoria, excluirCategoria } = useAppContext()
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<string | null>(null)
  const [categoriaParaEditar, setCategoriaParaEditar] = useState<string | null>(null)
  const [tipoFiltro, setTipoFiltro] = useState<"receita" | "despesa" | "todos">("todos")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "despesa",
    },
  })

  const formEdicao = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "despesa",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    adicionarCategoria({
      nome: values.nome,
      tipo: values.tipo,
    })

    toast({
      title: "Categoria adicionada com sucesso!",
      description: "Sua categoria foi registrada no sistema.",
    })

    form.reset({
      nome: "",
      tipo: values.tipo,
    })
  }

  function onSubmitEdicao(values: z.infer<typeof formSchema>) {
    if (categoriaParaEditar) {
      editarCategoria(categoriaParaEditar, {
        nome: values.nome,
        tipo: values.tipo,
      })

      toast({
        title: "Categoria atualizada com sucesso!",
        description: "Suas alterações foram salvas.",
      })

      setCategoriaParaEditar(null)
    }
  }

  function handleEditar(id: string) {
    const categoria = categorias.find((c) => c.id === id)
    if (categoria) {
      formEdicao.reset({
        nome: categoria.nome,
        tipo: categoria.tipo,
      })
      setCategoriaParaEditar(id)
    }
  }

  function handleExcluir(id: string) {
    excluirCategoria(id)
    toast({
      title: "Categoria excluída",
      description: "A categoria foi excluída com sucesso.",
    })
    setCategoriaParaExcluir(null)
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    if (tipoFiltro === "todos") return true
    return categoria.tipo === tipoFiltro
  })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mb-4">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar ao painel
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Categorias</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 w-full">
          <Card className="bg-card/95 backdrop-blur-sm border w-full">
            <CardHeader>
              <CardTitle>Nova Categoria</CardTitle>
              <CardDescription>Adicione uma nova categoria para organizar suas transações</CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Categoria</Label>
                  <Input id="nome" placeholder="Ex: Alimentação, Salário, etc." {...form.register("nome")} />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Categoria</Label>
                  <RadioGroup
                    defaultValue="despesa"
                    className="grid grid-cols-2 gap-2 sm:gap-4"
                    {...form.register("tipo")}
                    onValueChange={(value) => form.setValue("tipo", value as "receita" | "despesa")}
                  >
                    <div>
                      <RadioGroupItem value="receita" id="receita-nova" className="peer sr-only" />
                      <Label
                        htmlFor="receita-nova"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Receita
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="despesa" id="despesa-nova" className="peer sr-only" />
                      <Label
                        htmlFor="despesa-nova"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Despesa
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Categoria
                </Button>
              </CardFooter>
            </form>
          </Card>

          {categoriaParaEditar && (
            <Card className="bg-card/95 backdrop-blur-sm border w-full">
              <CardHeader>
                <CardTitle>Editar Categoria</CardTitle>
                <CardDescription>Atualize os dados da categoria selecionada</CardDescription>
              </CardHeader>
              <form onSubmit={formEdicao.handleSubmit(onSubmitEdicao)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-edicao">Nome da Categoria</Label>
                    <Input
                      id="nome-edicao"
                      placeholder="Ex: Alimentação, Salário, etc."
                      {...formEdicao.register("nome")}
                    />
                    {formEdicao.formState.errors.nome && (
                      <p className="text-sm text-red-500">{formEdicao.formState.errors.nome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Categoria</Label>
                    <RadioGroup
                      value={formEdicao.watch("tipo")}
                      className="grid grid-cols-2 gap-2 sm:gap-4"
                      onValueChange={(value) => formEdicao.setValue("tipo", value as "receita" | "despesa")}
                    >
                      <div>
                        <RadioGroupItem value="receita" id="receita-edicao" className="peer sr-only" />
                        <Label
                          htmlFor="receita-edicao"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Receita
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="despesa" id="despesa-edicao" className="peer sr-only" />
                        <Label
                          htmlFor="despesa-edicao"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Despesa
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setCategoriaParaEditar(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border w-full">
          <CardHeader>
            <CardTitle>Categorias Existentes</CardTitle>
            <CardDescription>Gerencie suas categorias de despesas e receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todos" className="mb-4">
              <TabsList>
                <TabsTrigger value="todos" onClick={() => setTipoFiltro("todos")}>
                  Todas
                </TabsTrigger>
                <TabsTrigger value="receita" onClick={() => setTipoFiltro("receita")}>
                  Receitas
                </TabsTrigger>
                <TabsTrigger value="despesa" onClick={() => setTipoFiltro("despesa")}>
                  Despesas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {categoriasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="mb-4 text-muted-foreground">Nenhuma categoria encontrada.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriasFiltradas.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell>{categoria.nome}</TableCell>
                        <TableCell>
                          <Badge variant={categoria.tipo === "receita" ? "success" : "destructive"}>
                            {categoria.tipo === "receita" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditar(categoria.id)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setCategoriaParaExcluir(categoria.id)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog
        open={!!categoriaParaExcluir}
        onOpenChange={(isOpen) => {
          if (!isOpen) setCategoriaParaExcluir(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoriaParaExcluir && handleExcluir(categoriaParaExcluir)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


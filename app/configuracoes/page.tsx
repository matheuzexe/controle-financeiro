"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/contexts/app-context"
import { toast } from "@/components/ui/use-toast"
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

export default function Configuracoes() {
  const { limparDados } = useAppContext()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleLimparDados = () => {
    limparDados()
    toast({
      title: "Dados limpos com sucesso",
      description: "Todos os seus dados foram removidos.",
    })
    setConfirmOpen(false)
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>Gerencie os dados do seu aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aqui você pode gerenciar os dados armazenados no seu navegador. Tenha cuidado, pois algumas ações não
              podem ser desfeitas.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Todos os Dados
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle>Sobre o Aplicativo</CardTitle>
            <CardDescription>Informações sobre o Controle Financeiro</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este é um aplicativo de controle financeiro pessoal que permite gerenciar suas receitas e despesas. Todos
              os dados são armazenados localmente no seu navegador.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Versão: 1.0.0</p>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente todos os seus dados, incluindo transações e categorias
              personalizadas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLimparDados} className="bg-red-600 hover:bg-red-700">
              Sim, limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


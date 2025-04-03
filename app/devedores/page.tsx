"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ListaDevedores } from "@/components/lista-devedores"
import { useAppContext } from "@/contexts/app-context"

export default function Devedores() {
  const { debtors = [] } = useAppContext()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Devedores</h1>
          <div className="flex items-center gap-2">
            <Link href="/devedores/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Devedor
              </Button>
            </Link>
          </div>
        </div>

        {!debtors || debtors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="mb-4 text-muted-foreground">Você ainda não possui devedores registrados.</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Registre pessoas que devem dinheiro a você para manter o controle de seus empréstimos.
              </p>
              <Link href="/devedores/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Primeiro Devedor
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/95 backdrop-blur-sm border">
            <CardContent className="p-6">
              <ListaDevedores />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


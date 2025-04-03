"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, CreditCard, Home, Menu, PiggyBank, Settings, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Painel",
      icon: Home,
    },
    {
      href: "/transacoes/nova",
      label: "Transações",
      icon: CreditCard,
    },
    {
      href: "/orcamentos",
      label: "Metas de Economia",
      icon: PiggyBank,
    },
    {
      href: "/relatorios",
      label: "Relatórios",
      icon: BarChart,
    },
    {
      href: "/categorias",
      label: "Categorias",
      icon: Settings,
    },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: Sliders,
    },
  ]

  return (
    <>
      <Button variant="outline" size="icon" className="mr-2" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6" />
              <span>Controle Financeiro</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <nav className="flex-1 py-4">
              <div className="grid gap-1 px-2">
                {routes.map((route) => {
                  const Icon = route.icon
                  const isActive = pathname === route.href

                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  )
                })}
              </div>
            </nav>
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tema</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}


import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { BarChart, CreditCard, Home, PiggyBank, Settings, Sliders } from "lucide-react"

import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { AppProvider } from "@/contexts/app-context"
import { AnimatedBackground } from "@/components/animated-background"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "Aplicativo de controle financeiro pessoal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppProvider>
            <div className="flex min-h-screen flex-col relative">
              {/* Animated Background */}
              <AnimatedBackground />

              {/* Mobile Header */}
              <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/80 backdrop-blur-md px-4 lg:hidden">
                <MobileNav />
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <PiggyBank className="h-6 w-6" />
                  <span>Controle Financeiro</span>
                </Link>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </header>

              <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col border-r bg-background/80 backdrop-blur-md">
                  <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      <PiggyBank className="h-6 w-6" />
                      <span>Controle Financeiro</span>
                    </Link>
                    <div className="ml-auto">
                      <ThemeToggle />
                    </div>
                  </div>
                  <nav className="flex-1 overflow-auto py-4">
                    <div className="grid gap-1 px-2">
                      <Link
                        href="/"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <Home className="h-4 w-4" />
                        Painel
                      </Link>
                      <Link
                        href="/transacoes/nova"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <CreditCard className="h-4 w-4" />
                        Transações
                      </Link>

                      {/* Add the Budget link here */}
                      <Link
                        href="/orcamentos"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <PiggyBank className="h-4 w-4" />
                        Metas de Economia
                      </Link>

                      <Link
                        href="/relatorios"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <BarChart className="h-4 w-4" />
                        Relatórios
                      </Link>
                      <Link
                        href="/categorias"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        Categorias
                      </Link>
                      <Link
                        href="/configuracoes"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary",
                          "hover:bg-accent",
                        )}
                      >
                        <Sliders className="h-4 w-4" />
                        Configurações
                      </Link>
                    </div>
                  </nav>
                </aside>
                <div className="flex flex-1 flex-col">{children}</div>
              </div>
            </div>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
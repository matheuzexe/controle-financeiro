"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Check, Edit, MoreHorizontal, Plus, Trash, User, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import Link from "next/link"
import { useAppContext } from "@/contexts/app-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { useMobileDetect } from "@/hooks/use-mobile"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UltimasTransacoes() {
  const router = useRouter()
  const { transacoes, excluirTransacao, categorias, atualizarStatusDevedor } = useAppContext()
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null)
  const isMobile = useMobileDetect()

  const handleEdit = (id: string) => {
    router.push(`/transacoes/editar/${id}`)
  }

  const handleDelete = (id: string) => {
    excluirTransacao(id)
    toast({
      title: "Transação excluída",
      description: "A transação foi excluída com sucesso.",
    })
    setTransacaoParaExcluir(null)
  }

  const handleToggleDevedorStatus = (id: string, currentStatus: "pendente" | "pago") => {
    const newStatus = currentStatus === "pendente" ? "pago" : "pendente"
    atualizarStatusDevedor(id, newStatus)
    toast({
      title: `Status do devedor atualizado`,
      description: `O status foi alterado para ${newStatus === "pendente" ? "pendente" : "pago"}.`,
    })
  }

  const getNomeCategoria = (categoriaId: string) => {
    const categoria = categorias.find((c) => c.id === categoriaId)
    return categoria ? categoria.nome : categoriaId
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "data",
      header: "Data",
      cell: ({ row }) => {
        const data = row.original.data
        return format(new Date(data), "dd/MM/yyyy", { locale: ptBR })
      },
    },
    {
      accessorKey: "descricao",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Descrição
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isDevedor = row.original.tipoGasto === "devedor" || !!row.original.devedorNome
        return (
          <div className="flex items-center">
            {row.original.tipo === "despesa" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="mr-2">
                      {isDevedor ? (
                        <User className="h-4 w-4 text-blue-500" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 text-red-500" />
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDevedor ? (
                      <>
                        <p>Gasto com Devedor</p>
                        <p>Devedor: {row.original.devedorNome}</p>
                        <p>
                          Valor:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(row.original.devedorValor || row.original.valor)}
                        </p>
                        <p>Status: {row.original.devedorStatus === "pago" ? "Pago" : "Pendente"}</p>
                      </>
                    ) : (
                      <p>Gasto Regular</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {row.getValue("descricao") || "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => getNomeCategoria(row.getValue("categoria")),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("tipo") as string
        const isDevedor = row.original.tipoGasto === "devedor" || !!row.original.devedorNome

        if (tipo === "despesa" && isDevedor) {
          return (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
              Gasto com Devedor
            </Badge>
          )
        }

        return (
          <Badge variant={tipo === "receita" ? "success" : "destructive"}>
            {tipo === "receita" ? "Receita" : "Gasto Regular"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "devedorStatus",
      header: "Status Devedor",
      cell: ({ row }) => {
        const isDevedor = row.original.tipoGasto === "devedor" || !!row.original.devedorNome
        if (!isDevedor) return null

        const status = row.original.devedorStatus || "pendente"
        return (
          <Badge
            variant={status === "pago" ? "success" : "default"}
            className={status !== "pago" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {status === "pago" ? "Pago" : "Pendente"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "valor",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => {
        const valor = row.getValue("valor") as number
        const tipo = row.getValue("tipo") as string
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)

        return (
          <div
            className={`text-right font-medium ${tipo === "receita" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
          >
            {formatted}
          </div>
        )
      },
    },
    {
      id: "acoes",
      cell: ({ row }) => {
        const transacao = row.original
        const isDevedor = transacao.tipoGasto === "devedor" || !!transacao.devedorNome

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transacao.id)}>Copiar ID</DropdownMenuItem>

              {isDevedor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Devedor: {transacao.devedorNome}</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleToggleDevedorStatus(transacao.id, transacao.devedorStatus || "pendente")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {transacao.devedorStatus === "pago" ? "Marcar como Pendente" : "Marcar como Pago"}
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(transacao.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransacaoParaExcluir(transacao.id)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: transacoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Versão mobile das transações
  const MobileTransactionList = () => {
    if (transacoes.length === 0) return null

    return (
      <div className="space-y-4">
        {transacoes.map((transacao) => {
          const isDevedor = transacao.tipoGasto === "devedor" || !!transacao.devedorNome

          return (
            <Card key={transacao.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {transacao.tipo === "despesa" && (
                      <span className="mr-2">
                        {isDevedor ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                    <div>
                      <h3 className="font-medium truncate">{transacao.descricao || "Sem descrição"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {transacao.tipo === "despesa" && isDevedor ? (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                      Gasto com Devedor
                    </Badge>
                  ) : (
                    <Badge variant={transacao.tipo === "receita" ? "success" : "destructive"}>
                      {transacao.tipo === "receita" ? "Receita" : "Gasto Regular"}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">{getNomeCategoria(transacao.categoria)}</span>
                  <span
                    className={`font-bold ${transacao.tipo === "receita" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(transacao.valor)}
                  </span>
                </div>

                {isDevedor && (
                  <div className="mt-2 pt-2 border-t flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Devedor: {transacao.devedorNome}</p>
                      <p className="text-xs text-muted-foreground">
                        Valor:{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(transacao.devedorValor || transacao.valor)}
                      </p>
                    </div>
                    <Badge
                      variant={transacao.devedorStatus === "pago" ? "success" : "default"}
                      className={transacao.devedorStatus !== "pago" ? "bg-orange-500 hover:bg-orange-600" : ""}
                      onClick={() => handleToggleDevedorStatus(transacao.id, transacao.devedorStatus || "pendente")}
                    >
                      {transacao.devedorStatus === "pago" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(transacao.id)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                    onClick={() => setTransacaoParaExcluir(transacao.id)}
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {transacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="mb-4 text-muted-foreground">Você ainda não possui transações registradas.</p>
          <Link href="/transacoes/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Transação
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Versão desktop da tabela */}
          {!isMobile && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Próximo
                </Button>
              </div>
            </>
          )}

          {/* Versão mobile da lista */}
          {isMobile && <MobileTransactionList />}
        </>
      )}

      <AlertDialog
        open={!!transacaoParaExcluir}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTransacaoParaExcluir(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transacaoParaExcluir && handleDelete(transacaoParaExcluir)}
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


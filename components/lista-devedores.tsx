"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Check, Edit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAppContext } from "@/contexts/app-context"
import { useMobileDetect } from "@/hooks/use-mobile"

export function ListaDevedores() {
  const router = useRouter()
  const { debtors = [], excluirDebtor, atualizarStatusDebtor } = useAppContext()
  const [debtorParaExcluir, setDebtorParaExcluir] = useState<string | null>(null)
  const isMobile = useMobileDetect()

  const handleEdit = (id: string) => {
    router.push(`/devedores/editar/${id}`)
  }

  const handleDelete = (id: string) => {
    excluirDebtor(id)
    toast({
      title: "Devedor excluído",
      description: "O registro do devedor foi excluído com sucesso.",
    })
    setDebtorParaExcluir(null)
  }

  const handleToggleStatus = (id: string, currentStatus: "pendente" | "pago") => {
    const newStatus = currentStatus === "pendente" ? "pago" : "pendente"
    atualizarStatusDebtor(id, newStatus)
    toast({
      title: `Status atualizado`,
      description: `O status foi alterado para ${newStatus === "pendente" ? "pendente" : "pago"}.`,
    })
  }

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
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
        header: "Descrição",
        cell: ({ row }) => row.getValue("descricao") || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge variant={status === "pago" ? "success" : "destructive"}>
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
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(valor)

          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        id: "acoes",
        cell: ({ row }) => {
          const debtor = row.original

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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(debtor.id)}>Copiar ID</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(debtor.id, debtor.status)}>
                  <Check className="mr-2 h-4 w-4" />
                  {debtor.status === "pendente" ? "Marcar como Pago" : "Marcar como Pendente"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(debtor.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDebtorParaExcluir(debtor.id)} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [],
  )

  const data = useMemo(() => debtors, [debtors])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Versão mobile da lista de devedores
  const MobileDebtorsList = () => {
    if (!debtors || debtors.length === 0) return null

    return (
      <div className="space-y-4">
        {debtors.map((debtor) => (
          <Card key={debtor.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium truncate">{debtor.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(debtor.data), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant={debtor.status === "pago" ? "success" : "destructive"}>
                  {debtor.status === "pago" ? "Pago" : "Pendente"}
                </Badge>
              </div>

              {debtor.descricao && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{debtor.descricao}</p>
              )}

              <div className="flex justify-between items-center">
                <span className="font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(debtor.valor)}
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(debtor.id, debtor.status)}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {debtor.status === "pendente" ? "Pago" : "Pendente"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(debtor.id)}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                  onClick={() => setDebtorParaExcluir(debtor.id)}
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
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
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhum devedor encontrado.
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
      {isMobile && <MobileDebtorsList />}

      <AlertDialog
        open={!!debtorParaExcluir}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDebtorParaExcluir(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este devedor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => debtorParaExcluir && handleDelete(debtorParaExcluir)}
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


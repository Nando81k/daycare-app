/* eslint-disable react-hooks/incompatible-library */

"use client"

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, SearchIcon } from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { TableSurface } from "@/components/shared/table-surface"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type {
  AdminTableBadgeCell,
  AdminTableCellValue,
  AdminTableColumn,
  AdminTableCustomCell,
  AdminTableRow,
} from "@/types/app"
import { cn } from "@/lib/utils"

type ColumnAlignMeta = {
  align?: "start" | "end"
}

function isBadgeCell(value: AdminTableCellValue): value is AdminTableBadgeCell {
  return typeof value === "object" && value !== null && "variant" in value
}

function isStackCell(value: AdminTableCellValue): value is { primary: string; secondary?: string } {
  return typeof value === "object" && value !== null && "primary" in value
}

function isCustomCell(value: AdminTableCellValue): value is AdminTableCustomCell {
  return typeof value === "object" && value !== null && "type" in value && value.type === "custom"
}

function normalizeValue(value: AdminTableCellValue) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  if (isBadgeCell(value)) {
    return value.label
  }

  if (isStackCell(value)) {
    return [value.primary, value.secondary ?? ""].join(" ")
  }

  if (isCustomCell(value)) {
    return value.searchValue ?? ""
  }

  return ""
}

function renderValue(value: AdminTableCellValue) {
  if (typeof value === "string" || typeof value === "number") {
    return <span className="text-sm text-foreground">{value}</span>
  }

  if (isBadgeCell(value)) {
    return <StatusBadge variant={value.variant}>{value.label}</StatusBadge>
  }

  if (isStackCell(value)) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{value.primary}</p>
        {value.secondary ? <p className="text-sm leading-6 text-muted-foreground">{value.secondary}</p> : null}
      </div>
    )
  }

  if (isCustomCell(value)) {
    return value.content
  }

  return null
}

export function AdminDataTable({
  title,
  description,
  columns,
  rows,
  searchPlaceholder = "Search this table",
  searchKeys,
  onRowClick,
}: {
  title: string
  description?: string
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  searchPlaceholder?: string
  searchKeys?: string[]
  onRowClick?: (row: AdminTableRow) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [query, setQuery] = useState("")

  const searchableKeys = searchKeys ?? columns.map((column) => column.key)

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase()

    if (!trimmed) {
      return rows
    }

    return rows.filter((row) =>
      searchableKeys.some((key) => normalizeValue(row[key]).toLowerCase().includes(trimmed))
    )
  }, [query, rows, searchableKeys])

  const tableColumns = useMemo(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row: AdminTableRow) => normalizeValue(row[column.key]),
        enableSorting: true,
        header: () => column.header,
        cell: ({ row }: { row: { original: AdminTableRow } }) => renderValue(row.original[column.key]),
        meta: {
          align: column.align ?? "start",
        },
      })),
    [columns]
  )

  const table = useReactTable({
    data: filteredRows,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <TableSurface
      title={title}
      description={description}
      size="compact"
      toolbar={
        <div className="dashboard-toolbar">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 rounded-xl pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">Sort by clicking a column heading</p>
        </div>
      }
      footer={
        <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredRows.length} of {rows.length} rows
          </p>
          <p className="text-sm text-muted-foreground">Search and sort stay local to this page for fast review.</p>
        </div>
      }
    >
      {filteredRows.length ? (
        <Table className="min-w-full text-left text-sm">
          <TableHeader className="sticky top-0 z-10 bg-muted/78 text-muted-foreground backdrop-blur-xl [&_tr]:border-b [&_tr]:border-border/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted()
                  const align = (header.column.columnDef.meta as ColumnAlignMeta | undefined)?.align ?? "start"

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-11 px-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
                        align === "end" && "text-right"
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-auto rounded-none px-0 py-0 font-medium text-muted-foreground hover:bg-transparent",
                            align === "end" && "ml-auto"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSorted === "asc" ? (
                            <ArrowUpIcon data-icon="inline-end" />
                          ) : isSorted === "desc" ? (
                            <ArrowDownIcon data-icon="inline-end" />
                          ) : (
                            <ArrowUpDownIcon data-icon="inline-end" />
                          )}
                        </Button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn("row-hover border-border/45 last:border-b-0", onRowClick ? "cursor-pointer" : "cursor-default")}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as ColumnAlignMeta | undefined)?.align ?? "start"

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-3.5 align-top",
                        align === "end" && "text-right"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="px-4 py-4">
          <EmptyState
            title="No matching rows"
            description="Try a different search term or clear the current filter to see more results."
          />
        </div>
      )}
    </TableSurface>
  )
}

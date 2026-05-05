/* eslint-disable react-hooks/incompatible-library */

"use client"

import Link from "next/link"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, DownloadIcon, SearchIcon } from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { getDocumentBadgeVariant } from "@/components/parent/parent-status"
import {
  DocumentPreviewDialog,
  type DocumentPreviewMeta,
} from "@/components/shared/document-preview-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ParentDocumentPreview } from "@/types/app"
import { cn } from "@/lib/utils"

type ColumnMeta = {
  align?: "start" | "end"
}

function getActionLabel(document: ParentDocumentPreview) {
  if (document.downloadUrl) {
    return "Download file"
  }

  if (document.status === "required") {
    return "Needs upload"
  }

  if (document.status === "submitted") {
    return "Awaiting review"
  }

  return "On file"
}

function toPreviewMeta(document: ParentDocumentPreview): DocumentPreviewMeta {
  return {
    title: document.title,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeLabel: document.sizeLabel,
    previewUrl: document.previewUrl,
    downloadUrl: document.downloadUrl,
    subtitle: document.submittedAt
      ? `${document.category} · submitted ${document.submittedAt}`
      : document.category,
  }
}

export function ParentDocumentsTable({
  documents,
}: {
  documents: ParentDocumentPreview[]
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [query, setQuery] = useState("")
  const [previewDoc, setPreviewDoc] = useState<ParentDocumentPreview | null>(
    null
  )

  const filteredDocuments = useMemo(() => {
    const trimmed = query.trim().toLowerCase()

    if (!trimmed) {
      return documents
    }

    return documents.filter((document) =>
      [
        document.title,
        document.category,
        document.status,
        document.note,
        document.lastUpdated,
        document.dueDate ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(trimmed)
    )
  }, [documents, query])

  const columns = useMemo<ColumnDef<ParentDocumentPreview>[]>(
    () => [
      {
        id: "document",
        accessorFn: (document) => `${document.title} ${document.category} ${document.note}`,
        header: "Document",
        cell: ({ row }) => {
          const document = row.original

          return (
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-medium text-foreground">{document.title}</p>
              <p className="text-sm text-muted-foreground">{document.category}</p>
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{document.note}</p>
            </div>
          )
        },
      },
      {
        id: "timeline",
        accessorFn: (document) => `${document.dueDate ?? ""} ${document.lastUpdated}`,
        header: "Timeline",
        cell: ({ row }) => {
          const document = row.original

          return (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {document.dueDate ? `Due ${document.dueDate}` : "On file"}
              </p>
              <p className="text-sm text-muted-foreground">Updated {document.lastUpdated}</p>
            </div>
          )
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge variant={getDocumentBadgeVariant(row.original.status)}>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        id: "action",
        accessorFn: (document) => getActionLabel(document),
        enableSorting: false,
        header: "Action",
        cell: ({ row }) => {
          const document = row.original

          if (document.previewUrl || document.downloadUrl) {
            return (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewDoc(document)}
                >
                  Preview
                </Button>
                {document.downloadUrl && (
                  <Link
                    href={document.downloadUrl}
                    target="_blank"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    aria-label={`Download ${document.title}`}
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )
          }

          return <span className="text-sm text-muted-foreground">{getActionLabel(document)}</span>
        },
        meta: {
          align: "end",
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredDocuments,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents, categories, or notes"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.15rem] border border-border/60 bg-background/88">
        {filteredDocuments.length ? (
          <ScrollArea className="w-full">
            <Table className="min-w-[52rem] text-left text-sm">
              <TableHeader className="sticky top-0 z-10 bg-muted/72 backdrop-blur-xl [&_tr]:border-b [&_tr]:border-border/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      const align = (header.column.columnDef.meta as ColumnMeta | undefined)?.align ?? "start"
                      const isSorted = header.column.getIsSorted()

                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "h-11 px-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-blue",
                            align === "end" && "text-right"
                          )}
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
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
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="row-hover border-border/45 last:border-b-0">
                    {row.getVisibleCells().map((cell) => {
                      const align = (cell.column.columnDef.meta as ColumnMeta | undefined)?.align ?? "start"

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn("px-4 py-3.5 align-top", align === "end" && "text-right")}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="px-5 py-10">
            <Empty className="rounded-[1rem] border-border/60 bg-muted/18 py-8">
              <EmptyHeader>
                <EmptyTitle>No matching documents</EmptyTitle>
                <EmptyDescription>
                  Try a different search term or clear the current filter to see the full document list again.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>

      <DocumentPreviewDialog
        open={previewDoc !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null)
        }}
        document={previewDoc ? toPreviewMeta(previewDoc) : null}
      />
    </div>
  )
}

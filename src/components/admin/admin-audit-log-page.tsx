"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminAuditEntry } from "@/lib/dal/admin-audit"

const ALL_VALUE = "__all__"

function tone(role: string | null) {
  if (role === "ADMIN") return "info" as const
  if (role === "TEACHER") return "success" as const
  if (role === "PARENT") return "secondary" as const
  return "secondary" as const
}

export function AdminAuditLogPageView({
  entries,
  total,
  page,
  pageSize,
  pageCount,
  actions,
  subjectTypes,
  filters,
}: {
  entries: AdminAuditEntry[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  actions: string[]
  subjectTypes: string[]
  filters: { query: string; action: string; subjectType: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL_VALUE) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if (key !== "page") params.delete("page")
    startTransition(() => {
      router.push(`/admin/audit?${params.toString()}`)
    })
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Every recorded action across the platform — useful for compliance, dispute resolution, and post-incident review."
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Entries</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{total}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Page</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {page} / {pageCount}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Actions</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {actions.length}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Subject types
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {subjectTypes.length}
          </p>
        </div>
      </AdminPageHeader>

      <SurfaceCard className="space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Input
            placeholder="Search action, actor, or subject id"
            defaultValue={filters.query}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setParam("q", (event.target as HTMLInputElement).value)
              }
            }}
          />
          <Select
            value={filters.action || ALL_VALUE}
            onValueChange={(value) => setParam("action", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All actions</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.subjectType || ALL_VALUE}
            onValueChange={(value) => setParam("subjectType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All subjects</SelectItem>
              {subjectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {entries.length === 0 ? (
          <Empty className="border-0 bg-transparent py-12">
            <EmptyHeader>
              <EmptyTitle>No matching entries</EmptyTitle>
              <EmptyDescription>
                Try widening the filters or clear them to see the full log.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {entry.createdAtLabel}
                  </TableCell>
                  <TableCell>
                    {entry.actorName ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {entry.actorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.actorEmail}
                          {entry.actorRole ? (
                            <>
                              {" · "}
                              <StatusBadge variant={tone(entry.actorRole)}>
                                {entry.actorRole}
                              </StatusBadge>
                            </>
                          ) : null}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        System / unknown
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.action}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.subjectType}
                      </p>
                      {entry.subjectId && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {entry.subjectId.slice(0, 14)}…
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {entry.details ? (
                      <pre className="whitespace-pre-wrap rounded bg-muted/40 p-2 font-mono text-[0.7rem] leading-5 text-muted-foreground">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3 text-sm text-muted-foreground">
          <p>
            Showing {entries.length} of {total} entries · {pageSize} per page
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => setParam("page", String(page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount || isPending}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  )
}

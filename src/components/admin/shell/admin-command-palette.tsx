"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CreditCard,
  GraduationCap,
  LayoutGrid,
  Users,
  UsersRound,
} from "lucide-react"

import { runAdminSearch } from "@/app/actions/admin-search"
import { useAdminCommandPalette } from "@/components/admin/shell/admin-command-palette-context"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { adminNav } from "@/config/navigation"
import type { AdminSearchResult } from "@/lib/dal/admin-search"

const EMPTY_RESULT: AdminSearchResult = {
  families: [],
  children: [],
  applications: [],
  invoices: [],
}

export function AdminCommandPalette() {
  const router = useRouter()
  const { open, setOpen } = useAdminCommandPalette()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AdminSearchResult>(EMPTY_RESULT)
  const [, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery("")
  }

  // Debounced server-side search.
  useEffect(() => {
    if (!open) return
    const handle = setTimeout(() => {
      startTransition(async () => {
        try {
          const next = await runAdminSearch(query)
          setResults(next)
        } catch {
          setResults(EMPTY_RESULT)
        }
      })
    }, 150)
    return () => clearTimeout(handle)
  }, [query, open])

  const flatPages = useMemo(
    () =>
      adminNav.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          groupTitle: group.title,
        }))
      ),
    []
  )

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Admin search"
      description="Jump to any page, family, child, application, or invoice."
    >
      <CommandInput
        placeholder="Type to search pages, families, children, applications, invoices…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {flatPages.map((page) => {
            const Icon = page.icon
            return (
              <CommandItem
                key={page.href}
                value={`${page.title} ${page.groupTitle} ${page.summary ?? ""}`}
                onSelect={() => go(page.href)}
              >
                <Icon className="text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{page.title}</span>
                  {page.summary && (
                    <span className="truncate text-xs text-muted-foreground">
                      {page.summary}
                    </span>
                  )}
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
              </CommandItem>
            )
          })}
        </CommandGroup>

        {results.families.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Families">
              {results.families.map((family) => (
                <CommandItem
                  key={family.id}
                  value={`family ${family.name}`}
                  onSelect={() => go(family.href)}
                >
                  <UsersRound className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{family.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {family.enrollmentStage}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.children.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Children">
              {results.children.map((child) => (
                <CommandItem
                  key={child.id}
                  value={`child ${child.name}`}
                  onSelect={() => go(child.href)}
                >
                  <Users className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{child.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[child.classroomName, child.ageLabel]
                        .filter(Boolean)
                        .join(" · ") || "Unassigned"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.applications.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Applications">
              {results.applications.map((application) => (
                <CommandItem
                  key={application.id}
                  value={`application ${application.childName} ${application.parentName}`}
                  onSelect={() => go(application.href)}
                >
                  <GraduationCap className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {application.childName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {application.parentName} · {application.statusLabel} ·
                      updated {application.updatedAt}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.invoices.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup
              heading={query ? "Invoices" : "Open invoices"}
            >
              {results.invoices.map((invoice) => (
                <CommandItem
                  key={invoice.id}
                  value={`invoice ${invoice.label} ${invoice.familyName}`}
                  onSelect={() => go(invoice.href)}
                >
                  <CreditCard className="text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {invoice.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {invoice.familyName} · {invoice.amount} ·{" "}
                      {invoice.status} · due {invoice.dueDate}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      {/* Hidden marker so empty-state works visually with the icon-rail layout */}
      <span className="sr-only">
        <LayoutGrid />
      </span>
    </CommandDialog>
  )
}

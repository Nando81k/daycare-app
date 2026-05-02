"use client"

import { Search } from "lucide-react"

import { AdminBreadcrumbs } from "@/components/admin/shell/admin-breadcrumbs"
import { useAdminCommandPalette } from "@/components/admin/shell/admin-command-palette-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminTopbar() {
  const palette = useAdminCommandPalette()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="!h-4" />
      <div className="min-w-0 flex-1 truncate">
        <AdminBreadcrumbs />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => palette.setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-1 hidden rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </Button>
    </header>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { brandConfig } from "@/config/brand"
import { adminNav, parentNav } from "@/config/navigation"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { PortalKind } from "@/types/app"
import { cn } from "@/lib/utils"

const portalCopy = {
  parent: {
    label: "Family",
  },
  admin: {
    label: "Admin",
  },
} satisfies Record<PortalKind, { label: string }>

function isCurrentPath(pathname: string, href: string) {
  if (href === "/parent" || href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PortalTopbar({ kind }: { kind: PortalKind }) {
  const pathname = usePathname()
  const copy = portalCopy[kind]
  const groups = kind === "parent" ? parentNav : adminNav
  const items = groups.flatMap((group) => group.items)
  const rootHref = kind === "parent" ? "/parent" : "/admin"
  const hasMultiplePages = items.length > 1

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="portal-shell-container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <div className="flex items-center gap-4">
            <Link href={rootHref} className="flex items-center gap-3">
              <span className="font-heading text-xl tracking-tight text-foreground md:text-2xl">
                {brandConfig.shortName}
              </span>
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {copy.label}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Public site
            </Link>
            <Link
              href="/logout"
              className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-destructive"
            >
              Sign out
            </Link>
          </div>
        </div>

        {hasMultiplePages ? (
          <div className="border-t border-border/40">
            <ScrollArea className="w-full whitespace-nowrap">
              <nav className="flex min-w-max gap-8 py-3 md:min-w-0 md:flex-wrap" aria-label={`${copy.label} navigation`}>
                {items.map((item) => {
                  const active = isCurrentPath(pathname, item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group inline-flex items-center gap-2 border-b-2 pb-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors -mb-px",
                        active
                          ? "border-accent text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0 opacity-70 group-hover:opacity-100" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ) : null}
      </div>
    </header>
  )
}

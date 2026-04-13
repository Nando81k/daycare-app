"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { AppLogo } from "@/components/layout/app-logo"
import { StatusBadge } from "@/components/shared/status-badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PortalKind, PortalNavGroup } from "@/types/app"
import { cn } from "@/lib/utils"

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PortalSidebar({
  kind,
  groups,
  collapsed,
  mobile = false,
  onNavigate,
}: {
  kind: PortalKind
  groups: PortalNavGroup[]
  collapsed: boolean
  mobile?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const sidebarId = mobile ? "mobile-sidebar" : "desktop-sidebar"

  return (
    <TooltipProvider delayDuration={160}>
      <aside
        className={cn(
          "portal-sidebar-surface flex h-[calc(100vh-2rem)] flex-col gap-4 rounded-[1.5rem] px-3 py-4",
          collapsed && !mobile ? "w-[5.25rem]" : "w-[17.5rem]"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <AppLogo compact={collapsed && !mobile} href={kind === "parent" ? "/parent" : "/admin"} />
        </div>
        <Separator />
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-5 pr-2">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                {collapsed && !mobile ? null : (
                  <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {group.title}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  {group.items.map((item) => {
                    const active = isCurrentPath(pathname, item.href)
                    const Icon = item.icon
                    const link = (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "row-hover relative flex items-center gap-3 rounded-[1rem] border px-3 py-3 text-left text-sm",
                          collapsed && !mobile && "justify-center px-0",
                          active
                            ? "border-primary/12 text-primary-foreground"
                            : "border-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                        )}
                        aria-label={collapsed && !mobile ? item.title : undefined}
                      >
                        {active ? (
                          <motion.span
                            layoutId={`sidebar-active-${sidebarId}`}
                            className="absolute inset-0 rounded-[1rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-primary)_78%,white),var(--color-primary))] shadow-[0_16px_40px_-28px_rgba(71,130,126,0.44)]"
                            transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 320 }}
                          />
                        ) : null}
                        <Icon className="relative size-5 shrink-0" />
                        {collapsed && !mobile ? null : (
                          <span className="relative flex min-w-0 flex-1 items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{item.title}</span>
                              {item.summary ? (
                                <span
                                  className={cn(
                                    "mt-0.5 block truncate text-xs leading-5",
                                    active ? "text-primary-foreground/78" : "text-muted-foreground"
                                  )}
                                >
                                  {item.summary}
                                </span>
                              ) : null}
                            </span>
                            {item.badge ? (
                              <StatusBadge variant={active ? "secondary" : "info"}>{item.badge}</StatusBadge>
                            ) : null}
                          </span>
                        )}
                      </Link>
                    )

                    if (collapsed && !mobile) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={10}>
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return link
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
}

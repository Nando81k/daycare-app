"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { AppLogo } from "@/components/layout/app-logo"
import type { PortalKind } from "@/types/app"
import { adminNav, parentNav } from "@/config/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function isCurrentPath(pathname: string, href: string) {
  // Exact match for portal root paths so sub-page links don't also highlight
  if (href === "/parent" || href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

const portalCopy = {
  parent: {
    label: "Parent Portal",
    detail: "Child applications, required documents, and payment status in one family workspace.",
    primaryHref: "/parent",
    primaryLabel: "Continue Application",
  },
  admin: {
    label: "Admin Portal",
    detail: "Review submitted enrollments, check payment, and approve families manually.",
    primaryHref: undefined,
    primaryLabel: undefined,
  },
} satisfies Record<
  PortalKind,
  {
    label: string
    detail: string
    primaryHref?: string
    primaryLabel?: string
  }
>

export function PortalTopbar({ kind }: { kind: PortalKind }) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const copy = portalCopy[kind]
  const groups = kind === "parent" ? parentNav : adminNav
  const items = groups.flatMap((group) => group.items)
  const rootHref = kind === "parent" ? "/parent" : "/admin"
  const hasMultiplePages = items.length > 1
  const [isCondensed, setIsCondensed] = useState(false)

  useEffect(() => {
    const updateCondensedState = () => {
      setIsCondensed(window.scrollY > 44)
    }

    updateCondensedState()
    window.addEventListener("scroll", updateCondensedState, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateCondensedState)
    }
  }, [])

  return (
    <header
      className={cn(
        "workspace-backdrop sticky top-2 z-30 rounded-[1.25rem] px-4 sm:px-5 md:px-6",
        shouldReduceMotion ? "transition-none" : "transition-[padding,gap,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        isCondensed ? "py-2 shadow-[0_14px_34px_-24px_rgba(34,52,56,0.3)]" : "py-2.5"
      )}
    >
      <div className={cn("flex flex-col transition-[gap] duration-300", isCondensed ? "gap-2" : "gap-2.5")}>
        <div
          className={cn(
            "flex flex-col transition-[gap] duration-300 xl:flex-row xl:items-center xl:justify-between",
            isCondensed ? "gap-2" : "gap-2.5"
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col transition-[gap] duration-300 sm:flex-row sm:items-center",
              isCondensed ? "gap-2" : "gap-2.5"
            )}
          >
            <AppLogo href={rootHref} compact={isCondensed} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{copy.label}</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View Public Site
            </Link>
            {copy.primaryHref && copy.primaryLabel ? (
              <Link href={copy.primaryHref} className={buttonVariants({ variant: "default", size: "sm" })}>
                {copy.primaryLabel}
              </Link>
            ) : null}
            <Link href="/logout" className={buttonVariants({ variant: "destructive", size: "sm" })}>
              Sign out
            </Link>
          </div>
        </div>

        {hasMultiplePages ? (
          <div className={cn("border-t border-border/50 transition-[padding] duration-300", isCondensed ? "pt-2" : "pt-2.5")}>
            <ScrollArea className="w-full whitespace-nowrap">
              <nav
                className="flex min-w-max gap-2 pb-1 md:min-w-0 md:flex-wrap"
              >
                {items.map((item) => {
                  const active = isCurrentPath(pathname, item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "row-hover inline-flex min-w-fit items-center gap-2 rounded-[0.75rem] border px-3 py-1.5 text-left text-sm font-semibold transition-[background-color,border-color,box-shadow] duration-200",
                        active
                          ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_18px_42px_-28px_rgba(71,130,126,0.58)]"
                          : "border-border/55 bg-background/84 text-foreground hover:bg-accent/35"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
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

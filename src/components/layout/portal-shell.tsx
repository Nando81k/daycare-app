"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { PortalTopbar } from "@/components/layout/portal-topbar"
import { brandConfig } from "@/config/brand"
import type { PortalKind } from "@/types/app"

export function PortalShell({
  kind,
  children,
}: {
  kind: PortalKind
  children: React.ReactNode
}) {
  const shouldReduceMotion = useReducedMotion()
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {kind === "parent" ? <ParentTopbar /> : <PortalTopbar kind={kind} />}

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="portal-shell-container flex-1 py-8 md:py-10"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

function ParentTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="portal-shell-container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/parent/billing" className="flex items-center gap-3">
          <span className="font-heading text-xl tracking-tight text-foreground md:text-2xl">
            {brandConfig.shortName}
          </span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Family
          </span>
        </Link>
        <Link
          href="/logout"
          className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-destructive"
        >
          Sign out
        </Link>
      </div>
    </header>
  )
}

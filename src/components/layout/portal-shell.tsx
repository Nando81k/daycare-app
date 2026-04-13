"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { AppLogo } from "@/components/layout/app-logo"
import { PortalTopbar } from "@/components/layout/portal-topbar"
import { buttonVariants } from "@/components/ui/button"
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
    <div className="portal-shell-container py-2 md:py-3">
      <div className="flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-col gap-2 md:gap-3">
        {kind === "parent" ? (
          <header className="workspace-backdrop sticky top-2 z-30 flex items-center justify-between rounded-[1.25rem] px-4 py-2.5 sm:px-5 md:px-6">
            <AppLogo href="/parent/billing" compact />
            <Link
              href="/logout"
              className={buttonVariants({ variant: "destructive", size: "sm" })}
            >
              Sign out
            </Link>
          </header>
        ) : (
          <PortalTopbar kind={kind} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="min-w-0"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

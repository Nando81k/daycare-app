"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { ParentTopbar } from "@/components/layout/parent-topbar"
import { PortalTopbar } from "@/components/layout/portal-topbar"
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

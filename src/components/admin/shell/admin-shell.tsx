"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { AdminCommandPalette } from "@/components/admin/shell/admin-command-palette"
import { AdminCommandPaletteProvider } from "@/components/admin/shell/admin-command-palette-context"
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar"
import { AdminTopbar } from "@/components/admin/shell/admin-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AdminShell({
  defaultSidebarOpen = true,
  children,
}: {
  defaultSidebarOpen?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <TooltipProvider delayDuration={300}>
      <AdminCommandPaletteProvider>
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <AdminSidebar />
          {/* min-w-0 keeps wide tables from pushing the inset past the viewport
              when the sidebar is expanded. Without it, flex children default to
              min-width:auto (= intrinsic content width) and clip on the right. */}
          <SidebarInset className="min-w-0 bg-background">
            <AdminTopbar />
            <AnimatePresence mode="wait">
              <motion.main
                key={pathname}
                className="portal-shell-container min-w-0 flex-1 py-6 md:py-8"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </SidebarInset>
          <AdminCommandPalette />
        </SidebarProvider>
      </AdminCommandPaletteProvider>
    </TooltipProvider>
  )
}

import Link from "next/link"

import { DashboardSidebar } from "@/components/shared/dashboard-sidebar"
import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardShell({
  kind,
  children,
}: {
  kind: "parent" | "admin"
  children: React.ReactNode
}) {
  const portalCopy =
    kind === "parent"
      ? {
          label: "Parent portal",
          detail: "Daily updates, billing, forms, and communication without the clutter.",
        }
      : {
          label: "Admin operations",
          detail: "Enrollment, staffing, attendance, and billing with calmer oversight.",
        }

  return (
    <SidebarProvider>
      <DashboardSidebar kind={kind} />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="soft-panel mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="hidden h-5 md:block" />
              <AppLogo compact href={kind === "parent" ? "/parent" : "/admin"} />
              <div className="hidden min-w-0 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {portalCopy.label}
                </p>
                <p className="truncate text-sm text-muted-foreground">{portalCopy.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {kind === "parent" ? (
                <>
                  <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                    <Link href="/tour">Schedule a Tour</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/login">Portal Login</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                    <Link href="/login">Portal Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/tour">Upcoming Tours</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <div className="mx-auto flex-1 max-w-[1400px] px-4 py-8 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

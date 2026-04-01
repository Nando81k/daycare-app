import {
  CalendarDaysIcon,
  ClipboardListIcon,
  CreditCardIcon,
  MessageCircleMoreIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { PortalAccessCard } from "@/components/marketing/portal-access-card"
import { AppLogo } from "@/components/shared/app-logo"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const portalHighlights = [
  {
    title: "Daily updates",
    detail: "Meals, naps, activities, and classroom notes in one timeline.",
    icon: CalendarDaysIcon,
  },
  {
    title: "Messages and reminders",
    detail: "Family communication and follow-up without inbox clutter.",
    icon: MessageCircleMoreIcon,
  },
  {
    title: "Operations and billing",
    detail: "Enrollment, attendance, staffing, and invoices with clear visibility.",
    icon: ClipboardListIcon,
  },
  {
    title: "Role-aware access",
    detail: "One account entry point for parents and staff with secure routing.",
    icon: ShieldCheckIcon,
  },
] as const

export function PortalLoginPage() {
  return (
    <section className="min-h-[calc(100svh-72px)] lg:h-[calc(100svh-72px)]">
      <div className="mx-auto h-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
        <div className="grid h-full items-center gap-5 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="soft-panel-strong relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_6%,rgba(124,168,164,0.26),transparent_36%),radial-gradient(circle_at_96%_100%,rgba(232,205,168,0.26),transparent_32%)]" />

            <div className="relative">
              <AppLogo />

              <Badge variant="secondary" className="mt-4 rounded-full px-3 py-1 text-primary">
                Unified login
              </Badge>

              <h1 className="mt-3 max-w-2xl font-heading text-3xl tracking-tight text-balance text-foreground sm:text-4xl">
                One access point for families and staff.
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Sign in or create a parent account once. Role permissions route each user to the
                parent or admin workspace automatically.
              </p>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {portalHighlights.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.1rem] border border-border/65 bg-background/82 px-4 py-3 shadow-[0_18px_40px_-38px_rgba(31,64,62,0.46)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/65 bg-secondary/70 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold tracking-tight text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-border/70 bg-background/74 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/65 bg-secondary/68 px-3 py-1">
                    <CreditCardIcon className="size-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Trusted daily workflow
                    </span>
                  </div>
                  <AvatarGroup>
                    <Avatar size="sm">
                      <AvatarFallback>EP</AvatarFallback>
                    </Avatar>
                    <Avatar size="sm">
                      <AvatarFallback>JH</AvatarFallback>
                    </Avatar>
                    <Avatar size="sm">
                      <AvatarFallback>MT</AvatarFallback>
                    </Avatar>
                  </AvatarGroup>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Abassadors Care uses one account entry point so onboarding stays clean while role
                  permissions scale with the product.
                </p>
              </div>
            </div>
          </div>

          <PortalAccessCard />
        </div>
      </div>
    </section>
  )
}

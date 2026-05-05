"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, LogOut, Menu } from "lucide-react"

import { brandConfig } from "@/config/brand"
import { parentNav } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { ParentSidebarBadges } from "@/lib/dal/sidebar-badges"
import type { PortalNavItem } from "@/types/app"

const allItems: PortalNavItem[] = parentNav.flatMap((group) => group.items)
const primaryItems = allItems.filter((item) => item.placement !== "account")
const accountItems = allItems.filter((item) => item.placement === "account")

function isActive(pathname: string, href: string) {
  if (href === "/parent") return pathname === "/parent"
  return pathname === href || pathname.startsWith(`${href}/`)
}

const accountActive = (pathname: string) =>
  accountItems.some((item) => isActive(pathname, item.href))

const BADGED_PARENT_ROUTES = [
  "/parent/messages",
  "/parent/documents",
  "/parent/billing",
] as const

function getBadge(href: string, badges: ParentSidebarBadges | undefined): number {
  if (!badges) return 0
  if (BADGED_PARENT_ROUTES.includes(href as (typeof BADGED_PARENT_ROUTES)[number])) {
    return badges[href as keyof ParentSidebarBadges] ?? 0
  }
  return 0
}

function NavBadge({
  count,
  active = false,
  className,
}: {
  count: number
  active?: boolean
  className?: string
}) {
  if (count <= 0) return null
  return (
    <span
      aria-label={`${count} item${count === 1 ? " needs" : "s need"} attention`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums",
        active ? "bg-brand-yellow text-navy" : "bg-brand-yellow/90 text-navy",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function ParentTopbar({
  badges,
}: {
  badges?: ParentSidebarBadges
} = {}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const accountBadgeTotal = accountItems.reduce(
    (sum, item) => sum + getBadge(item.href, badges),
    0,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="portal-shell-container flex h-16 items-center gap-4 md:h-20">
        {/* Brand */}
        <Link
          href="/parent"
          className="flex items-center gap-3"
          aria-label="Family portal home"
        >
          <Image
            src="/branding/ac-logo-icon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 shrink-0 rounded-[0.85rem] shadow-[0_12px_30px_-18px_rgba(13,59,120,0.55)]"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span
              className="font-heading text-[1.1rem]"
              style={{ color: "var(--navy)" }}
            >
              {brandConfig.shortName}
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Family portal
            </span>
          </span>
        </Link>

        {/* Desktop horizontal nav (centered, scrolls if too narrow) */}
        <nav
          aria-label="Parent portal"
          className="ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex"
        >
          {primaryItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            const badgeCount = getBadge(item.href, badges)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-primary-foreground shadow-(--shadow-soft)"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
                <NavBadge count={badgeCount} active={active} />
              </Link>
            )
          })}

          {accountItems.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    accountActive(pathname)
                      ? "bg-primary text-primary-foreground shadow-(--shadow-soft)"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-label="Account menu"
                >
                  Account
                  <NavBadge count={accountBadgeTotal} active={accountActive(pathname)} />
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {accountItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(pathname, item.href)
                  const badgeCount = getBadge(item.href, badges)
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-3",
                          active && "bg-secondary text-foreground"
                        )}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {item.title}
                            <NavBadge count={badgeCount} className="ml-auto" />
                          </span>
                          {item.summary ? (
                            <span className="text-xs text-muted-foreground">
                              {item.summary}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>

        {/* Right side — sign out (desktop) + mobile drawer trigger */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/logout"
            className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-destructive md:inline-flex md:items-center md:gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[18rem] flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border/60 px-5 py-4">
                <SheetTitle
                  className="text-base font-heading"
                  style={{ color: "var(--navy)" }}
                >
                  {brandConfig.shortName}
                </SheetTitle>
                <SheetDescription>Family portal navigation</SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Parent portal mobile"
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
              >
                {parentNav.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-3 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(pathname, item.href)
                      const badgeCount = getBadge(item.href, badges)
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-secondary"
                            )}
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="flex items-center gap-2 text-sm font-medium">
                                {item.title}
                                <NavBadge count={badgeCount} active={active} className="ml-auto" />
                              </span>
                              {item.summary ? (
                                <span
                                  className={cn(
                                    "text-xs",
                                    active
                                      ? "text-primary-foreground/85"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {item.summary}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                ))}
              </nav>
              <div className="border-t border-border/60 px-3 py-3">
                <SheetClose asChild>
                  <Link
                    href="/logout"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

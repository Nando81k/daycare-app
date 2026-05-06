"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { brandConfig } from "@/config/brand"
import { marketingNav } from "@/config/navigation"
import { cn } from "@/lib/utils"

const HEADER_NAV = marketingNav.filter((item) =>
  ["/programs", "/about", "/gallery", "/faq"].includes(item.href)
)

const navLinkClasses =
  "group relative inline-flex items-center text-sm font-medium uppercase tracking-[0.18em] text-foreground/70 transition-colors duration-200 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none aria-[current=page]:text-foreground after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-[current=page]:after:scale-x-100 aria-[current=page]:after:bg-accent"

type SiteHeaderProps = {
  currentUserRole?: "PARENT" | "ADMIN" | "TEACHER" | null
}

export function SiteHeader({ currentUserRole = null }: SiteHeaderProps = {}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const dashboardHref =
    currentUserRole === "ADMIN"
      ? "/admin"
      : currentUserRole === "TEACHER"
        ? "/teacher"
        : currentUserRole === "PARENT"
          ? "/parent"
          : null

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="shell-container flex h-16 items-center justify-between gap-3 md:h-20 md:gap-6">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="group flex shrink-0 items-center gap-3 transition-colors"
          aria-label={`${brandConfig.name} home`}
        >
          <Image
            src="/branding/ac-logo-icon.png"
            alt=""
            width={44}
            height={44}
            priority
            className="size-10 shrink-0 rounded-xl shadow-(--shadow-soft) md:size-11"
          />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary md:text-xl">
              {brandConfig.shortName}
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-200 group-hover:text-accent">
              Day Care
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {HEADER_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClasses}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          {dashboardHref ? (
            <Button
              asChild
              className="rounded-none bg-primary px-5 text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_70%,transparent)]"
            >
              <Link href={dashboardHref}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                aria-current={isActive("/login") ? "page" : undefined}
                className={cn(navLinkClasses, "hidden sm:inline-flex")}
              >
                Sign in
              </Link>
              <Button
                asChild
                className="rounded-none bg-primary px-5 text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_70%,transparent)]"
              >
                <Link href="/contact">Plan a visit</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[18rem] flex-col gap-0 p-0">
            <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
              <SheetTitle
                className="font-heading text-lg"
                style={{ color: "var(--navy)" }}
              >
                {brandConfig.shortName}
              </SheetTitle>
              <SheetDescription>Browse the public site</SheetDescription>
            </SheetHeader>
            <nav
              aria-label="Site navigation"
              className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
            >
              {[{ label: "Home", href: "/" }, ...HEADER_NAV].map((item) => {
                const active = isActive(item.href)
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>
            <div className="flex flex-col gap-2 border-t border-border/60 px-3 py-4">
              {dashboardHref ? (
                <SheetClose asChild>
                  <Link
                    href={dashboardHref}
                    className="rounded-full bg-brand-yellow px-4 py-2.5 text-center text-sm font-bold uppercase tracking-[0.18em] text-navy"
                  >
                    Go to dashboard
                  </Link>
                </SheetClose>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link
                      href="/contact"
                      className="rounded-full bg-brand-yellow px-4 py-2.5 text-center text-sm font-bold uppercase tracking-[0.18em] text-navy"
                    >
                      Plan a visit
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className="rounded-full px-4 py-2.5 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary"
                    >
                      Sign in
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

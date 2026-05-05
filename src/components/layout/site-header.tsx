"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
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
      <div className="shell-container flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="group flex items-center gap-3 transition-colors"
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

        <div className="flex items-center gap-4">
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
      </div>
    </header>
  )
}

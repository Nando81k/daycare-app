"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { marketingNav, portalLinks } from "@/data/navigation"
import { cn } from "@/lib/utils"
import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar"

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const primaryNav = marketingNav.filter((item) => item.href !== "/tour")
  const navItems = primaryNav.map((item) => ({ name: item.label, link: item.href }))

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Navbar className="top-4">
          <NavBody>
            <AppLogo />
            <NavItems items={navItems} currentPath={pathname} />
            <div className="relative z-20 flex items-center gap-2">
              {portalLinks.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={isCurrentPath(pathname, item.href) ? "secondary" : "ghost"}
                  className="rounded-full px-4"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button asChild className="rounded-full px-5">
                <Link href="/tour">
                  Schedule a Tour
                  <ChevronRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </NavBody>

          <MobileNav>
            <MobileNavHeader className="px-1">
              <AppLogo compact />
              <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen((value) => !value)} />
            </MobileNavHeader>

            <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
              <nav className="flex w-full flex-col gap-2">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
                      isCurrentPath(pathname, item.href) && "border-border/70 bg-background text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-1 flex w-full flex-col gap-2 border-t border-border/60 pt-3">
                {portalLinks.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant={isCurrentPath(pathname, item.href) ? "secondary" : "outline"}
                    className="w-full justify-start rounded-xl px-4"
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <Button asChild className="w-full justify-start rounded-xl px-4">
                  <Link href="/tour" onClick={() => setMobileOpen(false)}>
                    Schedule a Tour
                    <ChevronRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>
    </header>
  )
}

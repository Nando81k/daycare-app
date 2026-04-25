import Link from "next/link"

import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { marketingNav } from "@/config/navigation"

const HEADER_NAV = marketingNav.filter((item) =>
  ["/programs", "/about", "/tuition", "/faq"].includes(item.href)
)

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="shell-container flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <span className="font-heading text-xl tracking-tight text-foreground md:text-2xl">
            {brandConfig.shortName}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            Daycare
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {HEADER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login/parent"
            className="hidden text-sm font-medium uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="rounded-none bg-primary px-5 text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/contact">Plan a visit</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

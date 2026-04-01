import Link from "next/link"

import { AppLogo } from "@/components/shared/app-logo"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-[linear-gradient(180deg,rgba(251,249,245,0.6),rgba(241,247,245,0.85))]">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.75fr_0.75fr_0.8fr]">
          <div className="space-y-4">
            <AppLogo />
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Boutique daycare and family portal built for warm communication, organized administration,
              and confident daily care.
            </p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Explore</p>
            <Link href="/programs" className="block transition-colors hover:text-foreground">
              Programs
            </Link>
            <Link href="/tuition" className="block transition-colors hover:text-foreground">
              Tuition
            </Link>
            <Link href="/tour" className="block transition-colors hover:text-foreground">
              Schedule a Tour
            </Link>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Visit</p>
            <p>142 Cedar Row</p>
            <p>Brooklyn, NY 11215</p>
            <p>Mon - Fri · 7:00 AM - 6:00 PM</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Contact</p>
            <p>(555) 014-1224</p>
            <p>hello@abassadorscare.com</p>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="/login" className="transition-colors hover:text-foreground">
                Portal Login
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Abassadors Care</p>
          <p>Warm care, clear communication, organized operations.</p>
        </div>
      </section>
    </footer>
  )
}

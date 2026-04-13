import Link from "next/link"

import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl border border-white/30 bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 shadow-inner">
            <span className="text-sm font-bold tracking-tight text-slate-800">AC</span>
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              {brandConfig.name}
            </p>
            <p className="text-xs text-slate-500">Daycare</p>
          </div>
        </Link>

        <Button
          asChild
          variant="secondary"
          className="h-10 rounded-full bg-slate-900 px-5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 hover:text-white"
        >
          <Link href="/login/parent">Sign In</Link>
        </Button>
      </div>
    </header>
  )
}

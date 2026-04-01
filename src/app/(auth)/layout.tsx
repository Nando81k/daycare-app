import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-hidden">
      <header className="px-4 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="soft-panel flex h-14 items-center justify-between px-3 sm:px-4">
            <AppLogo compact />
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/">
                  <ArrowLeftIcon className="size-4" />
                  Back to site
                </Link>
              </Button>
              <Separator orientation="vertical" className="hidden h-5 sm:block" />
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/tour">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

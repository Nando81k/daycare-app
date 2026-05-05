import type * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { brandConfig } from "@/config/brand"

/**
 * Minimal shell for the staff onboarding wizard. Intentionally has no
 * portal nav and no marketing nav — onboarding is a focused, sequential
 * task and the user shouldn't be tempted to click into the portal before
 * they finish.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="shell-container flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/ac-logo-icon.png"
              alt=""
              width={40}
              height={40}
              priority
              className="size-9 shrink-0 rounded-[0.85rem]"
            />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg tracking-tight text-foreground md:text-xl">
                {brandConfig.shortName}
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Staff onboarding
              </span>
            </span>
          </div>
          <Link
            href="/logout"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
          >
            Sign out
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

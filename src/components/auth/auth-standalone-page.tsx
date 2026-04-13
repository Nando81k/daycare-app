import type * as React from "react"

import { AuthBrandPanel } from "./auth-brand-panel"
import { AuthWordmark } from "./auth-wordmark"

type AuthStandalonePageProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthStandalonePage({
  title,
  description,
  children,
}: AuthStandalonePageProps) {
  return (
    <section className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <AuthWordmark />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-balance text-muted-foreground">{description}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      <AuthBrandPanel />
    </section>
  )
}

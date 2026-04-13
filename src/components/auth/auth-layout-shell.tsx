import type * as React from "react"

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-background text-foreground">{children}</div>
}

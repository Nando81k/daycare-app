"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RotateCw } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"

export default function AdminPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin portal]", error)
  }, [error])

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <SurfaceCard className="space-y-5 p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Something went wrong loading this page
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ve logged the error. Try again, or head back to the
              overview to continue your work.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-muted-foreground/70">
                Reference {error.digest}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>
            <RotateCw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">Back to overview</Link>
          </Button>
        </div>
      </SurfaceCard>
    </PageShell>
  )
}

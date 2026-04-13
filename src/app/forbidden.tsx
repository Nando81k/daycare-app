import Link from "next/link"
import { ShieldAlertIcon } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <PageShell className="min-h-[60vh] items-center justify-center py-16">
      <SurfaceCard className="max-w-2xl items-center gap-6 px-8 py-10 text-center">
        <div className="rounded-3xl bg-accent/80 p-4 text-primary">
          <ShieldAlertIcon className="size-7" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl text-foreground">This account does not have access to that portal.</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Parent and admin areas are protected separately. Sign in with the correct role or return to the public site.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login/parent" className={buttonVariants({ variant: "outline" })}>
            Parent login
          </Link>
          <Link href="/login/admin" className={buttonVariants({ variant: "default" })}>
            Admin login
          </Link>
        </div>
      </SurfaceCard>
    </PageShell>
  )
}

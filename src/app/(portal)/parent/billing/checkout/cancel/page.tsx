import Link from "next/link"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SurfaceCard } from "@/components/shared/surface-card"
import { requireRole } from "@/lib/auth"

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice_id?: string }>
}) {
  await requireRole("PARENT")
  const { invoice_id: invoiceId } = await searchParams

  return (
    <div className="flex flex-col gap-5">
      <SurfaceCard className="space-y-5 p-8">
        <header className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <Info className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              No payment was taken
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              You cancelled before completing checkout. Your invoice is unchanged
              — you can try again any time.
            </p>
          </div>
        </header>

        <div className="flex flex-wrap gap-3">
          {invoiceId ? (
            <Button asChild>
              <Link href={`/parent/billing/pay/${invoiceId}`}>Try again</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/parent/billing">Back to billing</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/parent/billing">Back to billing</Link>
          </Button>
        </div>
      </SurfaceCard>
    </div>
  )
}

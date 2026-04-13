import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="shell-container py-20">
      <EmptyState
        icon={CompassIcon}
        title="That route is not available"
        description="The Phase 0 foundation is in place, but this path does not map to a configured public or portal route."
        action={
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            Return Home
          </Link>
        }
      />
    </main>
  )
}

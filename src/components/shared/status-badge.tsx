import type { StatusBadgeVariant } from "@/types/app"

import { Badge } from "@/components/ui/badge"

export function StatusBadge({
  variant = "default",
  children,
}: {
  variant?: StatusBadgeVariant
  children: React.ReactNode
}) {
  return <Badge variant={variant}>{children}</Badge>
}

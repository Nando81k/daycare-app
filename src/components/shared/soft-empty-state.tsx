import type { LucideIcon } from "lucide-react"
import { SearchXIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function SoftEmptyState({
  title,
  description,
  icon: Icon = SearchXIcon,
  action,
}: {
  title: string
  description: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <Empty className="rounded-[1.75rem] border-border/70 bg-background/72 py-10">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-2xl border border-border/70 bg-secondary/70 text-primary [&_svg]:size-5"
        >
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="text-base text-foreground">{title}</EmptyTitle>
        <EmptyDescription className="max-w-md">{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}

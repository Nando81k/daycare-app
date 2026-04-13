import { CircleDashedIcon } from "lucide-react"

import type { EmptyStateProps } from "@/types/app"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function EmptyState({
  title,
  description,
  icon: Icon = CircleDashedIcon,
  action,
}: EmptyStateProps) {
  return (
    <Empty className="rounded-[1.4rem] border-border/60 bg-background/72 py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-10 rounded-xl bg-accent/55 text-primary [&_svg]:size-5">
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold text-foreground">{title}</EmptyTitle>
        <EmptyDescription className="max-w-xl text-sm leading-6">{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}

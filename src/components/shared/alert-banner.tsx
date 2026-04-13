import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon } from "lucide-react"

import type { AlertBannerProps } from "@/types/app"

import { cn } from "@/lib/utils"

const toneStyles = {
  default: {
    icon: InfoIcon,
    className: "border-border/70 bg-background/82 text-foreground",
  },
  success: {
    icon: CheckCircle2Icon,
    className: "border-emerald-300/60 bg-emerald-500/10 text-emerald-900",
  },
  warning: {
    icon: TriangleAlertIcon,
    className: "border-amber-300/70 bg-amber-500/12 text-amber-900",
  },
  destructive: {
    icon: AlertCircleIcon,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  info: {
    icon: InfoIcon,
    className: "border-sky-300/70 bg-sky-500/10 text-sky-900",
  },
}

export function AlertBanner({
  title,
  description,
  tone = "default",
  action,
}: AlertBannerProps) {
  const { icon: Icon, className } = toneStyles[tone]

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[1.5rem] border px-5 py-4 shadow-[0_20px_48px_-36px_rgba(20,44,45,0.28)] md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/70 p-2.5">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">{title}</p>
          <p className="max-w-3xl text-sm leading-6 opacity-90">{description}</p>
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  )
}

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface ProgramCardProps {
  icon: ReactNode
  title: string
  description: string
  highlight?: boolean
  className?: string
}

export function ProgramCard({ icon, title, description, highlight = false, className = "" }: ProgramCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 p-6 rounded-2xl transition bg-white/90 border border-sky-100 hover:bg-sky-50/60 hover:shadow-md",
        highlight && "ring-2 ring-sky-200 bg-sky-50/80",
        className
      )}
    >
      <span className="inline-flex items-center justify-center rounded-xl bg-sky-50 p-3 text-sky-700 text-lg">
        {icon}
      </span>
      <span className="text-lg font-semibold text-slate-900">{title}</span>
      <span className="text-sm text-slate-600">{description}</span>
    </div>
  )
}

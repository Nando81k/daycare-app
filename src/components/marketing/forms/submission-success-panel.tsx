"use client"

import { CheckCircle2Icon } from "lucide-react"

import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"

export function SubmissionSuccessPanel({
  title,
  description,
  nextSteps,
  onReset,
}: {
  title: string
  description: string
  nextSteps: string[]
  onReset: () => void
}) {
  return (
    <SurfaceCard tone="accent" className="gap-6 px-6 py-8">
      <div className="flex items-start gap-4">
        <div className="rounded-3xl bg-primary/12 p-3 text-primary">
          <CheckCircle2Icon className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-3">
        {nextSteps.map((step) => (
          <div key={step} className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {step}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onReset}>Submit another response</Button>
      </div>
    </SurfaceCard>
  )
}

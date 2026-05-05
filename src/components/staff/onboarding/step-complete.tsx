"use client"

import { CheckCircle2, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function StepComplete({
  profileComplete,
  allDocsSubmitted,
  allPoliciesSigned,
  onComplete,
  isCompleting,
}: {
  profileComplete: boolean
  allDocsSubmitted: boolean
  allPoliciesSigned: boolean
  onComplete: () => void
  isCompleting: boolean
}) {
  const checklist: Array<{ label: string; done: boolean }> = [
    { label: "Profile", done: profileComplete },
    { label: "Required documents", done: allDocsSubmitted },
    { label: "Policy acknowledgements", done: allPoliciesSigned },
  ]
  const everythingReady = checklist.every((item) => item.done)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-navy p-6 text-white shadow-(--shadow-soft) md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">
          Almost there
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-white md:text-4xl">
          {everythingReady
            ? "You're ready to head into the staff portal."
            : "Finish a couple more items to head in."}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
          {everythingReady
            ? "When you press Complete, your onboarding is recorded and you'll land on your staff dashboard. The director will review uploaded documents in the background — you don't need to wait."
            : "Use the steps above to finish anything still outstanding, then come back here to complete your setup."}
        </p>
      </div>

      <ul className="grid gap-3">
        {checklist.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-border/65 bg-card px-4 py-3"
          >
            {item.done ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={
                item.done
                  ? "text-sm font-medium text-foreground"
                  : "text-sm font-medium text-muted-foreground"
              }
            >
              {item.label}
            </span>
            {!item.done ? (
              <span className="ml-auto text-xs uppercase tracking-[0.18em] text-warning-foreground">
                Outstanding
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          onClick={onComplete}
          disabled={!everythingReady || isCompleting}
          className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
        >
          {isCompleting ? "Finishing…" : "Complete onboarding"}
        </Button>
      </div>
    </div>
  )
}

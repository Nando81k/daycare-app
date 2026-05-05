import { ClipboardList, Info } from "lucide-react"

import { AlertBanner } from "@/components/shared/alert-banner"

export function StepClassroom({
  classroom,
  userRole,
}: {
  classroom: { id: string; name: string } | null
  userRole: "ADMIN" | "TEACHER" | "PARENT"
}) {
  if (classroom) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/65 bg-card p-6 shadow-(--shadow-soft)">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
                Your assigned classroom
              </p>
              <h3 className="mt-1 font-heading text-2xl leading-tight text-foreground">
                {classroom.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Once you finish onboarding you&apos;ll see this room&apos;s roster, daily reports,
                and parent messages in your portal. If anything looks wrong, your
                director can reassign you from the Staff page.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AlertBanner
        tone="info"
        title="Classroom not assigned yet"
        description={
          userRole === "ADMIN"
            ? "You're an admin — you don't need a classroom assignment to use the portal."
            : "Your account is set up but a classroom hasn't been assigned. Ask the director to add you to a room from the Staff page; you can still finish onboarding now."
        }
      />
      <div className="rounded-2xl border border-dashed border-border/65 bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
        <Info className="mr-2 inline-block h-4 w-4 align-text-bottom text-brand-blue" />
        Continuing without a classroom is fine. You&apos;ll see a friendly reminder in your
        staff portal until a room is assigned.
      </div>
    </div>
  )
}

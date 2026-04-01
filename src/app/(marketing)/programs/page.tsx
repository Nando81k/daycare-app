import { programs } from "@/data/marketing"
import { PageIntro } from "@/components/shared/page-intro"
import { ProgramGrid } from "@/components/marketing/program-grid"
import { SectionShell } from "@/components/shared/section-shell"

export default function ProgramsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Programs"
        title="Responsive care plans for infants through pre-K."
        description="Each classroom has its own pace and priorities, but the family experience stays consistent: dependable routines, calm communication, and clear visibility."
      />
      <SectionShell
        title="Classrooms built around age, rhythm, and confidence."
        description="Our teachers use routines that feel grounded rather than rigid, with just enough structure to support belonging and growth."
      >
        <ProgramGrid items={programs} />
      </SectionShell>
      <SectionShell
        eyebrow="Daily rhythm"
        title="What stays consistent across every program."
        description="The exact schedule shifts by age group, but the operating principles stay steady from infants to pre-K."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Calm arrivals with teacher handoff and immediate visibility in the parent portal.",
            "Play-based learning, outdoor movement, and transitions supported by predictable routines.",
            "Teacher notes that explain the day clearly instead of overwhelming families with noise.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 text-sm leading-7 text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  )
}

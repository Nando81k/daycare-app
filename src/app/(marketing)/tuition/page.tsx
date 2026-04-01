import { familyFaqs, tuitionTiers } from "@/data/marketing"
import { FaqList } from "@/components/marketing/faq-list"
import { TuitionGrid } from "@/components/marketing/tuition-grid"
import { PageIntro } from "@/components/shared/page-intro"
import { SectionShell } from "@/components/shared/section-shell"

export default function TuitionPage() {
  return (
    <>
      <PageIntro
        eyebrow="Tuition"
        title="Clear tuition designed to lower friction for families."
        description="Our pricing is intentionally straightforward: understandable weekly rates, consistent deposits, and a portal that keeps statements, receipts, and payment timing visible."
      />
      <SectionShell
        title="Choose the schedule that matches your family’s routine."
        description="The goal is predictability: families know what they are paying for and where to manage it."
      >
        <TuitionGrid items={tuitionTiers} />
      </SectionShell>
      <SectionShell
        eyebrow="Included"
        title="What tuition supports beyond classroom time."
        description="Families are paying for care and communication together, not two disconnected systems."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Daily updates in the parent portal with classroom notes and care details.",
            "Organized billing history, autopay visibility, and receipts inside the same navigation.",
            "Family conferences, milestone conversations, and operational follow-through from staff.",
            "Thoughtful transitions between inquiry, tour, enrollment, and everyday care.",
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
      <SectionShell
        eyebrow="FAQ"
        title="A few practical questions about deposits, schedules, and billing."
      >
        <FaqList items={familyFaqs.slice(1)} />
      </SectionShell>
    </>
  )
}

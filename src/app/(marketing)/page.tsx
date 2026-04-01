import { familyFaqs, programs, tuitionTiers } from "@/data/marketing"
import { HomeCallToAction } from "@/components/marketing/home-call-to-action"
import { HomeContentShowcase } from "@/components/marketing/home-content-showcase"
import { HomeHero } from "@/components/marketing/home-hero"
import { FaqList } from "@/components/marketing/faq-list"
import { ProgramGrid } from "@/components/marketing/program-grid"
import { TrustFlowSection } from "@/components/marketing/trust-flow-section"
import { TuitionGrid } from "@/components/marketing/tuition-grid"
import { SectionShell } from "@/components/shared/section-shell"

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <TrustFlowSection />
      <SectionShell
        eyebrow="Programs"
        title="Age-based programs with enough structure to feel dependable and enough warmth to feel human."
        description="Each classroom rhythm is tuned to the age group, and every one of them is supported by the same clear family communication."
        tone="warm"
      >
        <ProgramGrid items={programs} compact />
      </SectionShell>
      <HomeContentShowcase />
      <SectionShell
        eyebrow="Tuition"
        title="Transparent pricing that reads like a service plan, not a scavenger hunt."
        description="Families can understand the schedule, rate, and what is included without calling for basic information."
        tone="mist"
      >
        <TuitionGrid items={tuitionTiers} compact />
      </SectionShell>
      <HomeCallToAction />
      <FaqList items={familyFaqs} />
    </>
  )
}

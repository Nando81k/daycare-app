import Link from "next/link"

import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { FaqAccordion } from "@/components/marketing/sections/faq-accordion"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { faqGroups, faqPageContent, marketingMedia } from "@/data/marketing"
import { brandConfig } from "@/config/brand"

export function FaqPage() {
  return (
    <PageShell className="gap-14 pb-16">
      <PageIntro
        eyebrow={faqPageContent.eyebrow}
        title={faqPageContent.title}
        description={faqPageContent.description}
        actions={
          <>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Contact the School
            </Link>
            <Link href="/waitlist" className={buttonVariants({ variant: "ghost" })}>
              Join the Waitlist
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <MarketingMediaPanel
          asset={marketingMedia.contactStory}
          className="min-h-[22rem]"
          eyebrow="Questions in context"
          title="Parents usually need clearer context, not more marketing language."
        />
        <AlertBanner
          tone="info"
          title="Still deciding what the right first step is?"
          description="If your timing is longer range, the waitlist form is usually the better starting point. If you are ready to move, create a parent account and begin enrollment directly."
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/signup/parent" className={buttonVariants({ variant: "default", size: "sm" })}>
                {brandConfig.primaryCtaLabel}
              </Link>
              <Link href="/waitlist" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Join Waitlist
              </Link>
            </div>
          }
        />
      </div>

      <Reveal>
        <SectionShell
          eyebrow="Grouped answers"
          title="Questions are organized around the actual decisions families are making."
          description="That keeps the page useful for both early research and active enrollment conversations."
        >
          <SurfaceCard tone="strong" className="gap-5 px-6 py-6">
            <FaqAccordion groups={faqGroups} />
          </SurfaceCard>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Need a more specific answer?"
        title="Some questions are better answered in context."
        description="If your family has unique timing, schedule, or care needs, send a note or join the waitlist so we can respond with the right level of detail."
        primaryHref="/contact"
        primaryLabel="Contact the School"
        secondaryHref="/waitlist"
        secondaryLabel="Join the Waitlist"
      />
    </PageShell>
  )
}

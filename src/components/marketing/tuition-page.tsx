import Link from "next/link"

import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { FaqAccordion } from "@/components/marketing/sections/faq-accordion"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { faqGroups, marketingMedia, tuitionPageContent, tuitionTiers } from "@/data/marketing"

export function TuitionPage() {
  const tuitionFaqGroups = faqGroups.filter((group) => ["enrollment", "tuition"].includes(group.id))

  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={tuitionPageContent.eyebrow}
        title={tuitionPageContent.title}
        description={tuitionPageContent.description}
        actions={
          <>
            <Link href="/signup/parent" className={buttonVariants({ variant: "default" })}>
              {brandConfig.primaryCtaLabel}
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Ask a Question
            </Link>
          </>
        }
      />

      <Reveal>
        <SectionShell
          eyebrow="Sample pricing tiers"
          title="Schedules and tuition are easier to evaluate when the context is visible."
          description="These sample tiers show how care options are framed in a direct, parent-friendly way."
        >
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <MarketingMediaPanel
              asset={marketingMedia.tuitionStory}
              className="min-h-[30rem]"
              eyebrow="Transparent planning"
              title="Pricing should reflect the actual care experience, not a generic fee table."
              description="We pair schedule options, what is included, and next-step guidance so families can decide with confidence."
            />
            <div className="grid gap-4">
              {tuitionTiers.map((tier, index) => (
                <SurfaceCard key={tier.name} tone={index === 0 ? "strong" : "default"} className="gap-5 px-6 py-6" interactive>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h2 className="text-3xl text-foreground">{tier.name}</h2>
                      <p className="text-sm font-medium text-primary">
                        {tier.amount} · {tier.cadence}
                      </p>
                    </div>
                    {tier.note ? <p className="max-w-sm text-sm leading-6 text-muted-foreground">{tier.note}</p> : null}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{tier.blurb}</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {tier.includes.map((item) => (
                      <div key={item} className="surface-panel-quiet rounded-[1.15rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Planning context"
          title="Transparent tuition works best when it is paired with realistic expectations."
          description="Families need to understand what the numbers mean, how placement is decided, and which step to take next."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {tuitionPageContent.policies.map((policy, index) => (
              <SurfaceCard key={policy} tone={index === 0 ? "accent" : "muted"} className="gap-4 px-6 py-6">
                <p className="text-sm leading-6 text-muted-foreground">{policy}</p>
              </SurfaceCard>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Pricing questions"
          title="The practical follow-up questions matter just as much as the headline numbers."
          description="These FAQs cover the most common schedule and enrollment questions families ask after seeing tuition."
        >
          <SurfaceCard tone="strong" className="gap-5 px-6 py-6">
            <FaqAccordion groups={tuitionFaqGroups} compact />
          </SurfaceCard>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Ready to talk about fit?"
        title="Use tuition as a planning tool, then take the next step that matches your timing."
        description="Families should not be pushed into one path. Use the waitlist if you are planning ahead, or create a parent account if you are ready to start enrollment."
        primaryHref="/signup/parent"
        primaryLabel={brandConfig.primaryCtaLabel}
        secondaryHref="/waitlist"
        secondaryLabel="Join the Waitlist"
      />
    </PageShell>
  )
}

import Link from "next/link"

import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { aboutPageContent, galleryMoments, marketingMedia, testimonials, trustPoints, valuePillars } from "@/data/marketing"

export function AboutPage() {
  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={aboutPageContent.eyebrow}
        title={aboutPageContent.title}
        description={aboutPageContent.description}
        actions={
          <>
            <Link href="/signup/parent" className={buttonVariants({ variant: "default" })}>
              {brandConfig.primaryCtaLabel}
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Contact the School
            </Link>
          </>
        }
      />

      <Reveal>
        <SectionShell
          eyebrow="Our approach"
          title="The strongest daycare experience feels personal in the small details, not just the headline promises."
          description="We design around the moments parents and children actually remember: drop-off, room feel, classroom pacing, the tone of updates, and whether questions are answered clearly."
        >
          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <SurfaceCard tone="strong" className="gap-5 px-6 py-6 md:px-7">
              <p className="text-base leading-7 text-muted-foreground">
                Ambassadors Care is built around the belief that warmth and organization should not
                compete with each other.
                Families need classrooms that feel nurturing, but they also need a school that communicates clearly,
                follows through, and makes daily logistics manageable.
              </p>
              <p className="text-base leading-7 text-muted-foreground">
                That philosophy shapes both the in-person experience and the digital product. Public
                pages set expectations clearly. The parent portal stays intentionally small, and the
                admin side only covers enrollment review, payment visibility, and approval.
              </p>
            </SurfaceCard>
            <MarketingMediaPanel
              asset={marketingMedia.aboutStory}
              className="min-h-[28rem]"
              eyebrow="Classroom feel"
              title="Children benefit when rooms are calm, adults are consistent, and parents feel informed."
            />
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="What guides the experience"
          title="A small number of values, applied consistently."
          description="These pillars shape both the classroom experience and how the broader platform is built."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {valuePillars.map((pillar) => (
              <SurfaceCard key={pillar.title} className="gap-4 px-6 py-6" interactive>
                <h3 className="text-2xl text-foreground">{pillar.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                <div className="grid gap-2">
                  {pillar.points.map((point) => (
                    <p key={point} className="text-sm leading-6 text-muted-foreground">
                      {point}
                    </p>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Communication and standards"
          title="Trust builds when routines and expectations are visible."
          description="Parents are more comfortable when the school’s standards feel concrete and understandable."
        >
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="grid gap-5">
              {trustPoints.map((point) => (
                <SurfaceCard key={point.title} tone="accent" className="gap-4 px-6 py-6">
                  <p className="editorial-kicker">{point.title}</p>
                  <h3 className="text-2xl text-foreground">{point.description}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{point.detail}</p>
                </SurfaceCard>
              ))}
            </div>
            <div className="grid gap-5">
              {testimonials.map((testimonial, index) => (
                <SurfaceCard key={testimonial.parentName} className="gap-4 px-6 py-6" tone={index === 0 ? "strong" : "default"}>
                  <p className="text-base leading-7 text-foreground">“{testimonial.quote}”</p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{testimonial.parentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.childStage} · {testimonial.tenure}
                    </p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Environment and feel"
          title="The classroom should feel settled, not overdesigned."
          description="We use atmosphere to support orientation and trust, not to distract from the structure of the experience."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {galleryMoments.map((moment) => (
              <SurfaceCard key={moment.title} tone="muted" className="gap-3 px-6 py-6">
                <p className="editorial-kicker">{moment.timeframe}</p>
                <h3 className="text-2xl text-foreground">{moment.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{moment.description}</p>
              </SurfaceCard>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Ready for the next step?"
        title="Start with a parent account or reach out with questions."
        description="If the tone, routines, and communication approach feel aligned with what your family wants, the next step should still feel direct and low-friction."
        primaryHref="/signup/parent"
        primaryLabel={brandConfig.primaryCtaLabel}
        secondaryHref="/contact"
        secondaryLabel="Contact the School"
      />
    </PageShell>
  )
}

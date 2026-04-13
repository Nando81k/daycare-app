import Link from "next/link"

import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { galleryMoments, marketingMedia, programDetails, programsPageContent, valuePillars } from "@/data/marketing"

const programMedia = {
  infants: marketingMedia.programsInfants,
  toddlers: marketingMedia.programsToddlers,
  preschool: marketingMedia.programsPreschool,
} as const

export function ProgramsPage() {
  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={programsPageContent.eyebrow}
        title={programsPageContent.title}
        description={programsPageContent.description}
        actions={
          <>
            <Link href="/waitlist" className={buttonVariants({ variant: "outline" })}>
              Join the Waitlist
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>
              Contact the School
            </Link>
          </>
        }
      />

      <Reveal>
        <SectionShell
          eyebrow="How the day is shaped"
          title="Programs are built around rhythm, not just a list of activities."
          description="Families are usually deciding whether a classroom will feel overstimulating or grounded. These shared patterns help that decision happen with confidence."
        >
          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <MarketingMediaPanel
              asset={marketingMedia.aboutStory}
              eyebrow="Across every room"
              title="Predictable rhythm, gentler transitions, and updates that sound human."
              description="The common thread is not identical schedules. It is a steady, respectful pace that helps children and parents know what to expect."
              className="min-h-[28rem]"
            />
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {programsPageContent.dailyRhythmHighlights.map((highlight) => (
                <SurfaceCard key={highlight} tone="muted" className="gap-3 px-6 py-6">
                  <p className="text-sm leading-6 text-muted-foreground">{highlight}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Program details"
          title="Each classroom adapts to the child’s stage while keeping the same calm standard."
          description="The specific rhythm changes by age, but the product promise stays stable: warm care, clear communication, and thoughtful structure."
        >
          <div className="grid gap-8">
            {programDetails.map((program, index) => (
              <div
                key={program.id}
                className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:items-stretch"
              >
                <MarketingMediaPanel
                  asset={programMedia[program.id as keyof typeof programMedia]}
                  className={index % 2 === 1 ? "xl:order-2 min-h-[26rem]" : "min-h-[26rem]"}
                  eyebrow={program.ageRange}
                  title={program.name}
                  description={program.schedule}
                />
                <SurfaceCard
                  tone="strong"
                  className={index % 2 === 1 ? "xl:order-1 gap-6 px-6 py-6 md:px-7" : "gap-6 px-6 py-6 md:px-7"}
                >
                  <div className="space-y-3">
                    <p className="editorial-kicker">What families can expect</p>
                    <h2 className="text-3xl text-foreground">{program.name}</h2>
                    <p className="text-base leading-7 text-muted-foreground">{program.overview}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-foreground">Daily rhythm</p>
                      {program.dailyRhythm.map((item) => (
                        <div key={item} className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-foreground">Care highlights</p>
                      {program.careHighlights.map((item) => (
                        <div key={item} className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="section-divider grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Learning focus</p>
                      <p className="text-sm leading-6 text-muted-foreground">{program.learningFocus}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Environment note</p>
                      <p className="text-sm leading-6 text-muted-foreground">{program.environmentNote}</p>
                    </div>
                  </div>
                </SurfaceCard>
              </div>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Beyond the schedule"
          title="Families choose a school for the feel of the room as much as the written program."
          description="These qualities show up across infant, toddler, and preschool experiences."
        >
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5">
              {galleryMoments.map((moment) => (
                <SurfaceCard key={moment.title} tone="muted" className="gap-3 px-6 py-6">
                  <p className="editorial-kicker">{moment.timeframe}</p>
                  <h3 className="text-2xl text-foreground">{moment.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{moment.description}</p>
                </SurfaceCard>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-3">
              {valuePillars.map((pillar) => (
                <SurfaceCard key={pillar.title} className="gap-4 px-6 py-6" interactive>
                  <h3 className="text-2xl text-foreground">{pillar.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Want help narrowing the fit?"
        title="Join the waitlist or contact the school with your timing questions."
        description="If you are still deciding between age ranges or schedules, the best next step is the one that gives the team real planning context."
        primaryHref="/waitlist"
        primaryLabel="Join the Waitlist"
        secondaryHref="/contact"
        secondaryLabel="Contact the School"
      />
    </PageShell>
  )
}

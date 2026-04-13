import Link from "next/link"
import { CalendarDaysIcon, CheckCircle2Icon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react"

import { TourRequestForm } from "@/components/marketing/forms/tour-request-form"
import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { marketingMedia, programSummaries, tourPageContent } from "@/data/marketing"

export function TourPage() {
  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={tourPageContent.eyebrow}
        title={tourPageContent.title}
        description={tourPageContent.description}
        actions={
          <Link href="/waitlist" className={buttonVariants({ variant: "outline" })}>
            Join the Waitlist Instead
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-5">
          <MarketingMediaPanel
            asset={marketingMedia.formStory}
            className="min-h-[22rem]"
            eyebrow="A calmer first step"
            title="The visit should feel helpful, not like a rushed sales appointment."
          />
          <SurfaceCard tone="accent" className="gap-5 px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-3xl bg-primary/12 p-3 text-primary">
                <CalendarDaysIcon className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl text-foreground">What to expect from the visit</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  The tour flow is designed to feel calm and helpful, not like a generic sales handoff.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {tourPageContent.expectations.map((expectation) => (
                <div key={expectation} className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {expectation}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <TourRequestForm />
      </div>

      <Reveal>
        <SectionShell
          eyebrow="What families usually want to see"
          title="The visit should help you evaluate fit, not just hear general philosophy."
          description="These are the areas parents most often ask about while touring the space."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <ShieldCheckIcon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Routines and safety</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Pickup flow, supervision, classroom pacing, allergies, and how staff keep the day orderly.
              </p>
            </SurfaceCard>
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <MessageSquareIcon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Family communication</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                What parents hear each day, how much detail is shared, and how questions are answered after enrollment.
              </p>
            </SurfaceCard>
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <CheckCircle2Icon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Program fit</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Whether the age-group rhythm, classroom environment, and schedule options fit your child and your family life.
              </p>
            </SurfaceCard>
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Programs you can explore"
          title="A tour is the fastest way to compare classroom stages side by side."
          description="If you are deciding between rooms or thinking ahead to the next age range, we can help frame that during the visit."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {programSummaries.map((program) => (
              <SurfaceCard key={program.id} className="gap-3 px-6 py-6" interactive>
                <p className="editorial-kicker">{program.ageRange}</p>
                <h3 className="text-2xl text-foreground">{program.name}</h3>
                <p className="text-sm font-medium text-primary">{program.schedule}</p>
                <p className="text-sm leading-6 text-muted-foreground">{program.summary}</p>
              </SurfaceCard>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Still planning farther ahead?"
        title="If your timing is not immediate, the waitlist can be the better first step."
        description="Some families book a tour right away. Others start with the waitlist so timing, age range, and schedule needs are already documented."
        primaryHref="/waitlist"
        primaryLabel="Join the Waitlist"
        secondaryHref="/contact"
        secondaryLabel="Contact the School"
      />
    </PageShell>
  )
}

import Link from "next/link"
import { CheckCircle2Icon, Clock3Icon, MessageSquareIcon } from "lucide-react"

import { WaitlistForm } from "@/components/marketing/forms/waitlist-form"
import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { faqPreview, marketingMedia, waitlistPageContent } from "@/data/marketing"

export function WaitlistPage() {
  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={waitlistPageContent.eyebrow}
        title={waitlistPageContent.title}
        description={waitlistPageContent.description}
        actions={
          <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
            Need to Talk First?
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-5">
          <MarketingMediaPanel
            asset={marketingMedia.formStory}
            className="min-h-[22rem]"
            eyebrow="Lower-friction planning"
            title="The waitlist is built for families who are planning ahead, not just ready-to-enroll families."
          />
          <SurfaceCard tone="accent" className="gap-5 px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-3xl bg-primary/12 p-3 text-primary">
                <Clock3Icon className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl text-foreground">When the waitlist is the right first step</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  The waitlist is designed for families who are planning ahead, comparing timing, or not yet ready to create a parent account.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {waitlistPageContent.expectations.map((expectation) => (
                <div key={expectation} className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {expectation}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <WaitlistForm />
      </div>

      <Reveal>
        <SectionShell
          eyebrow="Planning questions"
          title="Families often use the waitlist when their search is active, but their timing is still moving."
          description="These are the kinds of questions that usually come up before a family is ready for a final enrollment decision."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <Clock3Icon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Future timing</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Useful for families planning around parental leave, work changes, or an upcoming move.
              </p>
            </SurfaceCard>
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <MessageSquareIcon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Ongoing communication</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                A structured waitlist helps the school follow up with context instead of generic updates.
              </p>
            </SurfaceCard>
            <SurfaceCard className="gap-4 px-6 py-6" interactive>
              <CheckCircle2Icon className="size-5 text-primary" />
              <h3 className="text-2xl text-foreground">Better fit conversations</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Families can share what matters most before deciding whether the right next step is contact, waitlist, or direct enrollment.
              </p>
            </SurfaceCard>
          </div>
        </SectionShell>
      </Reveal>

      <Reveal>
        <SectionShell
          eyebrow="Still have questions?"
          title="A few common ones before families join."
          description="If you need more direct context, contact the school before you decide whether to waitlist or enroll."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {faqPreview.map((item) => (
              <SurfaceCard key={item.question} className="gap-4 px-6 py-6" interactive>
                <h3 className="text-xl text-foreground">{item.question}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </SurfaceCard>
            ))}
          </div>
        </SectionShell>
      </Reveal>

      <CtaBand
        eyebrow="Ready to move faster?"
        title="Create a parent account when you are ready to start enrollment."
        description="Use the waitlist for planning ahead. Use the parent signup flow when you are ready to submit details and payment."
        primaryHref="/signup/parent"
        primaryLabel="Create Parent Account"
        secondaryHref="/contact"
        secondaryLabel="Contact the School"
      />
    </PageShell>
  )
}

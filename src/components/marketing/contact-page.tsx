import Link from "next/link"
import { Clock3Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { ContactForm } from "@/components/marketing/forms/contact-form"
import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { Reveal } from "@/components/shared/reveal"
import { SectionShell } from "@/components/shared/section-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { contactMethods, contactPageContent, faqPreview, marketingMedia } from "@/data/marketing"

const contactIcons = {
  "Call the school": PhoneIcon,
  "Email the team": MailIcon,
  "Visit us": MapPinIcon,
}

export function ContactPage() {
  return (
    <PageShell className="gap-16 pb-16">
      <PageIntro
        eyebrow={contactPageContent.eyebrow}
        title={contactPageContent.title}
        description={contactPageContent.description}
        actions={
          <>
            <Link href="/signup/parent" className={buttonVariants({ variant: "default" })}>
              {brandConfig.primaryCtaLabel}
            </Link>
            <Link href="/waitlist" className={buttonVariants({ variant: "outline" })}>
              Join the Waitlist
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-5">
          <MarketingMediaPanel
            asset={marketingMedia.contactStory}
            className="min-h-[22rem]"
            eyebrow="One clear contact path"
            title="Families usually need one helpful response, not a maze of separate forms."
          />
          <SurfaceCard tone="accent" className="gap-5 px-6 py-6">
            <h2 className="text-3xl text-foreground">Reach the team in the way that fits best.</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Some families want a quick call. Others want to compare programs over email or send a few questions after looking through tuition and program details.
            </p>
            <div className="grid gap-4">
              {contactMethods.map((method) => {
                const Icon = contactIcons[method.label as keyof typeof contactIcons] ?? MailIcon

                return (
                  <a
                    key={method.label}
                    href={method.href}
                    className="surface-panel-quiet row-hover rounded-[1.3rem] px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-muted/80 p-3 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{method.label}</p>
                        <p className="text-sm font-medium text-primary">{method.value}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </SurfaceCard>

          <SurfaceCard className="gap-4 px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-accent/70 p-3 text-primary">
                <Clock3Icon className="size-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl text-foreground">Hours and response expectations</h3>
                <div className="grid gap-2">
                  {contactPageContent.hours.map((item) => (
                    <p key={item} className="text-sm leading-6 text-muted-foreground">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <ContactForm />
      </div>

      <Reveal>
        <SectionShell
          eyebrow="Common questions"
          title="A few of the topics parents ask most often."
          description="If your question falls outside these, the contact form routes it to the right next step."
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
        eyebrow="Prefer a structured next step?"
        title="If you are ready to move, create a parent account and start enrollment."
        description="Contact is best for open questions. Create an account when you want to begin enrollment, or use the waitlist if your timing is still moving."
        primaryHref="/signup/parent"
        primaryLabel={brandConfig.primaryCtaLabel}
        secondaryHref="/waitlist"
        secondaryLabel="Join the Waitlist"
      />
    </PageShell>
  )
}

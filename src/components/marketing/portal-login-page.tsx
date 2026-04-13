import Link from "next/link"
import { LifeBuoyIcon, LockKeyholeIcon, MailIcon } from "lucide-react"

import { MarketingMediaPanel } from "@/components/marketing/sections/marketing-media-panel"
import { AlertBanner } from "@/components/shared/alert-banner"
import { FormSection } from "@/components/shared/form-section"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { marketingMedia } from "@/data/marketing"
import { type SiteMetadata } from "@/types/app"

import { PortalLoginForm } from "./portal-login-form"

type PortalLoginContent = {
  metadata: SiteMetadata
  eyebrow: string
  title: string
  description: string
  highlights: string[]
}

export function PortalLoginPage({
  content,
  portalLabel,
}: {
  content: PortalLoginContent
  portalLabel: string
}) {
  const portalRole = portalLabel.toLowerCase() === "parent" ? "parent" : "admin"
  const supportingCopy =
    portalRole === "parent"
      ? {
          insightTitle: "A small portal is easier to trust and easier to finish.",
          insightDescription:
            "Parents only need the essentials here: account access, enrollment progress, payment status, and receipts.",
          formDescription:
            "Sign in to the parent portal. If you do not have an account yet, create one first and the app will take you straight into enrollment.",
          alertTitle: "Parent accounts can be created directly",
          alertDescription:
            "Parents can sign up, submit enrollment details, and track payment and approval without waiting for a larger dashboard experience.",
        }
      : {
          insightTitle: "Admins only need the review tools that move enrollment forward.",
          insightDescription:
            "This portal is intentionally narrow: review submitted enrollments, check whether payment is complete, and approve manually.",
          formDescription:
            "Sign in to the admin portal to review new submissions. The seeded admin account is ready for local testing.",
          alertTitle: "Admin access stays role-specific",
          alertDescription:
            "The admin side is deliberately small. Use the admin login to review enrollment submissions and payment state in one place.",
        }

  return (
    <PageShell className="gap-14 pb-16">
      <PageIntro eyebrow={content.eyebrow} title={content.title} description={content.description} />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-5">
          <MarketingMediaPanel
            asset={marketingMedia.formStory}
            className="min-h-[22rem]"
            eyebrow={`${portalLabel} access`}
            title="A cleaner sign-in flow keeps the portal feeling like the same product, not a bolted-on screen."
          />
          <SurfaceCard tone="accent" className="gap-5 px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-3xl bg-primary/12 p-3 text-primary">
                <LockKeyholeIcon className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl text-foreground">{supportingCopy.insightTitle}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {supportingCopy.insightDescription}
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {content.highlights.map((highlight) => (
                <div key={highlight} className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {highlight}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`mailto:${brandConfig.supportEmail}`} className={buttonVariants({ variant: "outline" })}>
                <MailIcon data-icon="inline-start" />
                Email support
              </Link>
              <Link href="/" className={buttonVariants({ variant: "ghost" })}>
                <LifeBuoyIcon data-icon="inline-start" />
                Return to the public site
              </Link>
            </div>
          </SurfaceCard>
        </div>

        <FormSection
          title={`${portalLabel} portal login`}
          description={supportingCopy.formDescription}
        >
          <PortalLoginForm portalRole={portalRole} />
        </FormSection>
      </div>

      <AlertBanner
        tone="info"
        title={supportingCopy.alertTitle}
        description={supportingCopy.alertDescription}
      />
    </PageShell>
  )
}

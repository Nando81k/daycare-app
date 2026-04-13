import Link from "next/link"

import { ParentSignUpForm } from "@/components/marketing/parent-sign-up-form"
import { FormSection } from "@/components/shared/form-section"
import { PageIntro } from "@/components/shared/page-intro"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { parentSignUpPageContent } from "@/data/minimal-portal"

export function ParentSignUpPageView() {
  return (
    <PageShell className="gap-12 pb-16">
      <PageIntro
        eyebrow={parentSignUpPageContent.eyebrow}
        title={parentSignUpPageContent.title}
        description={parentSignUpPageContent.description}
      />

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <SurfaceCard tone="accent" className="gap-5 px-6 py-6">
          <div className="space-y-3">
            <p className="editorial-kicker">What this portal covers</p>
            <h2 className="text-3xl text-foreground">A very small parent experience</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              The new parent portal focuses on three things only: finishing enrollment, checking payment status, and seeing whether the center has approved the application.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
              Create your account once, then continue directly into the enrollment form.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
              Payment status and receipts live in one place instead of being spread across multiple dashboard pages.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
              Approval stays visible so families always know whether the center has reviewed the submission.
            </div>
          </div>
          <div>
            <Link href="/login/parent" className={buttonVariants({ variant: "outline" })}>
              Sign in instead
            </Link>
          </div>
        </SurfaceCard>

        <FormSection
          title="Create parent account"
          description="Set up a parent account to submit enrollment details and track payment and approval."
        >
          <ParentSignUpForm />
        </FormSection>
      </div>
    </PageShell>
  )
}

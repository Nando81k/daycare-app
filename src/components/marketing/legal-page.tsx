import type { ReactNode } from "react"

import { brandConfig } from "@/config/brand"
import { PageShell } from "@/components/shared/page-shell"

export type LegalSection = {
  heading: string
  body: ReactNode
}

export function LegalPageView({
  eyebrow,
  title,
  effectiveDate,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  effectiveDate: string
  intro: ReactNode
  sections: LegalSection[]
}) {
  return (
    <PageShell className="gap-10">
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">{title}</h1>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Effective {effectiveDate}
        </p>
        <div className="text-base leading-7 text-muted-foreground">{intro}</div>
      </header>

      <article className="mx-auto w-full max-w-3xl space-y-10">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-heading text-2xl tracking-tight">
              {section.heading}
            </h2>
            <div className="space-y-3 text-base leading-7 text-foreground/85">
              {section.body}
            </div>
          </section>
        ))}

        <section className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-6">
          <h2 className="font-heading text-xl">Contact us</h2>
          <p className="text-base leading-7 text-foreground/85">
            Questions about this policy can be sent to{" "}
            <a
              href={`mailto:${brandConfig.supportEmail}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {brandConfig.supportEmail}
            </a>
            {brandConfig.address ? ` or by post to ${brandConfig.address}.` : "."}
          </p>
        </section>
      </article>
    </PageShell>
  )
}

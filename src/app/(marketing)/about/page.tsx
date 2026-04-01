import { aboutValues, leadershipNotes } from "@/data/marketing"
import { PageIntro } from "@/components/shared/page-intro"
import { SectionShell } from "@/components/shared/section-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="A daycare brand designed around calm care and operational clarity."
        description="Abassadors Care is built for the moments families actually remember: handoff, trust, classroom warmth, and the ease of knowing where everything lives."
      />
      <SectionShell
        title="What guides the center and the product experience."
        description="The design system and the daycare story are aligned on purpose. Families should feel the same steadiness on the website that they feel in the building."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {aboutValues.map((value) => (
            <Card key={value.title} className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle className="font-heading text-2xl tracking-tight">
                  {value.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {value.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
      <SectionShell
        eyebrow="Leadership"
        title="The people behind the daily rhythm."
        description="The admin dashboard is useful because the operations behind it are real: enrollment, staffing, classroom support, and family communication all need clear owners."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {leadershipNotes.map((person) => (
            <div
              key={person.name}
              className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6"
            >
              <p className="font-heading text-2xl tracking-tight text-foreground">
                {person.name}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">{person.title}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{person.bio}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  )
}

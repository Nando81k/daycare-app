import { staffRoster } from "@/data/admin"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { StaffTable } from "@/components/shared/dashboard-tables"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminStaffPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Staff"
        title="Shifts, status, and classroom support."
        description="See who is on site, who has moved, and what certifications or notes matter today."
      />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Staff roster</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffTable />
          </CardContent>
        </Card>
        <Accordion type="single" collapsible className="rounded-[2rem] border border-border/70 bg-card/90 px-6">
          {staffRoster.map((person) => (
            <AccordionItem key={person.name} value={person.name}>
              <AccordionTrigger className="text-left">{person.name}</AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {person.certifications.join(", ")} · {person.note}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

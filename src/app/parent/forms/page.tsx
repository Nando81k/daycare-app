import { parentDocuments } from "@/data/parent"
import { ParentDocumentsTable } from "@/components/shared/dashboard-tables"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParentFormsPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Forms and documents"
        title="Keep enrollment paperwork and health forms organized."
        description="Families can see what is complete, what needs attention, and what is coming up next."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Accordion type="single" collapsible className="rounded-[2rem] border border-border/70 bg-card/90 px-6">
          {parentDocuments.map((document) => (
            <AccordionItem key={document.title} value={document.title}>
              <AccordionTrigger className="text-left">{document.title}</AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {document.category} · Updated {document.updatedAt} · Status: {document.status}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">
              Document tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ParentDocumentsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

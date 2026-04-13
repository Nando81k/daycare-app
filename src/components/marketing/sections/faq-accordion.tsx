import type { FaqGroup } from "@/types/app"

import { SurfaceCard } from "@/components/shared/surface-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export function FaqAccordion({
  groups,
  compact = false,
  minimal = false,
}: {
  groups: FaqGroup[]
  compact?: boolean
  minimal?: boolean
}) {
  return (
    <div className={cn("grid", minimal ? "gap-8" : "gap-5", !minimal && "lg:grid-cols-2")}>
      {groups.map((group) => {
        const inner = (
          <>
            <div className={cn("space-y-1", !minimal && "pb-2")}>
              <h3 className={cn("text-foreground", compact ? "text-lg" : "text-2xl")}>{group.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
            </div>
            <Accordion type="single" collapsible>
              {group.items.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className={minimal ? "border-none" : undefined}
                >
                  <AccordionTrigger className={minimal ? "py-3 text-sm font-medium" : undefined}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )

        if (minimal) {
          return <div key={group.id}>{inner}</div>
        }

        return (
          <SurfaceCard key={group.id} className={cn("gap-0", compact ? "px-5 py-5" : "px-6 py-6")}>
            {inner}
          </SurfaceCard>
        )
      })}
    </div>
  )
}

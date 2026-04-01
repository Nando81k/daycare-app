import type { FAQItem } from "@/lib/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { FAQAnimationWrapper, FAQItemWrapper } from "@/components/marketing/client-faq"

function slugifyQuestion(question: string, index: number) {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

  return slug.length > 0 ? slug : `faq-${index + 1}`
}

export function FaqList({ items }: { items: FAQItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      className="bg-background relative isolate px-6 py-24 lg:px-8"
      aria-labelledby="faq-heading"
      aria-describedby="faq-description"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-48 -z-10 mx-auto max-w-7xl transform-gpu overflow-hidden px-20 blur-3xl md:px-36"
      >
        <svg
          className="text-primary h-full w-full opacity-10"
          viewBox="0 0 188 99"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="38.6201"
            cy="60.4951"
            r="37.5"
            transform="rotate(-178.473 38.6201 60.4951)"
            fill="currentColor"
          />
          <circle cx="173" cy="15" r="15" fill="currentColor" />
          <circle cx="155" cy="30" r="20" fill="currentColor" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-primary text-sm font-semibold uppercase tracking-[0.24em]">
            Questions
          </h2>
          <p
            id="faq-heading"
            className="text-foreground font-heading text-4xl leading-[1.15] tracking-tight text-balance sm:text-5xl"
          >
            Frequently asked questions from parents
          </p>
          <p
            id="faq-description"
            className="text-muted-foreground leading-7 text-pretty sm:max-w-[600px] sm:text-lg"
          >
            Clear answers on updates, tours, tuition, and everyday care details at Abassadors
            Care.
          </p>
        </div>

        <FAQAnimationWrapper>
          <Accordion type="single" collapsible className="w-full" aria-label="Family FAQ">
            {items.map((item, index) => {
              const id = slugifyQuestion(item.question, index)

              return (
                <FAQItemWrapper key={id} isLast={index === items.length - 1}>
                  <AccordionItem value={id} className="border-transparent">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-7 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </FAQItemWrapper>
              )
            })}
          </Accordion>
        </FAQAnimationWrapper>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

export type LandingFaqItem = {
  question: string
  answer: string
}

export function LandingFaq({ items }: { items: LandingFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <ul className="divide-y divide-border/60 border-y border-border/60">
      {items.map((item, index) => {
        const open = openIndex === index
        return (
          <li key={item.question}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`landing-faq-panel-${index}`}
              onClick={() => setOpenIndex(open ? null : index)}
              className="group flex w-full items-start justify-between gap-8 py-6 text-left transition-colors hover:text-accent md:py-8"
            >
              <span className="font-heading text-xl leading-snug text-foreground md:text-2xl">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border/70 text-foreground transition-transform duration-300 ease-out",
                  open && "rotate-45 border-accent text-accent"
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div
              id={`landing-faq-panel-${index}`}
              aria-hidden={!open}
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0">
                <p className="max-w-2xl pb-8 text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

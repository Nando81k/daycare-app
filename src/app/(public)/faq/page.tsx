'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '@/lib/branding';
import { Button, Section } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const FAQS = [
  {
    q: 'How does enrollment start?',
    a: 'Create a parent account, complete child details, and submit your enrollment request from the family dashboard.',
  },
  {
    q: 'Is payment required before approval?',
    a: 'No. Families are not charged at submission. Tuition payment actions begin only after admissions approval.',
  },
  {
    q: 'What information should we prepare?',
    a: 'Prepare birth date, preferred start date, emergency contacts, pickup authorizations, and allergy or medical notes.',
  },
  {
    q: 'How are admissions updates communicated?',
    a: 'Families receive direct status updates and action prompts throughout review and onboarding stages.',
  },
  {
    q: 'Where can we get direct support?',
    a: `Call ${BRAND.phone} or email ${BRAND.email} for admissions support and next-step guidance.`,
  },
] as const;

const HERO = resolveCustomerMediaSlot('faqHero');

export default function FAQPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap">
          <CinematicReveal>
            <p className="tech-kicker">FAQ</p>
            <h1 className="mt-3 max-w-[15ch]">Direct answers for admissions, enrollment, and parent support.</h1>
            <p className="tech-copy max-w-[62ch]">
              Questions are organized for clarity so families can move through enrollment with fewer delays.
            </p>
          </CinematicReveal>

          <CinematicReveal delay={0.06}>
            <div className="tech-shell mt-6 p-3">
              <div className="tech-image-shell aspect-[16/7] min-h-[17rem]">
                <Image
                  src={HERO.media.src}
                  alt={HERO.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: HERO.media.focalPoint }}
                  sizes={HERO.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#4a607a]">{HERO.caption}</p>
            </div>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="tech-section bg-white">
        <div className="tech-wrap">
          <CinematicStagger className="grid gap-3" y={20}>
            {FAQS.map((item, idx) => {
              const isOpen = open === idx;

              return (
                <article key={item.q} className="tech-card overflow-hidden p-0" data-stagger-item>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border-b border-transparent px-5 py-4 text-left hover:bg-[#eef4fb]"
                    onClick={() => setOpen((current) => (current === idx ? -1 : idx))}
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 text-base font-semibold text-[#0f1726]">{item.q}</span>
                    <ChevronDown className={cn('h-4 w-4 text-[#4d617b] transition', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen ? <p className="px-5 pb-5 text-base leading-relaxed text-[#33485f]">{item.a}</p> : null}
                </article>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="tech-section bg-[#eef3f9]">
        <div className="tech-wrap grid gap-4 md:grid-cols-2">
          <CinematicReveal>
            <div className="tech-card h-full">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">
                <MessageSquare className="h-4 w-4" />
                Need support beyond FAQ?
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">
                Admissions can help with placement fit, documentation requirements, and your fastest next action.
              </p>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="tech-card h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">Next Actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/contact">
                  <Button variant="outline" className="rounded-[7px] px-6">
                    Contact Admissions
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-[7px] px-6">Start Enrollment</Button>
                </Link>
              </div>
            </div>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

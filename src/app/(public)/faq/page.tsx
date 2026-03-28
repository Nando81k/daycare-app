'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Card, Section } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/branding';
import { CinematicReveal } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const faqs = [
  {
    q: 'How does enrollment start?',
    a: 'Create a parent account, complete child profile details, and submit your enrollment request from Family Hub.',
  },
  {
    q: 'Do parents pay when submitting an enrollment request?',
    a: 'No. Enrollment request submission does not charge your card. Payment starts only after admissions approval.',
  },
  {
    q: 'What is due when my child is approved?',
    a: 'Seat confirmation includes the registration fee and first tuition cycle according to your selected plan.',
  },
  {
    q: 'Can I choose how often I pay tuition?',
    a: 'Yes. Depending on available plans, you can choose weekly, biweekly, or monthly tuition cadence.',
  },
  {
    q: 'Where can I view invoices and payment history?',
    a: 'In the parent billing center, where due-now totals, invoice status, and payment records are visible.',
  },
  {
    q: 'How do I contact support?',
    a: `Call ${BRAND.phone} or email ${BRAND.email}. Include child age and preferred start period for faster help.`,
  },
] as const;

const HERO = resolveCustomerMediaSlot('faqHero');

export default function FAQPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <Section className="product-stage pb-12 pt-10 md:pt-12">
      <div className="page-wrap">
        <CinematicReveal>
          <p className="kicker">FAQ</p>
          <h1 className="mt-2 max-w-[18ch]">Answers for parents and caregivers.</h1>
          <p className="mt-3 max-w-3xl text-base text-ink-600">
            Quick answers to common questions about programs, enrollment, and family onboarding.
          </p>
        </CinematicReveal>

        <CinematicReveal delay={0.05}>
          <div className="product-card mt-5 p-2.5">
            <div className="public-image-frame aspect-[16/7]">
              <Image
                src={HERO.media.src}
                alt={HERO.media.alt}
                fill
                className="object-cover"
                style={{ objectPosition: HERO.media.focalPoint }}
                sizes={HERO.sizes}
              />
              <div className="public-image-overlay" />
            </div>
            <p className="mt-3 text-sm text-ink-600">{HERO.caption}</p>
          </div>
        </CinematicReveal>

        <div className="mt-5 space-y-3">
          {faqs.map((item, idx) => (
            <CinematicReveal key={item.q} delay={Math.min(0.03 * idx, 0.2)}>
              <Card className="glass-shell overflow-hidden p-0">
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-primary-50/55"
                  onClick={() => setOpen((current) => (current === idx ? -1 : idx))}
                >
                  <span className="text-sm font-semibold text-ink-900">{item.q}</span>
                  <ChevronDown className={cn('h-4 w-4 text-ink-500 transition', open === idx && 'rotate-180')} />
                </button>
                {open === idx ? <p className="px-4 pb-4 text-sm text-ink-600">{item.a}</p> : null}
              </Card>
            </CinematicReveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

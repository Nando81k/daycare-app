import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { SAFETY_STANDARDS } from '@/lib/public-content';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('safetyHero');
const SUPPORT = resolveCustomerMediaSlot('homeSupportBand');

const FAMILY_PREP = [
  'Current allergy and medication instructions',
  'Two reachable emergency contacts with current phone numbers',
  'Authorized pickup list with identity details',
  'Prompt updates when child care notes change',
] as const;

export default function SafetyPage() {
  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <CinematicReveal>
            <p className="tech-kicker">Safety Standards</p>
            <h1 className="mt-3 max-w-[18ch]">Safety practices integrated into every classroom routine.</h1>
            <p className="tech-copy max-w-[62ch]">
              Our systems cover supervision, transitions, communication, and emergency readiness to keep care secure and predictable.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="rounded-[7px] px-8">
                  Start Enrollment
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-[7px] px-8">
                  Contact Admissions
                </Button>
              </Link>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="tech-shell p-3">
              <div className="tech-image-shell aspect-[16/11] min-h-[22rem]">
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
          <CinematicReveal>
            <p className="tech-kicker">Operational Safeguards</p>
            <h2 className="tech-subtitle max-w-[24ch]">Safety execution standards reinforced throughout the day.</h2>
          </CinematicReveal>

          <CinematicStagger className="mt-8 grid gap-4 md:grid-cols-3" y={24}>
            {SAFETY_STANDARDS.map((item) => {
              const Icon = item.icon ?? ShieldCheck;
              return (
                <HoverLift key={item.title} as="article" className="tech-card h-full" data-stagger-item>
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-[#0f1726]">
                    <Icon className="h-4 w-4 text-[#0f4fc9]" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-[#33485f]">{item.summary}</p>
                </HoverLift>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="tech-section bg-[#eef3f9]">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <CinematicReveal>
            <div className="tech-shell p-3">
              <div className="tech-image-shell aspect-[4/5] min-h-[24rem]">
                <Image
                  src={SUPPORT.media.src}
                  alt={SUPPORT.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT.media.focalPoint }}
                  sizes={SUPPORT.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="tech-card">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">
                <ShieldCheck className="h-4 w-4" />
                Family Readiness Checklist
              </p>
              <ul className="mt-4 grid gap-2.5 text-base leading-relaxed text-[#33485f]">
                {FAMILY_PREP.map((item) => (
                  <li key={item} className="inline-flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0f4fc9]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-base leading-relaxed text-[#33485f]">
                Complete family details help staff respond faster and maintain continuity across classrooms.
              </p>
            </div>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

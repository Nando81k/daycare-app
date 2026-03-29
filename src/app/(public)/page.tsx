import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BRAND } from '@/lib/branding';
import {
  HOME_FEATURES,
  HOME_STAFF,
  HOME_TESTIMONIALS,
  HOME_TRUST_PILLS,
  PROGRAM_SNAPSHOT,
  SAFETY_STANDARDS,
} from '@/lib/public-content';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift, ParallaxBlock, SectionMotion } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('homeHero');
const SUPPORT = resolveCustomerMediaSlot('homeSupport');
const FEATURE_A = resolveCustomerMediaSlot('homeFeatureA');
const SUPPORT_BAND = resolveCustomerMediaSlot('homeSupportBand');
const SUPPORT_DETAIL = resolveCustomerMediaSlot('homeSupportDetail');

const JOURNEY = [
  {
    title: 'Create Family Account',
    copy: 'Set up one secure account and enter child details once. We validate key admissions inputs immediately.',
    outcome: 'You receive a clear checklist and status visibility right away.',
  },
  {
    title: 'Admissions Review + Placement',
    copy: 'Our team confirms age-band fit, seat availability, and required records with direct communication.',
    outcome: 'Families receive an explicit decision and practical next actions.',
  },
  {
    title: 'Start-Day Readiness',
    copy: 'Before day one, we align on contacts, pickup permissions, and classroom readiness requirements.',
    outcome: 'Children transition into care with less friction and stronger confidence.',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Section className="tech-section relative !border-none !py-0">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBlock className="absolute inset-0" distance={90}>
            <Image
              src={HERO.media.src}
              alt={HERO.media.alt}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: HERO.media.focalPoint }}
              sizes="100vw"
            />
          </ParallaxBlock>
          <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(7,14,25,0.93)_0%,rgba(11,24,43,0.9)_44%,rgba(14,37,69,0.85)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(118,145,184,0.22)_1px,transparent_1px),linear-gradient(rgba(118,145,184,0.18)_1px,transparent_1px)] bg-[length:58px_58px]" />
        </div>

        <SectionMotion className="tech-wrap relative z-10 grid min-h-[94svh] gap-7 py-16 pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-end" distance={34}>
          <CinematicReveal y={36}>
            <p className="tech-kicker text-[#a9c7ff]">Structured Care Platform</p>
            <h1 className="mt-3 max-w-[13ch] text-[clamp(2.35rem,7vw,5.4rem)] leading-[0.99] text-white">
              Childcare that runs with precision and warmth.
            </h1>
            <p className="mt-5 max-w-[64ch] text-lg leading-relaxed text-[#dbe8ff] md:text-xl">
              {BRAND.name} combines educator-led development, strict operational standards, and direct admissions support so
              families always know what happens next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="rounded-[7px] px-9" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Enrollment
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[7px] border-[#8eb0e2] bg-[#123258]/70 px-9 text-white hover:bg-[#1a3e6a]"
                >
                  Contact Admissions
                </Button>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {HOME_TRUST_PILLS.map((pill) => (
                <span key={pill.title} className="tech-chip tech-chip-dark">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {pill.title}
                </span>
              ))}
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.12} y={28}>
            <HoverLift as="section" className="tech-shell-dark p-3" lift={6} scale={1.01}>
              <div className="tech-image-shell aspect-[16/11] border-[#5078b3]">
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

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="tech-auth-feature px-3 py-2.5">
                  <p className="tech-stat-label text-[#adc8ff]">Avg Response</p>
                  <p className="mt-1 text-base font-semibold text-white">Admissions Same Day</p>
                </div>
                <div className="tech-auth-feature px-3 py-2.5">
                  <p className="tech-stat-label text-[#adc8ff]">Coverage</p>
                  <p className="mt-1 text-base font-semibold text-white">Infant to Pre-K</p>
                </div>
                <div className="tech-auth-feature px-3 py-2.5">
                  <p className="tech-stat-label text-[#adc8ff]">Family Model</p>
                  <p className="mt-1 text-base font-semibold text-white">Clear Weekly Updates</p>
                </div>
              </div>
            </HoverLift>
          </CinematicReveal>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-[#f3f6fa]">
        <SectionMotion className="tech-wrap" delay={0.04}>
          <CinematicReveal>
            <p className="tech-kicker">Why Families Choose Us</p>
            <h2 className="tech-subtitle max-w-[24ch]">Built like a dependable system, delivered with child-centered care.</h2>
            <p className="tech-copy">
              We operate with clear standards across learning, safety, communication, and billing so families feel trust through
              execution, not just promises.
            </p>
          </CinematicReveal>

          <CinematicStagger className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4" y={26}>
            {HOME_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <HoverLift key={item.title} as="article" className="tech-card h-full" lift={6} data-stagger-item>
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-[#0f1726]">
                    {Icon ? <Icon className="h-4 w-4 text-[#0f4fc9]" /> : null}
                    {item.title}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-[#314357]">{item.summary}</p>
                  {item.detail ? <p className="mt-2 text-sm leading-relaxed text-[#41556f]">{item.detail}</p> : null}
                </HoverLift>
              );
            })}
          </CinematicStagger>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-white">
        <SectionMotion className="tech-wrap grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-end" delay={0.05}>
          <div>
            <CinematicReveal>
              <p className="tech-kicker">Programs Matrix</p>
              <h2 className="tech-subtitle max-w-[23ch]">Age-banded classrooms with a consistent daily operating rhythm.</h2>
            </CinematicReveal>

            <CinematicStagger className="mt-7 grid gap-3" y={20}>
              {PROGRAM_SNAPSHOT.map((program) => (
                <HoverLift key={program.title} as="article" className="tech-card" data-stagger-item>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2c4d78]">{program.title}</p>
                  <p className="mt-2 text-base leading-relaxed text-[#314357]">{program.summary}</p>
                </HoverLift>
              ))}
            </CinematicStagger>
          </div>

          <CinematicReveal delay={0.08}>
            <div className="tech-image-shell aspect-[4/3]">
              <Image
                src={FEATURE_A.media.src}
                alt={FEATURE_A.media.alt}
                fill
                className="object-cover"
                style={{ objectPosition: FEATURE_A.media.focalPoint }}
                sizes={FEATURE_A.sizes}
              />
              <div className="tech-image-overlay" />
            </div>
          </CinematicReveal>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-[linear-gradient(160deg,#0d1b32_0%,#112542_42%,#17325a_100%)] text-white">
        <SectionMotion className="tech-wrap grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center" delay={0.05}>
          <CinematicReveal>
            <p className="tech-kicker text-[#a8c8ff]">Safety + Care Protocols</p>
            <h2 className="mt-3 max-w-[20ch] text-white">Operational safeguards embedded into each part of the day.</h2>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-[#cfe1ff]">
              Safety is handled as a repeatable operating standard from arrival through pickup. Families receive clear expectations,
              clear contacts, and clear escalation paths.
            </p>

            <div className="mt-6 grid gap-3">
              {SAFETY_STANDARDS.map((standard) => {
                const Icon = standard.icon ?? ShieldCheck;
                return (
                  <div key={standard.title} className="tech-card-dark px-4 py-3">
                    <p className="inline-flex items-center gap-2 text-base font-semibold text-white">
                      <Icon className="h-4 w-4 text-[#9dc1ff]" />
                      {standard.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#c6daf9]">{standard.summary}</p>
                  </div>
                );
              })}
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.1}>
            <div className="tech-shell-dark p-3">
              <div className="tech-image-shell aspect-[4/5] border-[#4f76ae]">
                <Image
                  src={SUPPORT_BAND.media.src}
                  alt={SUPPORT_BAND.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT_BAND.media.focalPoint }}
                  sizes={SUPPORT_BAND.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
            </div>
          </CinematicReveal>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-[#f3f6fa]">
        <SectionMotion className="tech-wrap grid gap-6 lg:grid-cols-2" delay={0.05}>
          <div>
            <CinematicReveal>
              <p className="tech-kicker">Parent Testimonials</p>
              <h2 className="tech-subtitle max-w-[21ch]">Families describe a calm, reliable, high-standard experience.</h2>
            </CinematicReveal>
            <CinematicStagger className="mt-7 grid gap-4" y={20}>
              {HOME_TESTIMONIALS.map((item) => (
                <HoverLift key={item.parentName} as="article" className="tech-card h-full" data-stagger-item>
                  <p className="text-base leading-relaxed text-[#273a51]">“{item.quote}”</p>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#1e3c63]">{item.parentName}</p>
                  <p className="text-sm text-[#4a607a]">{item.childContext}</p>
                </HoverLift>
              ))}
            </CinematicStagger>
          </div>

          <div>
            <CinematicReveal>
              <p className="tech-kicker">Educator Spotlight</p>
              <h2 className="tech-subtitle max-w-[22ch]">Experienced educators who keep standards consistent across classrooms.</h2>
            </CinematicReveal>
            <CinematicStagger className="mt-7 grid gap-4" y={22}>
              {HOME_STAFF.map((staff) => (
                <HoverLift key={staff.name} as="article" className="tech-card h-full" data-stagger-item>
                  <p className="text-lg font-semibold text-[#0f1726]">{staff.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">{staff.role}</p>
                  <p className="mt-2 text-sm font-semibold text-[#1f3858]">Focus: {staff.focus}</p>
                  <p className="mt-2 text-base leading-relaxed text-[#33485f]">{staff.bio}</p>
                </HoverLift>
              ))}
            </CinematicStagger>
          </div>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-white">
        <SectionMotion className="tech-wrap" delay={0.06}>
          <CinematicReveal>
            <p className="tech-kicker">Enrollment Journey</p>
            <h2 className="tech-subtitle max-w-[24ch]">Three clear stages with explicit actions and outcomes for families.</h2>
            <p className="tech-copy">
              Admissions is intentionally simple and transparent: submit details, receive review feedback, and prepare for day one.
            </p>
          </CinematicReveal>

          <CinematicStagger className="mt-8 grid gap-4 lg:grid-cols-3" y={24}>
            {JOURNEY.map((step, idx) => (
              <HoverLift key={step.title} as="article" className="tech-card h-full" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#205aa8]">
                  <CalendarClock className="h-4 w-4" />
                  Stage {idx + 1}
                </p>
                <p className="mt-2 text-xl font-semibold text-[#0f1726]">{step.title}</p>
                <p className="mt-2 text-base leading-relaxed text-[#33485f]">{step.copy}</p>
                <p className="mt-3 border border-[#c6d5ea] bg-[#edf3fc] px-3 py-2 text-sm leading-relaxed text-[#1f3858]">
                  <span className="font-semibold">Outcome:</span> {step.outcome}
                </p>
              </HoverLift>
            ))}
          </CinematicStagger>
        </SectionMotion>
      </Section>

      <Section className="tech-section overflow-hidden bg-[linear-gradient(158deg,#0f1d34_0%,#14305a_55%,#1a4276_100%)] !py-0 text-white">
        <SectionMotion className="tech-wrap grid gap-7 py-12 md:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center" delay={0.06}>
          <CinematicReveal>
            <p className="tech-kicker text-[#a8c8ff]">Ready to begin?</p>
            <h2 className="mt-3 max-w-[17ch] text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] text-white">
              Start enrollment with {BRAND.name}.
            </h2>
            <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-[#d2e4ff]">
              We guide your family from account setup to placement confirmation with practical support at each step.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="rounded-[7px] px-10">
                  Start Enrollment
                </Button>
              </Link>
              <Link href="/contact" className="tech-link text-[#d7e6ff] hover:text-white">
                Contact Admissions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 text-sm text-[#b8cff2]">
              <Sparkles className="h-4 w-4" />
              Open {BRAND.hours}. Ages 6 weeks to 5 years.
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.1}>
            <div className="tech-shell-dark p-3">
              <div className="tech-image-shell aspect-[16/10] border-[#4e75ac]">
                <Image
                  src={SUPPORT_DETAIL.media.src}
                  alt={SUPPORT_DETAIL.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT_DETAIL.media.focalPoint }}
                  sizes={SUPPORT_DETAIL.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <span className="tech-chip tech-chip-dark">Fast admissions support</span>
                <span className="tech-chip tech-chip-dark">Transparent parent communication</span>
                <span className="tech-chip tech-chip-dark">Reliable operational standards</span>
                <span className="tech-chip tech-chip-dark">Structured onboarding flow</span>
              </div>
            </div>
          </CinematicReveal>
        </SectionMotion>
      </Section>

      <Section className="tech-section bg-[#eef3f9] !py-12">
        <SectionMotion className="tech-wrap grid gap-4 md:grid-cols-2" delay={0.05}>
          <CinematicReveal>
            <div className="tech-card h-full">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#205aa8]">
                <MessageSquare className="h-4 w-4" />
                Admissions Guidance
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">
                Need help with documents, start dates, or program fit? We can walk you through the exact next steps.
              </p>
              <a href={`mailto:${BRAND.email}`} className="tech-link mt-4">
                {BRAND.email}
              </a>
            </div>
          </CinematicReveal>
          <CinematicReveal delay={0.08}>
            <div className="tech-card h-full">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#205aa8]">
                <ShieldCheck className="h-4 w-4" />
                Family Readiness
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">
                Keep emergency contacts and health notes current so classroom transitions and first-day support remain smooth.
              </p>
              <a href={BRAND.phoneHref} className="tech-link mt-4">
                {BRAND.phone}
              </a>
            </div>
          </CinematicReveal>
        </SectionMotion>
      </Section>
    </>
  );
}

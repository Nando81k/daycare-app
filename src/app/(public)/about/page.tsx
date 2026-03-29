import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Sparkles, Users2 } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { HOME_STAFF } from '@/lib/public-content';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('aboutHero');
const SUPPORT = resolveCustomerMediaSlot('homeSupportDetail');

const PRINCIPLES = [
  {
    title: 'Operational consistency',
    copy: 'Families receive predictable processes from first inquiry to first-day transition.',
    icon: ShieldCheck,
  },
  {
    title: 'Warm educator leadership',
    copy: 'Children are supported through structured routines that still feel human and responsive.',
    icon: Users2,
  },
  {
    title: 'Transparent communication',
    copy: 'Admissions, onboarding, and daily expectations are communicated with clear ownership.',
    icon: Sparkles,
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
          <CinematicReveal>
            <p className="tech-kicker">About {BRAND.shortName}</p>
            <h1 className="mt-3 max-w-[15ch]">A high-trust childcare environment designed around execution quality.</h1>
            <p className="tech-copy max-w-[62ch]">
              Our approach combines educator excellence, operational discipline, and parent communication standards so families
              experience reliable support at every stage.
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
            </div>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="tech-section bg-white">
        <div className="tech-wrap">
          <CinematicReveal>
            <p className="tech-kicker">Operating Principles</p>
            <h2 className="tech-subtitle max-w-[24ch]">How we turn care standards into daily practice.</h2>
          </CinematicReveal>

          <CinematicStagger className="mt-8 grid gap-4 md:grid-cols-3" y={24}>
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <HoverLift key={item.title} as="article" className="tech-card h-full" data-stagger-item>
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-[#0f1726]">
                    <Icon className="h-4 w-4 text-[#0f4fc9]" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-[#33485f]">{item.copy}</p>
                </HoverLift>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="tech-section bg-[#f0f4fa]">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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

          <div>
            <CinematicReveal>
              <p className="tech-kicker">Educator Quality</p>
              <h2 className="tech-subtitle max-w-[24ch]">A team focused on child development and dependable family support.</h2>
            </CinematicReveal>

            <CinematicStagger className="mt-7 grid gap-4" y={22}>
              {HOME_STAFF.map((staff) => (
                <HoverLift key={staff.name} as="article" className="tech-card h-full" data-stagger-item>
                  <p className="text-lg font-semibold text-[#0f1726]">{staff.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">{staff.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#33485f]">{staff.bio}</p>
                </HoverLift>
              ))}
            </CinematicStagger>
          </div>
        </div>
      </Section>

      <Section className="tech-section bg-[linear-gradient(162deg,#0f1c32_0%,#142f56_56%,#1a4174_100%)] text-white">
        <div className="tech-wrap">
          <CinematicReveal>
            <div className="tech-shell-dark p-6 md:p-8">
              <p className="tech-kicker text-[#a8c8ff]">First Month Roadmap</p>
              <h2 className="mt-3 max-w-[21ch] text-white">Structured onboarding with clear milestones for families.</h2>
              <ul className="mt-5 grid gap-2.5 text-base leading-relaxed text-[#d3e4ff]">
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  Parent account setup and child information completion.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  Admissions validation of records and start readiness.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  Placement confirmation and day-one preparation guidance.
                </li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="rounded-[7px] px-9">
                    Start Enrollment
                  </Button>
                </Link>
                <Link href="/contact" className="tech-link text-[#d6e6ff] hover:text-white">
                  Contact Admissions
                </Link>
              </div>
            </div>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

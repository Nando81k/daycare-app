import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { PROGRAM_SNAPSHOT } from '@/lib/public-content';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('programsHero');
const SUPPORT = resolveCustomerMediaSlot('homeFeatureB');

const DAILY_RHYTHM = [
  'Arrival transition with guided classroom start',
  'Learning block focused on language and foundational skills',
  'Movement and social collaboration windows',
  'Meals, hygiene cycles, and rest support',
  'End-of-day updates and supervised family handoff',
] as const;

export default function ProgramsPage() {
  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
          <CinematicReveal>
            <p className="tech-kicker">Programs</p>
            <h1 className="mt-3 max-w-[16ch]">Program tracks designed around age-specific development milestones.</h1>
            <p className="tech-copy max-w-[62ch]">
              Each classroom applies a consistent operating rhythm while adjusting activities and expectations by age band.
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
            <p className="tech-kicker">Program Matrix</p>
            <h2 className="tech-subtitle max-w-[23ch]">Clear stage placement from infant care through Pre-K readiness.</h2>
          </CinematicReveal>

          <CinematicStagger className="mt-8 grid gap-4 md:grid-cols-2" y={24}>
            {PROGRAM_SNAPSHOT.map((program) => (
              <HoverLift key={program.title} as="article" className="tech-card h-full" data-stagger-item>
                <p className="text-sm font-semibold uppercase tracking-[0.13em] text-[#1f5ab2]">{program.title}</p>
                <p className="mt-2 text-base leading-relaxed text-[#33485f]">{program.summary}</p>
              </HoverLift>
            ))}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="tech-section bg-[#eef3f9]">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <CinematicReveal>
            <div className="tech-card">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">
                <Clock3 className="h-4 w-4" />
                Daily Classroom Structure
              </p>
              <ul className="mt-4 grid gap-2.5 text-base leading-relaxed text-[#33485f]">
                {DAILY_RHYTHM.map((item) => (
                  <li key={item} className="inline-flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0f4fc9]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-base leading-relaxed text-[#33485f]">
                Families receive expectations for supplies, transitions, and classroom norms before enrollment is finalized.
              </p>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
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
        </div>
      </Section>
    </>
  );
}

import Image from 'next/image';
import { Badge, Card, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const programs = [
  {
    title: 'Infant Care',
    age: '6 weeks - 12 months',
    ratio: '1:3',
    focus: 'Attachment, sensory exploration, feeding consistency, and supervised rest.',
  },
  {
    title: 'Toddler Care',
    age: '12 months - 3 years',
    ratio: '1:4',
    focus: 'Language growth, routines, social-emotional learning, and guided discovery.',
  },
  {
    title: 'Preschool',
    age: '3 - 4 years',
    ratio: '1:6',
    focus: 'Early literacy, numeracy, creative expression, and classroom collaboration.',
  },
  {
    title: 'Pre-K',
    age: '4 - 5 years',
    ratio: '1:8',
    focus: 'Kindergarten readiness, independence, and confidence-building routines.',
  },
] as const;

const HERO = resolveCustomerMediaSlot('programsHero');
const SUPPORT = resolveCustomerMediaSlot('homeFeatureB');

export default function ProgramsPage() {
  return (
    <>
      <Section className="product-stage pb-10 pt-10 md:pt-12">
        <div className="page-wrap">
          <CinematicReveal>
            <p className="kicker">Programs</p>
            <h1 className="mt-2 max-w-[18ch]">Age-based classrooms with clear daily structure.</h1>
            <p className="mt-3 max-w-3xl text-base text-ink-600">
              Every program balances care, learning, and play while maintaining strong supervision and communication.
            </p>
          </CinematicReveal>

          <CinematicReveal delay={0.06}>
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

          <CinematicStagger className="mt-5 grid gap-4 md:grid-cols-2">
            {programs.map((program) => (
              <Card key={program.title} title={program.title} subtitle={program.age} className="glass-shell" data-stagger-item>
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-600">
                  <Badge variant="info">Ratio {program.ratio}</Badge>
                  <span>Full-day schedule</span>
                </div>
                <p className="mt-3 text-sm text-ink-600">{program.focus}</p>
              </Card>
            ))}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap grid items-center gap-5 lg:grid-cols-[1fr_0.85fr]">
          <CinematicReveal>
            <Card title="Daily classroom rhythm" className="glass-soft">
              <ul className="space-y-1.5 text-sm text-ink-700">
                <li>1. Arrival and transition routine</li>
                <li>2. Guided learning block and hands-on activities</li>
                <li>3. Meals, social play, and movement periods</li>
                <li>4. Rest, reflection, and family handoff</li>
              </ul>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="product-card p-2.5">
              <div className="public-image-frame aspect-[3/4]">
                <Image
                  src={SUPPORT.media.src}
                  alt={SUPPORT.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT.media.focalPoint }}
                  sizes={SUPPORT.sizes}
                />
                <div className="public-image-overlay" />
              </div>
            </div>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

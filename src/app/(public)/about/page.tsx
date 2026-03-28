import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { Button, Card, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const PRINCIPLES = [
  {
    title: 'Warm, structured care',
    description: 'Age-appropriate routines balance social development, learning, rest, and play.',
    icon: HeartHandshake,
  },
  {
    title: 'Safety-first operations',
    description: 'Documented wellness checks, controlled transitions, and family communication protocols.',
    icon: ShieldCheck,
  },
  {
    title: 'Predictable billing',
    description: 'Parents always know what is due now, what is due next, and what actions are required.',
    icon: Wallet,
  },
] as const;

const HERO = resolveCustomerMediaSlot('aboutHero');

export default function AboutPage() {
  return (
    <>
      <Section className="product-stage pb-10 pt-10 md:pt-12">
        <div className="page-wrap grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <CinematicReveal>
            <Card className="glass-shell">
              <p className="product-eyebrow">About {BRAND.shortName}</p>
              <h1 className="mt-2 max-w-[17ch]">Professional childcare with clear standards and clear communication.</h1>
              <p className="mt-3 text-base text-ink-600">
                We design each family touchpoint to be simple, respectful, and consistent from enrollment through daily
                classroom life.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/register">
                  <Button>Start Enrollment</Button>
                </Link>
                <Link href="/programs">
                  <Button variant="outline">View Programs</Button>
                </Link>
              </div>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <Card className="glass-shell p-2.5">
              <div className="public-image-frame aspect-[4/3]">
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
            </Card>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap">
          <CinematicReveal>
            <p className="kicker">Our Principles</p>
            <h2 className="mt-2">How we build trust with families.</h2>
          </CinematicReveal>

          <CinematicStagger className="mt-5 grid gap-3 md:grid-cols-3">
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="glass-soft" data-stagger-item>
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-ink-900">
                    <Icon className="h-4 w-4 text-primary-700" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-ink-600">{item.description}</p>
                </Card>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="py-12">
        <div className="page-wrap grid gap-4 lg:grid-cols-2">
          <CinematicReveal>
            <Card title="Your first 30 days" subtitle="What onboarding looks like" className="glass-shell">
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Parent account setup and child profile completion.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Admissions review with clear status updates.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Placement confirmation and pre-start guidance.
                </li>
              </ul>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <Card className="glass-shell" title="Communication and support" subtitle="How we keep families in sync">
              <ul className="space-y-2 text-sm text-ink-700">
                <li>1. Transparent updates for enrollment and billing milestones.</li>
                <li>2. Responsive admissions and family support channels.</li>
                <li>3. Clear policy communication without ambiguity.</li>
              </ul>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800">
                <Sparkles className="h-3.5 w-3.5" />
                Family-first by design
              </div>
            </Card>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

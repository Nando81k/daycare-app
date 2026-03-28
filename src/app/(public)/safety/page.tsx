import Image from 'next/image';
import { AlertTriangle, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';
import { Card, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('safetyHero');
const SUPPORT = resolveCustomerMediaSlot('homeFeatureA');

export default function SafetyPage() {
  return (
    <>
      <Section className="product-stage pb-10 pt-10 md:pt-12">
        <div className="page-wrap grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <CinematicReveal>
            <div>
              <p className="kicker">Safety</p>
              <h1 className="mt-2 max-w-[20ch]">Child safety standards embedded in every routine.</h1>
              <p className="mt-3 max-w-3xl text-base text-ink-600">
                Our team follows consistent procedures for wellness, supervision, family communication, and emergency
                readiness.
              </p>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.07}>
            <div className="product-card p-2.5">
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
            </div>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap">
          <CinematicStagger className="grid gap-4 md:grid-cols-2">
            <Card title="Daily safeguards" className="glass-shell" data-stagger-item>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>1. Arrival wellness checks and illness policy enforcement.</li>
                <li>2. Frequent handwashing and classroom sanitation protocols.</li>
                <li>3. Supervised transitions across classrooms and activity spaces.</li>
                <li>4. Controlled pickup with authorized-contact verification.</li>
              </ul>
            </Card>
            <Card title="Staff and facility standards" className="glass-shell" data-stagger-item>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>1. Background-checked educators with required certifications.</li>
                <li>2. Classroom supervision aligned to age-group ratios.</li>
                <li>3. Emergency drills and incident documentation procedures.</li>
                <li>4. Clear escalation protocols for urgent family communication.</li>
              </ul>
            </Card>
          </CinematicStagger>
        </div>
      </Section>

      <Section className="py-12">
        <div className="page-wrap grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <CinematicStagger className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            <Card className="glass-soft" data-stagger-item>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Stethoscope className="h-4 w-4 text-primary-700" />
                Medication and allergies
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Child-specific medication and allergy instructions are reviewed before attendance.
              </p>
            </Card>

            <Card className="glass-soft" data-stagger-item>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                <UserCheck className="h-4 w-4 text-primary-700" />
                Authorized pickup
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Parents designate pickup contacts in advance, and staff verifies each departure handoff.
              </p>
            </Card>

            <Card className="glass-soft" data-stagger-item>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                <AlertTriangle className="h-4 w-4 text-primary-700" />
                Emergency readiness
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Emergency response steps are practiced and documented with parent communication prioritized.
              </p>
            </Card>
          </CinematicStagger>

          <CinematicReveal delay={0.08}>
            <Card title="What families should prepare" subtitle="To keep safety plans complete and current" className="glass-shell">
              <div className="public-image-frame mb-3 aspect-[16/10]">
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
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="inline-flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary-700" />
                  Current child health, allergy, and medication information.
                </li>
                <li className="inline-flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary-700" />
                  Accurate emergency contacts and authorized pickup list.
                </li>
                <li className="inline-flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary-700" />
                  Prompt updates when health status or care instructions change.
                </li>
              </ul>
            </Card>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

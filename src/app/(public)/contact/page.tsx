import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { Button, Card, Section } from '@/components/ui';
import { CinematicReveal } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('contactHero');

export default function ContactPage() {
  return (
    <>
      <Section className="product-stage pb-10 pt-10 md:pt-12">
        <div className="page-wrap grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <CinematicReveal>
            <Card className="glass-shell">
              <p className="kicker">Contact</p>
              <h1 className="mt-2 max-w-[18ch]">Talk with admissions and family support.</h1>
              <p className="mt-3 text-base text-ink-600">
                We help families with enrollment planning, program fit, and onboarding timelines.
              </p>

              <div className="mt-5 space-y-3 text-sm text-ink-700">
                <p className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary-700" />
                  {BRAND.addressLine1}, {BRAND.addressLine2}
                </p>
                <p className="inline-flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary-700" />
                  {BRAND.hours}
                </p>
                <p>
                  <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 text-ink-700 hover:text-ink-900">
                    <Phone className="h-4 w-4 text-primary-700" />
                    {BRAND.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-2 text-ink-700 hover:text-ink-900">
                    <Mail className="h-4 w-4 text-primary-700" />
                    {BRAND.email}
                  </a>
                </p>
              </div>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <Card title="Plan Your Visit" subtitle="Talk with admissions and choose your next step." className="glass-shell p-2.5">
              <div className="public-image-frame mb-3 aspect-[16/10]">
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
              <p className="text-sm text-ink-600">{HERO.caption}</p>
              <div className="mt-4">
                <Link href="/register">
                  <Button size="lg" className="px-9">
                    Start Enrollment
                  </Button>
                </Link>
              </div>
            </Card>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap grid gap-4 lg:grid-cols-2">
          <CinematicReveal>
            <Card title="For faster support, include" className="glass-soft">
              <ul className="space-y-2 text-sm text-ink-700">
                <li>1. Parent full name and best callback number.</li>
                <li>2. Child age and preferred start period.</li>
                <li>3. Program interest and schedule preference.</li>
                <li>4. Any allergy, medication, or support considerations.</li>
              </ul>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <Card title="Common reasons families contact us" className="glass-soft">
              <ul className="space-y-2 text-sm text-ink-700">
                <li>1. Program and classroom placement questions.</li>
                <li>2. Enrollment status and expected timelines.</li>
                <li>3. Required documents before first day.</li>
                <li>4. Parent portal and billing support.</li>
              </ul>
            </Card>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

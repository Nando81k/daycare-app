import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const HERO = resolveCustomerMediaSlot('contactHero');

const SUPPORT_DETAILS = [
  'Parent full name and best callback number',
  'Child age and preferred start period',
  'Program interest and schedule preference',
  'Allergy, medication, or support notes',
] as const;

export default function ContactPage() {
  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
          <CinematicReveal>
            <p className="tech-kicker">Contact Admissions</p>
            <h1 className="mt-3 max-w-[16ch]">Get direct support for enrollment and placement decisions.</h1>
            <p className="tech-copy max-w-[62ch]">
              We can guide program fit, required records, timelines, and next actions for your family.
            </p>

            <div className="mt-6 grid gap-2.5 text-base text-[#33485f]">
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-[#0f4fc9]" />
                {BRAND.addressLine1}, {BRAND.addressLine2}
              </p>
              <p className="inline-flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 text-[#0f4fc9]" />
                {BRAND.hours}
              </p>
              <p>
                <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 text-[#33485f] hover:text-[#0f1726]">
                  <Phone className="h-4 w-4 text-[#0f4fc9]" />
                  {BRAND.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-2 text-[#33485f] hover:text-[#0f1726]">
                  <Mail className="h-4 w-4 text-[#0f4fc9]" />
                  {BRAND.email}
                </a>
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="rounded-[7px] px-8">
                  Start Enrollment
                </Button>
              </Link>
              <a href={BRAND.phoneHref}>
                <Button size="lg" variant="outline" className="rounded-[7px] px-8">
                  Call Admissions
                </Button>
              </a>
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
        <div className="tech-wrap grid gap-4 md:grid-cols-2">
          <CinematicReveal>
            <HoverLift className="tech-card h-full" as="section" data-stagger-item>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">For Faster Support Include</p>
              <ul className="mt-3 space-y-2 text-base leading-relaxed text-[#33485f]">
                {SUPPORT_DETAILS.map((item, idx) => (
                  <li key={item}>{idx + 1}. {item}</li>
                ))}
              </ul>
            </HoverLift>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <HoverLift className="tech-card h-full" as="section" data-stagger-item>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">Common Questions</p>
              <ul className="mt-3 space-y-2 text-base leading-relaxed text-[#33485f]">
                <li>1. Program placement and current seat availability</li>
                <li>2. Required records before first day</li>
                <li>3. Enrollment status and expected response times</li>
                <li>4. Tuition steps after admissions approval</li>
              </ul>
            </HoverLift>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="tech-section bg-[#eef3f9]">
        <div className="tech-wrap">
          <CinematicStagger className="grid gap-4 lg:grid-cols-3" y={22}>
            <HoverLift className="tech-card" as="article" data-stagger-item>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">Call</p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">Speak directly with admissions for immediate guidance.</p>
              <a href={BRAND.phoneHref} className="tech-link mt-4">
                {BRAND.phone}
              </a>
            </HoverLift>

            <HoverLift className="tech-card" as="article" data-stagger-item>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">Email</p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">
                Send your child age and preferred start timing for faster response.
              </p>
              <a href={`mailto:${BRAND.email}`} className="tech-link mt-4">
                {BRAND.email}
              </a>
            </HoverLift>

            <HoverLift className="tech-card" as="article" data-stagger-item>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">Enroll</p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">Ready to proceed? Create your account and submit enrollment details.</p>
              <Link href="/register" className="tech-link mt-4">
                Start Enrollment
              </Link>
            </HoverLift>
          </CinematicStagger>
        </div>
      </Section>
    </>
  );
}

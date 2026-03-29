import Image from 'next/image';
import Link from 'next/link';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift } from '@/components/animations';
import { CUSTOMER_MEDIA_ASSETS, CUSTOMER_MEDIA_GALLERY_ORDER, resolveCustomerMediaSlot } from '@/lib/public-media';

const LEAD = resolveCustomerMediaSlot('galleryLead');

const FILTER_LABELS = ['All Moments', 'Teacher-Guided', 'Independent Learning', 'Classroom Collaboration'] as const;

export default function GalleryPage() {
  return (
    <>
      <Section className="tech-section !border-none bg-[#f3f6fa] pb-12 pt-10 md:pt-14">
        <div className="tech-wrap">
          <CinematicReveal>
            <p className="tech-kicker">Gallery</p>
            <h1 className="mt-3 max-w-[15ch]">A close look at classroom routines and learning moments.</h1>
            <p className="tech-copy max-w-[62ch]">
              Visual snapshots of teacher-led instruction, group collaboration, and structured day-to-day classroom flow.
            </p>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="tech-shell mt-6 p-3">
              <div className="tech-image-shell aspect-[16/7] min-h-[18rem]">
                <Image
                  src={LEAD.media.src}
                  alt={LEAD.media.alt}
                  fill
                  priority
                  className="object-cover"
                  style={{ objectPosition: LEAD.media.focalPoint }}
                  sizes={LEAD.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#4a607a]">{LEAD.caption}</p>
            </div>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="tech-section bg-white">
        <div className="tech-wrap">
          <CinematicReveal>
            <p className="tech-kicker">View Groups</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FILTER_LABELS.map((label, idx) => (
                <span key={label} className={idx === 0 ? 'tech-chip border-[#9db9ec] bg-[#e9f0fb] text-[#0f4fc9]' : 'tech-chip'}>
                  {label}
                </span>
              ))}
            </div>
          </CinematicReveal>

          <CinematicStagger className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" y={24}>
            {CUSTOMER_MEDIA_GALLERY_ORDER.map((key) => {
              const media = CUSTOMER_MEDIA_ASSETS[key];
              const aspect = media.orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]';

              return (
                <HoverLift key={media.id} as="article" className="tech-card h-full p-2.5" data-stagger-item>
                  <div className={`tech-image-shell ${aspect}`}>
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      className="object-cover"
                      style={{ objectPosition: media.focalPoint }}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="tech-image-overlay" />
                  </div>
                </HoverLift>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="tech-section bg-[#eef3f9]">
        <div className="tech-wrap grid gap-4 md:grid-cols-2">
          <CinematicReveal>
            <div className="tech-card h-full">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">
                <CheckCircle2 className="h-4 w-4" />
                What Families Can Observe
              </p>
              <ul className="mt-3 grid gap-2 text-base leading-relaxed text-[#33485f]">
                <li>1. Educator interaction style and supervision quality.</li>
                <li>2. Balance between guided learning and collaborative play.</li>
                <li>3. Classroom organization and child engagement patterns.</li>
              </ul>
            </div>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <div className="tech-card h-full">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f5ab2]">
                <Camera className="h-4 w-4" />
                Need Program-Specific Details?
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">
                Contact admissions for age-band placement guidance and current classroom availability.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/contact">
                  <Button variant="outline" className="rounded-[7px] px-6">
                    Contact Admissions
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-[7px] px-6">Start Enrollment</Button>
                </Link>
              </div>
            </div>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

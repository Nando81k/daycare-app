import Image from 'next/image';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Card, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { CUSTOMER_MEDIA_ASSETS, CUSTOMER_MEDIA_GALLERY_ORDER, resolveCustomerMediaSlot } from '@/lib/public-media';

const LEAD = resolveCustomerMediaSlot('galleryLead');

export default function GalleryPage() {
  return (
    <>
      <Section className="product-stage pb-10 pt-10 md:pt-12">
        <div className="page-wrap">
          <CinematicReveal>
            <p className="kicker">Gallery</p>
            <h1 className="mt-2 max-w-[20ch]">Inside our classroom environment.</h1>
            <p className="mt-3 max-w-3xl text-base text-ink-600">
              A direct look at how children learn, play, and grow in our daily routines.
            </p>
          </CinematicReveal>

          <CinematicReveal delay={0.06}>
            <div className="product-card mt-5 p-2.5">
              <div className="public-image-frame aspect-[16/7]">
                <Image
                  src={LEAD.media.src}
                  alt={LEAD.media.alt}
                  fill
                  priority
                  className="object-cover"
                  style={{ objectPosition: LEAD.media.focalPoint }}
                  sizes={LEAD.sizes}
                />
                <div className="public-image-overlay" />
              </div>
            </div>
          </CinematicReveal>

          <CinematicStagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CUSTOMER_MEDIA_GALLERY_ORDER.map((key) => {
              const media = CUSTOMER_MEDIA_ASSETS[key];
              const isLandscape = media.orientation === 'landscape';

              return (
                <Card key={media.id} className="glass-shell overflow-hidden p-2" data-stagger-item>
                  <div className={isLandscape ? 'public-image-frame aspect-[4/3]' : 'public-image-frame aspect-[3/4]'}>
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      className="object-cover"
                      style={{ objectPosition: media.focalPoint }}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="public-image-overlay" />
                  </div>
                </Card>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap grid gap-4 md:grid-cols-2">
          <CinematicReveal>
            <Card title="What parents can evaluate" className="glass-soft">
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Classroom supervision and educator interaction quality.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Balance between structured learning and active play.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-700" />
                  Learning environment tone, organization, and child engagement.
                </li>
              </ul>
            </Card>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <Card className="glass-soft">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Camera className="h-4 w-4 text-primary-700" />
                Need classroom details by age?
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Contact admissions for current classroom availability and program placement guidance.
              </p>
            </Card>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

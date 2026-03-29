import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { PUBLIC_NAV_ITEMS } from '@/lib/public-content';
import { buttonStyles } from '@/components/ui';
import { BrandLockup } from '@/components/brand';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#29415f] bg-[#0d1626] text-white">
      <div className="tech-wrap py-12">
        <div className="grid gap-8 border border-[#28456a] bg-[linear-gradient(160deg,rgba(14,27,47,0.98),rgba(15,31,55,0.96))] p-6 md:p-8 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BrandLockup tone="inverse" showTagline={false} />
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-[#c9daf5] sm:text-base">
              Structured childcare operations with clear admissions guidance, dependable safety standards, and strong parent
              communication.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="tech-chip tech-chip-dark">Ages 6 Weeks - 5 Years</span>
              <span className="tech-chip tech-chip-dark">Mon - Fri Full Day</span>
            </div>
          </div>

          <div>
            <p className="tech-divider-label text-[#a8c8ff]">Navigation</p>
            <nav className="mt-4 grid gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#d4e4ff]">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="w-fit transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="tech-divider-label text-[#a8c8ff]">Admissions Contact</p>
            <div className="mt-4 grid gap-3 text-sm leading-relaxed text-[#d4e4ff]">
              <a href={BRAND.phoneHref} className="inline-flex items-start gap-2 transition hover:text-white">
                <Phone className="mt-0.5 h-4 w-4" />
                {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} className="inline-flex items-start gap-2 transition hover:text-white">
                <Mail className="mt-0.5 h-4 w-4" />
                {BRAND.email}
              </a>
              <p className="inline-flex items-start gap-2 text-[#bdd0f0]">
                <MapPin className="mt-0.5 h-4 w-4" />
                {BRAND.addressLine1}, {BRAND.addressLine2}
              </p>
              <p className="text-[#bdd0f0]">{BRAND.hours}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/register" className={buttonStyles({ variant: 'primary', size: 'sm', className: 'rounded-[7px] px-5' })}>
                Start Enrollment
              </Link>
              <Link
                href="/contact"
                className={buttonStyles({
                  variant: 'outline',
                  size: 'sm',
                  className: 'rounded-[7px] border-[#6788b6] bg-[#132744] px-5 text-[#e3eeff] hover:bg-[#1a3457]',
                })}
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#2a4467] pt-4 text-xs text-[#adc3e5] sm:text-sm">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
          <Link href="/register" className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-[#cfe2ff] hover:text-white">
            Start Enrollment
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

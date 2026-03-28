import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { buttonStyles } from '@/components/ui';
import { BrandLockup } from '@/components/brand';

export function Footer() {
  return (
    <footer className="public-footer mt-14">
      <div className="page-wrap py-7">
        <div className="rounded-panel border border-white/18 bg-white/[0.06] px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <BrandLockup tone="inverse" compact showTagline={false} />
              <p className="text-base leading-relaxed text-white">Care, communication, and enrollment clarity for modern families.</p>
            </div>

            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-base font-semibold">
              <Link href="/about" className="text-white/95 hover:text-white">
                About
              </Link>
              <Link href="/programs" className="text-white/95 hover:text-white">
                Programs
              </Link>
              <Link href="/safety" className="text-white/95 hover:text-white">
                Safety
              </Link>
              <Link href="/faq" className="text-white/95 hover:text-white">
                FAQ
              </Link>
              <Link href="/contact" className="text-white/95 hover:text-white">
                Contact
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 text-base text-white hover:text-white">
                <Phone className="h-3.5 w-3.5" />
                {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-1.5 text-base text-white hover:text-white">
                <Mail className="h-3.5 w-3.5" />
                {BRAND.email}
              </a>
              <Link href="/register" className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'px-5 shadow-none' })}>
                Start Enrollment
              </Link>
            </div>
          </div>

          <div className="mt-4 border-t border-white/22 pt-2.5 text-sm text-white/86">
            © {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

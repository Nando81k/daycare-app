import { CheckCircle2, Clock3, CreditCard, ShieldCheck } from 'lucide-react';
import { BrandLockup } from '@/components/brand';

interface AuthMarketingPanelProps {
  kicker: string;
  title: string;
  description: string;
}

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Secure parent access',
    text: 'Account and billing actions are protected through authenticated sessions.',
  },
  {
    icon: CreditCard,
    title: 'Clear billing flow',
    text: 'Families can track due now, history, and pay invoices from one place.',
  },
  {
    icon: Clock3,
    title: 'Fast admissions turnaround',
    text: 'Enrollment updates and next steps are surfaced clearly to families.',
  },
] as const;

export function AuthMarketingPanel({ kicker, title, description }: AuthMarketingPanelProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-primary-200 bg-primary-700 p-6 text-white shadow-float sm:p-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-12 top-20 h-36 w-36 rounded-full bg-teal-200/25 blur-2xl" />

      <BrandLockup className="relative z-10" showTagline={false} />

      <p className="relative z-10 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-primary-100">{kicker}</p>
      <h1 className="relative z-10 mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      <p className="relative z-10 mt-3 max-w-[40ch] text-sm text-primary-100 sm:text-base">{description}</p>

      <div className="relative z-10 mt-8 grid gap-3">
        {HIGHLIGHTS.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <article key={highlight.title} className="rounded-field border border-white/20 bg-white/10 px-3.5 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Icon className="h-4 w-4" />
                {highlight.title}
              </p>
              <p className="mt-1 text-xs text-primary-100">{highlight.text}</p>
            </article>
          );
        })}
      </div>

      <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-primary-50">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Trusted by Ambassadors Care families
      </div>
    </section>
  );
}

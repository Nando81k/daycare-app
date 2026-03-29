import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'soft' | 'contrast';
}

export function Section({ children, className, tone = 'default' }: SectionProps) {
  return (
    <section
      className={cn(
        'py-14 md:py-16',
        tone === 'soft' && 'bg-[#f8f3eb]',
        tone === 'contrast' && 'bg-ink-900 text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

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
        'py-12 md:py-14',
        tone === 'soft' && 'bg-[#f2f8ff]',
        tone === 'contrast' && 'bg-primary-900 text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

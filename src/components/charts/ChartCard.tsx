import { Card, InfoHint } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  info?: {
    label: string;
    title: string;
    description: React.ReactNode;
  };
  bodyClassName?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, info, bodyClassName, children }: ChartCardProps) {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className="glass-shell rounded-[12px] border-primary-100/85"
      actions={
        info ? (
          <InfoHint label={info.label} title={info.title}>
            {info.description}
          </InfoHint>
        ) : undefined
      }
    >
      <div className={cn('relative h-[292px] w-full min-w-0 overflow-hidden', bodyClassName)}>{children}</div>
    </Card>
  );
}

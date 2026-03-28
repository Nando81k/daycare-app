import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

export function LegacyRedirectNotice({ title, description }: Props) {
  return (
    <div className="rounded-[12px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-ink-700">
      <p className="inline-flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4 text-sky-700" />
        {title}
      </p>
      <p className="mt-1 text-ink-600">{description}</p>
    </div>
  );
}

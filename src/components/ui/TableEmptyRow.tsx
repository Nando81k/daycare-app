import { cn } from '@/lib/utils';

interface TableEmptyRowProps {
  colSpan: number;
  title?: string;
  description?: string;
  className?: string;
}

export function TableEmptyRow({
  colSpan,
  title = 'No data available yet.',
  description = 'This table will populate as records are added.',
  className,
}: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-3 py-10 text-center', className)}>
        <div className="rounded-field border border-dashed border-line bg-white px-4 py-5">
          <p className="text-sm font-semibold text-ink-800">{title}</p>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
      </td>
    </tr>
  );
}

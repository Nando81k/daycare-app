'use client';

import { cn } from '@/lib/utils';

export type NotificationTypeFilter = 'ALL' | 'GENERAL' | 'ENROLLMENT' | 'BILLING' | 'REMINDER';
export type NotificationStatusFilter = 'ALL' | 'UNREAD' | 'READ';

export function NotificationFilterTabs(props: {
  type: NotificationTypeFilter;
  status: NotificationStatusFilter;
  onTypeChange: (value: NotificationTypeFilter) => void;
  onStatusChange: (value: NotificationStatusFilter) => void;
}) {
  const typeOptions: Array<{ value: NotificationTypeFilter; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'ENROLLMENT', label: 'Enrollments' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'GENERAL', label: 'General' },
    { value: 'REMINDER', label: 'Reminders' },
  ];

  const statusOptions: Array<{ value: NotificationStatusFilter; label: string }> = [
    { value: 'ALL', label: 'Any status' },
    { value: 'UNREAD', label: 'Unread' },
    { value: 'READ', label: 'Read' },
  ];

  function activeTypeClass(value: NotificationTypeFilter) {
    if (value === 'BILLING' || value === 'REMINDER') {
      return 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm';
    }
    if (value === 'ENROLLMENT') {
      return 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm';
    }
    if (value === 'GENERAL') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm';
    }
    return 'border-slate-200 bg-slate-50 text-ink-700 shadow-sm';
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => props.onTypeChange(option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200',
              props.type === option.value
                ? activeTypeClass(option.value)
                : 'border-line bg-white text-ink-600 hover:border-sky-200 hover:text-ink-800'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => props.onStatusChange(option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200',
              props.status === option.value
                ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm'
                : 'border-line bg-white text-ink-600 hover:border-sky-200 hover:text-ink-800'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

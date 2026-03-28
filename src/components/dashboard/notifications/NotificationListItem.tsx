'use client';

import Link from 'next/link';
import { Bell, Clock3, CreditCard, MailCheck, ShieldCheck, UserRound } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';

export interface NotificationListItemModel {
  id: string;
  source: 'EVENT' | 'LIVE_REMINDER';
  type: 'GENERAL' | 'ENROLLMENT' | 'BILLING';
  subject: string;
  message: string;
  createdAt: string;
  status: 'READ' | 'UNREAD';
  actionHref: string;
  senderName: string | null;
}

function typeBadge(type: NotificationListItemModel['type']) {
  if (type === 'ENROLLMENT') return 'info' as const;
  if (type === 'BILLING') return 'danger' as const;
  return 'default' as const;
}

function notificationTone(item: NotificationListItemModel) {
  if (item.source === 'LIVE_REMINDER' || item.type === 'BILLING') {
    return {
      label: item.source === 'LIVE_REMINDER' ? 'Payment reminder' : 'Billing update',
      Icon: CreditCard,
      shellClassName: 'border-rose-200 bg-rose-50',
      iconClassName: 'border-rose-200 bg-rose-100 text-rose-700',
      titleClassName: 'text-rose-900',
      metaClassName: 'text-rose-700',
      actionVariant: 'danger' as const,
    };
  }

  if (item.type === 'GENERAL' && item.senderName) {
    return {
      label: 'Admin message',
      Icon: ShieldCheck,
      shellClassName: 'border-emerald-200 bg-emerald-50',
      iconClassName: 'border-emerald-200 bg-emerald-100 text-emerald-700',
      titleClassName: 'text-emerald-900',
      metaClassName: 'text-emerald-700',
      actionVariant: 'outline' as const,
    };
  }

  if (item.type === 'ENROLLMENT') {
    return {
      label: 'Enrollment update',
      Icon: UserRound,
      shellClassName: 'border-sky-200 bg-sky-50',
      iconClassName: 'border-sky-200 bg-sky-100 text-sky-700',
      titleClassName: 'text-sky-900',
      metaClassName: 'text-sky-700',
      actionVariant: 'outline' as const,
    };
  }

  return {
    label: 'Portal update',
    Icon: Bell,
    shellClassName: 'border-line bg-white',
    iconClassName: 'border-line bg-slate-100 text-ink-700',
    titleClassName: 'text-ink-900',
    metaClassName: 'text-ink-600',
    actionVariant: 'outline' as const,
  };
}

export function NotificationListItem(props: {
  item: NotificationListItemModel;
  onMarkRead: (id: string) => void;
  isMarkingRead?: boolean;
}) {
  const { item } = props;
  const tone = notificationTone(item);
  const ToneIcon = tone.Icon;

  return (
    <article
      className={cn(
        'rounded-field border px-3.5 py-3 shadow-sm transition-[transform,box-shadow,border-color] duration-180 ease-fluid hover:-translate-y-0.5 hover:shadow-soft',
        tone.shellClassName,
        item.status === 'UNREAD' && 'ring-1 ring-inset ring-white/70'
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border shadow-sm',
            tone.iconClassName
          )}
        >
          <ToneIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                {tone.label}
              </p>
              <p className={cn('truncate font-semibold', tone.titleClassName)}>{item.subject}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={typeBadge(item.type)}>{item.type}</Badge>
              <Badge variant={item.status === 'UNREAD' ? 'warning' : 'default'}>{item.status}</Badge>
              <Badge variant={item.source === 'LIVE_REMINDER' ? 'danger' : 'default'}>
                {item.source === 'LIVE_REMINDER' ? 'REMINDER' : 'IN-APP'}
              </Badge>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.message}</p>

          <p className={cn('mt-1 inline-flex items-center gap-1 text-xs', tone.metaClassName)}>
            {item.source === 'LIVE_REMINDER' ? <Clock3 className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            {item.senderName ? `${item.senderName} • ` : ''}
            {formatDateTime(item.createdAt)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button asChild variant={tone.actionVariant} size="sm">
              <Link href={item.actionHref}>Open details</Link>
            </Button>
            {item.source === 'EVENT' && item.status === 'UNREAD' ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => props.onMarkRead(item.id)}
                isLoading={props.isMarkingRead}
                loadingText="Marking..."
                leftIcon={<MailCheck className="h-4 w-4" />}
              >
                Mark read
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

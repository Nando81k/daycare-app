'use client';

import Link from 'next/link';
import type { AdminRole, OnboardingStatus } from '@prisma/client';
import { BookOpenText, ClipboardList, CreditCard, LifeBuoy, PlayCircle, Users } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { AdminHelpArticle } from '@/lib/help/admin-docs';

interface HelpQuickActionsProps {
  tutorialStatus: OnboardingStatus;
  articleMap: Map<string, AdminHelpArticle>;
  onSelectArticle: (id: string) => void;
  adminRole: AdminRole | null;
}

function tutorialActionConfig(status: OnboardingStatus) {
  if (status === 'IN_PROGRESS') {
    return {
      label: 'Continue Tutorial',
      href: '/admin/tutorial?tutorial=continue',
      subtitle: 'Resume your last guided walkthrough step.',
    };
  }

  if (status === 'COMPLETED' || status === 'SKIPPED') {
    return {
      label: 'Restart Tutorial',
      href: '/admin/tutorial?tutorial=restart',
      subtitle: 'Run the guided walkthrough again from the beginning.',
    };
  }

  return {
    label: 'Start Tutorial',
    href: '/admin/tutorial?tutorial=start',
    subtitle: 'Launch the guided walkthrough for the admin suite.',
  };
}

const ENTRY_CARDS = [
  { id: 'admissions-queue', label: 'Review applications', icon: ClipboardList },
  { id: 'family-crm', label: 'Manage families', icon: Users },
  { id: 'billing-operations', label: 'Run billing', icon: CreditCard },
  { id: 'pricing-policy', label: 'Pricing and policy', icon: BookOpenText },
  { id: 'troubleshooting-common-states', label: 'Troubleshoot issues', icon: LifeBuoy },
] as const;

export function HelpQuickActions({
  tutorialStatus,
  articleMap,
  onSelectArticle,
  adminRole,
}: HelpQuickActionsProps) {
  const tutorialAction = tutorialActionConfig(tutorialStatus);

  return (
    <div className="space-y-4">
      <Card
        title="Guided tutorial"
        subtitle="Use the walkthrough when you want the dashboard to show you the workflow live."
        className="glass-shell"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="info">{adminRole || 'ADMIN'}</Badge>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{tutorialAction.subtitle}</p>
          </div>
          <Button asChild className="px-5">
            <Link href={tutorialAction.href}>
              <PlayCircle className="h-4 w-4" />
              {tutorialAction.label}
            </Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ENTRY_CARDS.map((entry) => {
          const article = articleMap.get(entry.id);
          if (!article) return null;

          const Icon = entry.icon;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectArticle(entry.id)}
              className="rounded-[18px] border border-line/80 bg-white/92 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-sky-50/55"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{entry.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{article.summary}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

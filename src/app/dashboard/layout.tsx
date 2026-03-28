import { redirect } from 'next/navigation';
import { AppShell, type ShellItem } from '@/components/shell';
import { getSessionUser } from '@/lib/auth';
import { getUiRevampFlags } from '@/lib/ui-revamp';

const ITEMS: ShellItem[] = [
  { href: '/dashboard/family', label: 'Enrollment', icon: 'family' },
  { href: '/dashboard/billing', label: 'Tuition', icon: 'billing' },
];

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const flags = getUiRevampFlags();

  if (!user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  if (user.role !== 'PARENT') {
    redirect('/admin');
  }

  return (
    <div
      className="theme-parent"
      data-ui-revamp-parent={flags.parent ? 'on' : 'off'}
      data-ui-revamp-foundation={flags.foundation ? 'on' : 'off'}
    >
      <AppShell
        title="Parent Portal"
        subtitle="Enrollment and tuition management"
        items={ITEMS}
        primaryAction={{ href: '/dashboard/family', label: 'Start Enrollment' }}
        mode="rail"
        showHomeButton
        showSignOutButton
      >
        {children}
      </AppShell>
    </div>
  );
}

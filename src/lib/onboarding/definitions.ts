import type { AdminRole, OnboardingScope } from '@prisma/client';
import { hasPermission, type Permission, PERMISSIONS } from '@/lib/rbac';

export const ONBOARDING_VERSIONS: Record<OnboardingScope, number> = {
  ADMIN_DASHBOARD: 1,
  PARENT_DASHBOARD: 2,
};

export type TutorialScope = OnboardingScope;

export interface OnboardingStep {
  key: string;
  scope: TutorialScope;
  route: string;
  targetId: string;
  title: string;
  body: string;
  cta: string;
  requiresPermission?: Permission;
}

const ADMIN_STEPS: OnboardingStep[] = [
  {
    key: 'admin-intro',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin',
    targetId: 'shell-topbar',
    title: 'Welcome to Admin Suite',
    body: 'This dashboard gives you one place to run admissions, family records, and billing operations.',
    cta: 'Start tour',
  },
  {
    key: 'admin-nav',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin',
    targetId: 'shell-nav',
    title: 'Use the top navigation',
    body: 'Switch between Overview, Admissions, Families, and Billing at any time.',
    cta: 'Next',
  },
  {
    key: 'admin-overview-metrics',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin',
    targetId: 'admin-overview-metrics',
    title: 'Scan priority metrics first',
    body: 'These cards summarize admissions pressure, receivables, and monthly collections.',
    cta: 'Next',
  },
  {
    key: 'admin-overview-trend',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin',
    targetId: 'admin-overview-trend',
    title: 'Track collections trends',
    body: 'Use the trend chart to monitor invoiced versus collected amounts and spot issues early.',
    cta: 'Next',
  },
  {
    key: 'admin-crm-inbox',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin',
    targetId: 'admin-crm-inbox',
    title: 'Run unified operations from one inbox',
    body: 'This inbox merges admissions, CRM tasks, and billing follow-up so admins can clear priority work without switching pages.',
    cta: 'Next',
  },
  {
    key: 'admin-admissions-toolbar',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/admissions',
    targetId: 'admin-admissions-toolbar',
    title: 'Filter your admissions queue',
    body: 'Search by child or parent details and narrow by status to triage quickly.',
    cta: 'Next',
  },
  {
    key: 'admin-admissions-decisions',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/admissions',
    targetId: 'admin-admissions-table',
    title: 'Review and decide applications',
    body: 'Open details to view child safety context and set approval, waitlist, or request-info decisions.',
    cta: 'Next',
    requiresPermission: PERMISSIONS.ADMISSIONS_WRITE,
  },
  {
    key: 'admin-families-search',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/families',
    targetId: 'admin-families-search',
    title: 'Find any family quickly',
    body: 'Search family name, email, phone, or child name to jump to the right record.',
    cta: 'Next',
  },
  {
    key: 'admin-families-table',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/families',
    targetId: 'admin-families-table',
    title: 'Use Family CRM details',
    body: 'Open each row for child profiles, enrollment history, and outstanding balances.',
    cta: 'Next',
  },
  {
    key: 'admin-billing-invoices',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/billing',
    targetId: 'admin-billing-invoices',
    title: 'Run invoice-first collections',
    body: 'Use this table as your daily receivables workspace for open and past-due balances.',
    cta: 'Next',
  },
  {
    key: 'admin-billing-policy',
    scope: 'ADMIN_DASHBOARD',
    route: '/admin/billing',
    targetId: 'admin-billing-policy',
    title: 'Manage billing policy defaults',
    body: 'Adjust grace days, late fees, and reminders to match your center operations.',
    cta: 'Finish',
    requiresPermission: PERMISSIONS.POLICY_WRITE,
  },
];

const PARENT_STEPS: OnboardingStep[] = [
  {
    key: 'parent-intro',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard',
    targetId: 'shell-topbar',
    title: 'Welcome to Parent Portal',
    body: 'You can manage family profiles, enrollment updates, notifications, and billing in one place.',
    cta: 'Start tour',
  },
  {
    key: 'parent-nav',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard',
    targetId: 'shell-nav',
    title: 'Navigate from the side rail',
    body: 'Use Overview, Family Hub, Notifications, and Billing to move through your workflow.',
    cta: 'Next',
  },
  {
    key: 'parent-overview-today',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard',
    targetId: 'parent-overview-today',
    title: 'Start with Today',
    body: 'This action queue surfaces the highest-priority tasks so you can finish urgent work quickly.',
    cta: 'Next',
  },
  {
    key: 'parent-overview-enrollment-lane',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard',
    targetId: 'parent-overview-enrollment-lane',
    title: 'Track enrollment by child',
    body: 'Enrollment Lane shows the latest admissions status and what each child needs next.',
    cta: 'Next',
  },
  {
    key: 'parent-overview-money-messages',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard',
    targetId: 'parent-overview-money-messages',
    title: 'Handle billing and messages together',
    body: 'Money + Messages keeps due-now billing and unread admin updates in one compact place.',
    cta: 'Next',
  },
  {
    key: 'parent-family-intake',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/family',
    targetId: 'parent-family-intake-launch',
    title: 'Launch Family Intake',
    body: 'Use the guided submit-now intake flow to add new children and send enrollment requests immediately.',
    cta: 'Next',
  },
  {
    key: 'parent-family-status',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/family',
    targetId: 'parent-family-enrollment-status',
    title: 'Track approvals and secure spots',
    body: 'When admissions approves a request, complete secure-spot payment directly from this section.',
    cta: 'Next',
  },
  {
    key: 'parent-notifications-filters',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/notifications',
    targetId: 'parent-notifications-filters',
    title: 'Filter your updates',
    body: 'Switch between enrollment, billing, and reminder updates with status filters.',
    cta: 'Next',
  },
  {
    key: 'parent-notifications-list',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/notifications',
    targetId: 'parent-notifications-list',
    title: 'Manage notification feed',
    body: 'Read updates, mark items as read, and keep track of all important family activity.',
    cta: 'Next',
  },
  {
    key: 'parent-billing-invoices',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/billing',
    targetId: 'parent-billing-invoices',
    title: 'Pay invoices from billing center',
    body: 'Use Pay Now on open or past-due invoices to complete secure checkout.',
    cta: 'Next',
  },
  {
    key: 'parent-billing-history',
    scope: 'PARENT_DASHBOARD',
    route: '/dashboard/billing',
    targetId: 'parent-billing-history',
    title: 'Review payment history',
    body: 'Check recent successful and failed payment attempts for full billing transparency.',
    cta: 'Finish',
  },
];

export function getScopeSteps(scope: TutorialScope, adminRole?: AdminRole | null): OnboardingStep[] {
  const base = scope === 'ADMIN_DASHBOARD' ? ADMIN_STEPS : PARENT_STEPS;
  if (scope !== 'ADMIN_DASHBOARD') return base;

  return base.filter((step) => {
    if (!step.requiresPermission) return true;
    return hasPermission(adminRole ?? null, step.requiresPermission);
  });
}

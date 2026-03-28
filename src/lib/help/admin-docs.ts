import type { AdminRole } from '@prisma/client';

export type AdminHelpCategory =
  | 'GETTING_STARTED'
  | 'ADMISSIONS'
  | 'FAMILIES'
  | 'BILLING'
  | 'PRICING'
  | 'ANALYTICS'
  | 'TROUBLESHOOTING';

export type AdminHelpRoleVisibility = 'ALL' | AdminRole;

export interface AdminHelpStep {
  title: string;
  body: string;
  route?: string;
  anchorId?: string;
}

export interface AdminHelpArticle {
  id: string;
  category: AdminHelpCategory;
  title: string;
  summary: string;
  keywords: string[];
  roles: AdminHelpRoleVisibility[];
  relatedIds?: string[];
  route?: string;
  anchorId?: string;
  steps: AdminHelpStep[];
  notes?: string[];
  troubleshooting?: string[];
}

export const ADMIN_HELP_CATEGORY_LABELS: Record<AdminHelpCategory, string> = {
  GETTING_STARTED: 'Getting Started',
  ADMISSIONS: 'Admissions',
  FAMILIES: 'Family CRM',
  BILLING: 'Billing',
  PRICING: 'Pricing & Policy',
  ANALYTICS: 'Analytics',
  TROUBLESHOOTING: 'Troubleshooting',
};

export const ADMIN_HELP_ARTICLES: AdminHelpArticle[] = [
  {
    id: 'getting-started',
    category: 'GETTING_STARTED',
    title: 'Start the day in the admin suite',
    summary: 'Learn where to begin, what to review first, and how the core admin pages fit together.',
    keywords: ['overview', 'start', 'daily workflow', 'home', 'navigation', 'dashboard'],
    roles: ['ALL'],
    relatedIds: ['overview-triage', 'admissions-queue', 'family-crm'],
    route: '/admin',
    anchorId: 'shell-nav',
    steps: [
      {
        title: 'Open the main queue pages from the left rail',
        body: 'Use Overview for triage, Admissions for application review, Families for relationship management, and Billing for receivables work.',
        route: '/admin',
        anchorId: 'shell-nav',
      },
      {
        title: 'Use page headers to move into active work quickly',
        body: 'Every admin page keeps a short action cluster at the top so you can jump to the next operational page without backing out of the current workflow.',
        route: '/admin',
        anchorId: 'shell-topbar',
      },
      {
        title: 'Keep Help open as your reference point',
        body: 'Open Help whenever you need step-by-step instructions, then follow the related page links back into the exact workflow.',
        route: '/admin/tutorial',
      },
    ],
    notes: [
      'The admin suite is organized around three active work queues: admissions, family CRM, and billing.',
      'Use Overview for triage only. Move into Admissions, Families, or Billing when you are ready to act.',
    ],
  },
  {
    id: 'overview-triage',
    category: 'GETTING_STARTED',
    title: 'Use Overview to triage the day',
    summary: 'Scan priority metrics, then clear work from the unified action inbox before drilling into route-specific desks.',
    keywords: ['overview', 'metrics', 'triage', 'recent admissions', 'recent payments'],
    roles: ['ALL'],
    relatedIds: ['admissions-queue', 'billing-operations', 'analytics-collections'],
    route: '/admin',
    anchorId: 'admin-overview-metrics',
    steps: [
      {
        title: 'Scan the top metrics first',
        body: 'Pending admissions, open receivables, past-due invoices, and collections this month tell you where to focus first.',
        route: '/admin',
        anchorId: 'admin-overview-metrics',
      },
      {
        title: 'Run the unified action inbox first',
        body: 'Use the inbox to clear urgent admissions, task, and billing follow-up items from one queue before switching pages.',
        route: '/admin',
        anchorId: 'admin-crm-inbox',
      },
      {
        title: 'Use the chart to spot billing drift',
        body: 'If invoiced and collected lines diverge, open Billing to inspect open invoices, past-due families, or payment failures.',
        route: '/admin',
        anchorId: 'admin-overview-trend',
      },
    ],
    notes: [
      'Overview is best for prioritization. Final review and changes still happen in the dedicated modules.',
    ],
  },
  {
    id: 'admissions-queue',
    category: 'ADMISSIONS',
    title: 'Review grouped application batches',
    summary: 'Understand what each admissions row means, how readiness works, and how to open a family batch for full review.',
    keywords: ['admissions', 'queue', 'applications', 'batch', 'children', 'readiness', 'exceptions'],
    roles: ['DIRECTOR', 'ADMISSIONS', 'READ_ONLY'],
    relatedIds: ['batch-decisions', 'family-crm', 'troubleshooting-common-states'],
    route: '/admin/admissions',
    anchorId: 'admin-admissions-table',
    steps: [
      {
        title: 'Treat each row as one family intake batch',
        body: 'Rows are grouped so siblings submitted together stay together. Open the details drawer to inspect the children inside the batch.',
        route: '/admin/admissions',
        anchorId: 'admin-admissions-table',
      },
      {
        title: 'Use readiness before making decisions',
        body: 'Ready counts show how many children can move forward now. Exceptions show how many children still need missing information or review.',
        route: '/admin/admissions',
        anchorId: 'admin-admissions-toolbar',
      },
      {
        title: 'Search and status filters narrow the queue quickly',
        body: 'Search by parent, child, email, or program. Status filtering helps isolate pending, request-info, waitlisted, or denied work.',
        route: '/admin/admissions',
        anchorId: 'admin-admissions-toolbar',
      },
    ],
    notes: [
      'Fully approved groups are hidden from the active queue so the list stays operational.',
      'Billing-only admins do not use the admissions queue as a primary workflow.',
    ],
  },
  {
    id: 'batch-decisions',
    category: 'ADMISSIONS',
    title: 'Approve batches and handle child-level exceptions',
    summary: 'Use batch actions for the common path, then make child-level overrides only when one child needs a different outcome.',
    keywords: ['approve batch', 'request info', 'deny batch', 'child override', 'review notes', 'start date'],
    roles: ['DIRECTOR', 'ADMISSIONS'],
    relatedIds: ['admissions-queue', 'family-crm', 'troubleshooting-common-states'],
    route: '/admin/admissions',
    anchorId: 'admin-admissions-table',
    steps: [
      {
        title: 'Open the batch details drawer from the queue',
        body: 'The drawer shows every child in the intake batch, their care details, current enrollment state, and the parent contact record.',
        route: '/admin/admissions',
        anchorId: 'admin-admissions-table',
      },
      {
        title: 'Use batch actions for the normal path',
        body: 'Approve Batch moves ready children forward and Request Info or Deny Batch handles unresolved children together when a whole batch needs the same outcome.',
        route: '/admin/admissions',
      },
      {
        title: 'Use per-child override only when needed',
        body: 'Select one child inside the drawer to change decision, review notes, reason, or start date when that child needs an exception.',
        route: '/admin/admissions',
      },
      {
        title: 'Send a parent message directly from the drawer',
        body: 'Use the notification composer when admissions needs to explain next steps or request missing information clearly.',
        route: '/admin/admissions',
      },
    ],
    notes: [
      'Directors and admissions staff can mutate admissions decisions.',
      'Read-only users can review batches but should not see action guidance in their interface.',
    ],
    troubleshooting: [
      'If a child cannot be approved, check readiness and the child profile details before changing status.',
      'If a parent says they cannot secure a spot, confirm the child is approved and the secure-spot hold has not expired.',
    ],
  },
  {
    id: 'family-crm',
    category: 'FAMILIES',
    title: 'Use Family CRM as the relationship workspace',
    summary: 'Track family stage, ownership, tasks, balance risk, and admissions context from one queue and detail drawer workflow.',
    keywords: ['crm', 'families', 'owner', 'stage', 'tasks', 'notes', 'communications', 'saved views'],
    roles: ['ALL'],
    relatedIds: ['crm-follow-up', 'billing-operations', 'admissions-queue'],
    route: '/admin/families',
    anchorId: 'admin-families-table',
    steps: [
      {
        title: 'Use filters to define the queue you want to work',
        body: 'Search by family or child details, then narrow by stage, owner, saved view, task timing, balance state, or tags.',
        route: '/admin/families',
        anchorId: 'admin-families-search',
      },
      {
        title: 'Read the table left to right',
        body: 'Start with family identity, then pipeline stage, child and enrollment snapshot, billing state, tasks, and last contact.',
        route: '/admin/families',
        anchorId: 'admin-families-table',
      },
      {
        title: 'Open CRM for the full family workspace',
        body: 'The drawer keeps admissions, billing, notes, tasks, and communication in one place so you do not need to bounce between pages.',
        route: '/admin/families',
        anchorId: 'admin-families-table',
      },
    ],
    notes: [
      'CRM is the best place to manage follow-up across admissions and billing without losing family context.',
    ],
  },
  {
    id: 'crm-follow-up',
    category: 'FAMILIES',
    title: 'Work follow-up with tasks, notes, and communications',
    summary: 'Use the CRM drawer tabs to assign work, preserve context, and communicate with families consistently.',
    keywords: ['tasks', 'notes', 'communications', 'follow-up', 'owner', 'bulk actions'],
    roles: ['DIRECTOR', 'ADMISSIONS', 'BILLING'],
    relatedIds: ['family-crm', 'billing-operations', 'batch-decisions'],
    route: '/admin/families',
    anchorId: 'admin-families-table',
    steps: [
      {
        title: 'Assign owners and next follow-up dates',
        body: 'Use the Overview tab inside the CRM drawer to set who owns the family and when the next contact should happen.',
        route: '/admin/families',
      },
      {
        title: 'Create tasks for shared operational work',
        body: 'Tasks are best for explicit follow-up like confirming intake info, chasing a balance, or preparing for a start date.',
        route: '/admin/families',
      },
      {
        title: 'Capture durable context in notes',
        body: 'Use notes to record facts that the next admin should know. Pin the note if it should stay easy to see.',
        route: '/admin/families',
      },
      {
        title: 'Use communications for parent-facing updates',
        body: 'Send in-app or email updates when a parent needs a clear next step and you want the contact captured in the timeline.',
        route: '/admin/families',
      },
      {
        title: 'Use bulk actions when many families need the same treatment',
        body: 'Assign owner, move stage, mark active or inactive, or create a shared task from the table when you are working a queue.',
        route: '/admin/families',
      },
    ],
    notes: [
      'Billing and admissions users can both work CRM follow-up.',
      'Read-only users should reference notes and history but should not see write guidance here.',
    ],
  },
  {
    id: 'billing-operations',
    category: 'BILLING',
    title: 'Run daily billing operations from the receivables center',
    summary: 'Use the billing page to review invoices, monitor receivables, inspect contracts, and check payment outcomes.',
    keywords: ['billing', 'invoices', 'receivables', 'past due', 'payments', 'contracts'],
    roles: ['ALL'],
    relatedIds: ['pricing-policy', 'contracts-cadence', 'analytics-collections', 'family-crm'],
    route: '/admin/billing',
    anchorId: 'admin-billing-invoices',
    steps: [
      {
        title: 'Start with the collections chart',
        body: 'Use the top chart to compare invoiced versus collected amounts before diving into invoice rows.',
        route: '/admin/billing',
      },
      {
        title: 'Treat invoices as the primary work queue',
        body: 'The invoices table is the main receivables surface. Prioritize open and past-due rows before reviewing settled history.',
        route: '/admin/billing',
        anchorId: 'admin-billing-invoices',
      },
      {
        title: 'Use contracts when you need billing context',
        body: 'Contracts show recurring amount, parent, child, plan, cadence, and status so you can explain why an invoice exists.',
        route: '/admin/billing',
      },
      {
        title: 'Use payment history to confirm outcomes',
        body: 'Payment history shows the latest successful and failed attempts so you can distinguish a balance issue from a collection timing issue.',
        route: '/admin/billing',
      },
    ],
    notes: [
      'Admissions staff can read billing context, but billing staff usually own receivables follow-up.',
    ],
  },
  {
    id: 'pricing-policy',
    category: 'PRICING',
    title: 'Manage class pricing and collection policy',
    summary: 'Control tuition plans, registration fees, cadence options, grace periods, late fees, and reminder timing from the pricing control panel.',
    keywords: ['pricing', 'plans', 'policy', 'late fee', 'grace period', 'reminders', 'class pricing'],
    roles: ['ALL'],
    relatedIds: ['billing-operations', 'contracts-cadence'],
    route: '/admin/billing',
    anchorId: 'admin-billing-policy',
    steps: [
      {
        title: 'Use Class Pricing for per-program tuition',
        body: 'Each plan defines the tuition baseline and registration fee for a class or a general fallback.',
        route: '/admin/billing',
        anchorId: 'admin-billing-policy',
      },
      {
        title: 'Keep cadence options realistic',
        body: 'Only enable monthly, biweekly, or weekly options that you intend parents to use during secure-spot checkout.',
        route: '/admin/billing',
      },
      {
        title: 'Use Collections Policy for center-wide rules',
        body: 'Grace days, late fees, pause thresholds, and reminder timing apply operationally after invoices are generated.',
        route: '/admin/billing',
      },
      {
        title: 'Save policy changes carefully',
        body: 'Policy changes affect future billing behavior, so use clear internal coordination when changing defaults.',
        route: '/admin/billing',
      },
    ],
    notes: [
      'Directors can change policy defaults.',
      'Billing users may manage plan operations, but policy edits can still be role-limited depending on permission.',
    ],
    troubleshooting: [
      'If reminder offsets are confusing, use the explicit preset or unit-based options in the policy form.',
    ],
  },
  {
    id: 'contracts-cadence',
    category: 'PRICING',
    title: 'Understand contracts, cadence, and recurring amounts',
    summary: 'Use contracts to explain recurring tuition and manage cadence changes without surprising families.',
    keywords: ['contracts', 'cadence', 'monthly', 'biweekly', 'weekly', 'recurring amount'],
    roles: ['DIRECTOR', 'ADMISSIONS', 'BILLING', 'READ_ONLY'],
    relatedIds: ['billing-operations', 'pricing-policy'],
    route: '/admin/billing',
    steps: [
      {
        title: 'Read the contract before changing cadence',
        body: 'Check the child, plan, contract status, and recurring amount so you understand the current billing setup.',
        route: '/admin/billing',
      },
      {
        title: 'Treat cadence as next-cycle operational data',
        body: 'Cadence changes should be explained clearly because parents expect predictable recurring charges.',
        route: '/admin/billing',
      },
      {
        title: 'Use the plan baseline as the source of truth',
        body: 'Recurring amounts are derived from the plan baseline, so pricing mismatches usually point back to plan setup rather than invoice rows.',
        route: '/admin/billing',
      },
    ],
  },
  {
    id: 'analytics-collections',
    category: 'ANALYTICS',
    title: 'Read collections and billing trends',
    summary: 'Use the collections chart to interpret revenue movement, invoice mix, and daily payment behavior.',
    keywords: ['analytics', 'trend', 'collections', 'stripe', 'chart', 'mix', 'insights'],
    roles: ['ALL'],
    relatedIds: ['billing-operations', 'overview-triage'],
    route: '/admin/billing',
    steps: [
      {
        title: 'Use timeframe presets to change the lens',
        body: 'Short ranges help with collections follow-up, while longer ranges help identify broader trends in invoiced versus collected amounts.',
        route: '/admin/billing',
      },
      {
        title: 'Click a point to inspect the day',
        body: 'The side insight panel shows what happened on that day so you can connect chart movement to invoices and payments.',
        route: '/admin/billing',
      },
      {
        title: 'Use mix and rate together',
        body: 'A stable collection rate with rising open invoices means volume is growing; a falling collection rate means follow-up may be slipping.',
        route: '/admin/billing',
      },
    ],
  },
  {
    id: 'troubleshooting-common-states',
    category: 'TROUBLESHOOTING',
    title: 'Troubleshoot common admin edge cases',
    summary: 'Use these checks when records seem missing, statuses do not match expectations, or a family is stuck between steps.',
    keywords: ['troubleshooting', 'missing data', 'empty state', 'approved', 'pending', 'waitlist', 'billing mismatch'],
    roles: ['ALL'],
    relatedIds: ['admissions-queue', 'family-crm', 'billing-operations'],
    route: '/admin',
    steps: [
      {
        title: 'If a family is missing from one queue, check the other source of truth',
        body: 'Admissions is the application queue. Families CRM is the relationship queue. A family can still exist in CRM even when it is no longer active in Admissions.',
        route: '/admin/families',
      },
      {
        title: 'If a child is approved but the parent has not acted, check secure-spot state',
        body: 'Look for an approved status with secure-spot still pending. Families and Admissions can both help you confirm the next parent action.',
        route: '/admin/admissions',
      },
      {
        title: 'If receivables look wrong, compare invoices and payment history',
        body: 'An open balance with successful payments can indicate timing or reconciliation issues, while failed payments usually explain a stuck balance directly.',
        route: '/admin/billing',
      },
      {
        title: 'If a page is empty, verify filters first',
        body: 'Most admin pages are intentionally queue-driven. Clear filters and saved views before assuming records were removed.',
        route: '/admin/families',
      },
    ],
    troubleshooting: [
      'Use Help links on each page to jump straight back to the relevant documentation article.',
      'Read-only users should use documentation and timelines to triage, then escalate action items to a role with write access.',
    ],
  },
];

export function getVisibleAdminHelpArticles(adminRole: AdminRole | null | undefined) {
  return ADMIN_HELP_ARTICLES.filter((article) => {
    if (article.roles.includes('ALL')) return true;
    if (!adminRole) return false;
    return article.roles.includes(adminRole);
  });
}

export function getAdminHelpArticleById(id: string) {
  return ADMIN_HELP_ARTICLES.find((article) => article.id === id) ?? null;
}

# Admin & Parent Dashboard Audit — 2026-05-04

Walkthrough of every admin and parent page exercising the primary flow on
each, signed in as `teddy@ambassadorscare.org` (admin) and
`olivia@harperfamily.com` (parent). Findings categorized by **Severity**
(blocker / friction / polish) and **Type** (UX / UI / navigation /
workflow / bug).

This is a one-pass audit, not a permanent test harness — output is the
findings list at the bottom plus the coverage matrix.

---

## Coverage matrix

### Admin portal (signed in as Teddy)

| Page | Pri-flow checked | Notes |
|---|---|---|
| `/admin` | ✓ | Triage row + 9-tile Center overview grid + drawer |
| `/admin/enrollment` (Leads) | ✓ | Tabs work; click row → "Review application" drawer |
| `/admin/enrollment?tab=waitlist` | ✓ | Waitlist tab loads, `/admin/waitlist` redirects here |
| `/admin/families` | ✓ | Family card grid + filters + drawer |
| `/admin/classrooms` | ✓ | Classroom cards + roster drawer on click |
| `/admin/attendance` | ✓ | Date picker + classroom cards + roster drawer |
| `/admin/attendance/history` | ✓ | 30-day calendar grid renders, cells link to date |
| `/admin/calendar` | ✓ | Workspace + new-event drawer |
| `/admin/documents` | ✓ | Family-card layout + per-family detail drawer |
| `/admin/billing` | ✓ | Tabs, invoice creator, balances |
| `/admin/rooms` (Programs & Pricing) | ✓ | Tuition matrix hero + drawer |
| `/admin/reports` | ✓ | Charts + 2 sidebar cards |
| `/admin/communications` | ✓ | Inbox/Broadcasts tabs |
| `/admin/staff` | ✓ | Page renders |
| `/admin/settings` | ✓ | General/Security tabs |
| `/admin/settings?tab=security` | ✓ | `/admin/security` redirects here, 2FA UI loads |
| `/admin/audit` | ✓ | Search + filters, "50 of 70 entries" |

### Parent portal (signed in as Olivia)

| Page | Pri-flow checked | Notes |
|---|---|---|
| `/parent` (Today) | ✓ | Renders with daily report, attendance, messages |
| `/parent/billing` | ✓ | Default landing after sign-in (see findings) |
| `/parent/messages` | ✓ | Renders |
| `/parent/calendar` | ✓ | Renders, mirror of admin calendar workspace |
| `/parent/documents` | ✓ | Renders |
| `/parent/attendance` | ✓ | Renders |
| `/parent/announcements` | ✓ | Renders |
| `/parent/settings` | ✓ | Renders |

### Redirects verified

| Old URL | New URL | Status |
|---|---|---|
| `/admin/messages` | `/admin/communications` | ✓ Inbox tab selected |
| `/admin/announcements` | `/admin/communications?tab=broadcasts` | ✓ Broadcasts tab selected |
| `/admin/waitlist` | `/admin/enrollment?tab=waitlist` | ✓ Waitlist tab selected |
| `/admin/security` | `/admin/settings?tab=security` | ✓ Security tab selected |
| `/admin/children` | `/admin/families` | ✓ |
| `/admin/children/[slug]` | `/admin/families` | ✓ |

---

## Findings

### 🔴 Blockers

**1. Currency rendered as ₦ (Nigerian Naira).** ✅ **Resolved — intentional.**
This was confirmed by the user as the project's intended currency, not a
bug. No code change needed.

**2. Default parent landing after sign-in is `/parent/billing`, not `/parent`.** ✅ **Fixed.**
[src/app/actions/auth.ts](/Users/nando/daycare-app/src/app/actions/auth.ts):
`getPortalDestination` now returns `/parent`, and the post-signup redirect
also lands on `/parent`. [src/components/layout/site-header.tsx](/Users/nando/daycare-app/src/components/layout/site-header.tsx)
"Go to dashboard" button for parents updated to match.

### 🟡 Friction

**3. `/admin/enrollment` alert banner links "Check classroom capacity" to `/admin/rooms`.** ✅ **Fixed.**
Link now points to `/admin/classrooms`.

**4. Static alert banner "Two leads still need fast follow-up this week" on `/admin/enrollment`.** ✅ **Fixed.**
Banner now renders only when `highPriorityCount > 0`, with dynamic copy
("N high-priority lead(s) need fast follow-up"). Hardcoded May/June
description replaced with a generic explanation of high-priority gating.

**5. Lead drawer title says "Review application" but the tab is "Leads".** ✅ **Fixed.**
Drawer title now reads `Review {familyName}` so the row context is
explicit.

**6. `/admin/enrollment` and `/admin/communications` lead views don't render breadcrumbs differently for tabs.** ⏳ Deferred.
Tab-aware breadcrumbs require touching the breadcrumb generator
([admin-breadcrumbs.tsx](/Users/nando/daycare-app/src/components/admin/shell/admin-breadcrumbs.tsx))
and is more involved than this audit's batch fix. Worth its own PR —
the URL state already round-trips correctly via `?tab=`, breadcrumbs
just don't reflect it.

**7. Today's triage attendance strip on `/admin` is gated on `attendanceBoard.length > 0`.** ✅ **Fixed.**
Strip now renders an empty-state ("No attendance has been marked today
yet · Mark attendance") when the board is empty, instead of disappearing.

**8. Reports page (`/admin/reports`) has no metric chips above the charts.** ✅ False alarm.
The page does have metric chips inside `AdminPageHeader`; my snapshot
depth missed them. No change needed.

**9. Audit log pagination is implemented but easy to miss.** ✅ False alarm.
The pagination already has visible Previous/Next buttons next to the
count text — my snapshot depth missed them. No change needed.

### ⚪ Polish

**10. Sidebar tooltips/summaries don't render on hover.** ✅ **Fixed.**
[admin-sidebar.tsx](/Users/nando/daycare-app/src/components/admin/shell/admin-sidebar.tsx)
now uses `item.summary` for both the SidebarMenuButton tooltip (collapsed
state) and the link's `title` attribute (expanded state, native browser
hover tooltip).

**11. Card hover patterns are slightly inconsistent across pages.**
Type: UI · Severity: polish
- Family cards on `/admin/families`: chevron + lift + ring on focus
- Document family cards on `/admin/documents`: chevron + lift + shadow
- Classroom cards on `/admin/classrooms`: lift + chevron, no ring on focus
- Section tiles on `/admin` Center overview: lift + chevron + ring
Standardize on the most polished version (lift + chevron + ring + soft
primary shadow on hover). All four pages should look identical at the
card primitive level.

**12. No "Add child" or onboarding shortcut for new parent accounts on `/parent`.**
Type: UX · Severity: polish
The "Add another child" link on `/parent` reads as adding a *second*
child. New families landing with zero kids don't have a clearer "Start
enrollment" CTA on the dashboard itself.

**13. The Communications page's stats card has 4 metric chips that don't match the parent-facing sidebar nav order.**
Type: UI · Severity: polish
Order is "Open threads · Unread · Drafts · Scheduled." The Inbox tab is
about threads, the Broadcasts tab is about drafts/scheduled. Group
inbox metrics on the left, broadcast metrics on the right.

**14. Communications page header "Family conversations and the announcement queue" repeats the same idea as the description below.**
Type: UI/copy · Severity: polish
The eyebrow + title + description trio across admin pages varies in
density. Some are tight (Families, Programs); some carry redundant
phrasing (Communications, Settings). A copy pass to align tone helps.

**15. `Tabs` component active underline uses `border-primary` on default variant but `accent` color on `line` variant.**
Type: UI · Severity: polish
Most pages use the line variant (which is fine) but the few that use
the default variant feel visually disconnected. Pick one and use it
consistently.

### Bonus: things working well

- Drawer-based editing pattern is consistent across **families,
  calendar, attendance, classrooms, documents, programs** — predictable
  for an admin who's used to one drawer flow on any page.
- All 14 admin pages and 8 parent pages render without console errors
  on a clean cold load.
- All four legacy URL redirects (`/admin/messages`,
  `/admin/announcements`, `/admin/waitlist`, `/admin/security`) work
  with the right tab pre-selected.
- The Center overview compartmentalization on `/admin` is a clear win —
  no more 400-line scroll wall.
- Programs & Pricing matrix hero is genuinely usable now; click any
  cell, edit one rate, save.

---

## Suggested fix priority

1. **Currency formatting** — single point of fix in
   [src/lib/format.ts](/Users/nando/daycare-app/src/lib/format.ts), high
   user-trust impact.
2. **Parent default landing** — change post-sign-in redirect to
   `/parent`. One-line fix.
3. **`/admin/enrollment` alert banner link** — point to
   `/admin/classrooms`, not `/admin/rooms`. Trivial.
4. **Static "May/June" alert banner** — drive from data or remove.
5. **Breadcrumbs aware of `?tab=`** — small but bookmarkability win.
6. **Card hover standardization** — extract into a shared primitive
   class so all clickable cards feel the same.
7. The polish items can be batched into a "design pass" PR.

---

## Out of scope of this audit

- Mobile-viewport rendering (no mobile pass done).
- Network failure / offline behavior.
- Performance / page-load timings.
- Accessibility deep audit (axe / WCAG checks).
- The teacher portal (`/teacher/*`).
- Permission boundaries (e.g., parent trying to access admin URLs).

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  ClockIcon,
  CreditCardIcon,
  FileText,
  GraduationCap,
  Hourglass,
  LayoutDashboardIcon,
  MailOpen,
  MegaphoneIcon,
  MessageSquare,
  School,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react"

import type { PortalNavGroup, SiteNavLink } from "@/types/app"

export const marketingNav: SiteNavLink[] = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "About", href: "/about" },
  { label: "Tuition", href: "/tuition" },
  { label: "Waitlist", href: "/waitlist" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Create Parent Account", href: "/signup/parent", accent: true },
]

export const authLinks: SiteNavLink[] = [
  { label: "Parent Login", href: "/login/parent" },
  { label: "Admin Login", href: "/login/admin" },
]

export const footerNav = [
  {
    title: "Explore",
    links: marketingNav.filter((item) =>
      ["/programs", "/about", "/tuition", "/faq"].includes(item.href)
    ),
  },
  {
    title: "Get Started",
    links: [
      { label: "Create Parent Account", href: "/signup/parent" },
      { label: "Waitlist", href: "/waitlist" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Portal",
    links: authLinks,
  },
]

export const parentNav: PortalNavGroup[] = [
  {
    title: "Family portal",
    items: [
      {
        title: "Dashboard",
        href: "/parent",
        icon: LayoutDashboardIcon,
        summary: "Today's overview, balance, and quick links",
      },
      {
        title: "Billing",
        href: "/parent/billing",
        icon: CreditCardIcon,
        summary: "Invoices, payments, and saved cards",
      },
      {
        title: "Messages",
        href: "/parent/messages",
        icon: MessageSquare,
        summary: "Conversations with the classroom team",
      },
      {
        title: "Documents",
        href: "/parent/documents",
        icon: FileText,
        summary: "Required forms, immunizations, and signed agreements",
      },
      {
        title: "Calendar",
        href: "/parent/calendar",
        icon: CalendarDays,
        summary: "Closures, family events, and tuition reminders",
      },
      {
        title: "Attendance",
        href: "/parent/attendance",
        icon: ClockIcon,
        summary: "Daily check-ins and absence history",
      },
      {
        title: "Announcements",
        href: "/parent/announcements",
        icon: MegaphoneIcon,
        summary: "Updates from the school",
      },
      {
        title: "Settings",
        href: "/parent/settings",
        icon: Settings,
        summary: "Notification preferences and contact info",
      },
    ],
  },
]

export const adminNav: PortalNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboardIcon,
        summary: "Today's attendance, balances, alerts, and follow-ups at a glance",
      },
    ],
  },
  {
    title: "Enrollment",
    items: [
      {
        title: "Applications",
        href: "/admin/enrollment",
        icon: ClipboardList,
        summary: "Submitted applications and waitlist queue",
      },
      {
        title: "Waitlist",
        href: "/admin/waitlist",
        icon: Hourglass,
        summary: "Families waiting for an open seat",
      },
    ],
  },
  {
    title: "Families & children",
    items: [
      {
        title: "Families",
        href: "/admin/families",
        icon: UsersRound,
        summary: "Family directory with billing and child rosters",
      },
      {
        title: "Children",
        href: "/admin/children",
        icon: Users,
        summary: "Every enrolled child with health and classroom details",
      },
      {
        title: "Classrooms",
        href: "/admin/classrooms",
        icon: School,
        summary: "Capacity, ratios, and classroom assignments",
      },
    ],
  },
  {
    title: "Daily operations",
    items: [
      {
        title: "Attendance",
        href: "/admin/attendance",
        icon: ClockIcon,
        summary: "Mark check-ins, absences, and follow-ups for today",
      },
      {
        title: "Calendar",
        href: "/admin/calendar",
        icon: CalendarDays,
        summary: "Closures, family events, and classroom schedules",
      },
      {
        title: "Documents",
        href: "/admin/documents",
        icon: FileText,
        summary: "Required forms, submissions to review, and expirations",
      },
      {
        title: "Staff",
        href: "/admin/staff",
        icon: UserCog,
        summary: "Educator roster, coverage gaps, and certifications",
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        title: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
        summary: "Family conversation threads",
      },
      {
        title: "Communications hub",
        href: "/admin/communications",
        icon: MailOpen,
        summary: "Threads + announcement drafts in one workspace",
      },
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: MegaphoneIcon,
        summary: "Publish updates to families and classrooms",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Billing",
        href: "/admin/billing",
        icon: CreditCardIcon,
        summary: "Outstanding balances, failed payments, and invoice creation",
      },
      {
        title: "Programs & pricing",
        href: "/admin/rooms",
        icon: GraduationCap,
        summary: "Programs, schedules, and the tuition rate matrix",
      },
      {
        title: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        summary: "Enrollment, attendance, and revenue reports",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        summary: "Center policies, hours, contact info, and integrations",
      },
      {
        title: "Security",
        href: "/admin/security",
        icon: ShieldCheck,
        summary: "Two-factor authentication for your admin account",
      },
      {
        title: "Audit log",
        href: "/admin/audit",
        icon: ClipboardList,
        summary: "Every recorded action across the platform",
      },
    ],
  },
]


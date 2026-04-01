import type { LucideIcon } from "lucide-react"
import {
  BanknoteArrowDownIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FilesIcon,
  HeartHandshakeIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MessageSquareMoreIcon,
  NotebookTabsIcon,
  ShieldCheckIcon,
  UsersIcon,
  UserRoundCheckIcon,
} from "lucide-react"

export type NavLink = {
  label: string
  href: string
}

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export type DashboardNavGroup = {
  title: string
  items: DashboardNavItem[]
}

export const marketingNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "Tuition", href: "/tuition" },
  { label: "About", href: "/about" },
  { label: "Schedule a Tour", href: "/tour" },
]

export const parentNav: DashboardNavGroup[] = [
  {
    title: "Parent portal",
    items: [
      {
        title: "Overview",
        href: "/parent",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Child profile",
        href: "/parent/child",
        icon: HeartHandshakeIcon,
      },
      {
        title: "Messages",
        href: "/parent/messages",
        icon: MessageSquareMoreIcon,
        badge: "3",
      },
      {
        title: "Enrollment",
        href: "/parent/enrollment",
        icon: NotebookTabsIcon,
      },
      {
        title: "Billing",
        href: "/parent/billing",
        icon: CreditCardIcon,
      },
      {
        title: "Forms",
        href: "/parent/forms",
        icon: FilesIcon,
      },
      {
        title: "Calendar",
        href: "/parent/calendar",
        icon: CalendarDaysIcon,
      },
    ],
  },
]

export const adminNav: DashboardNavGroup[] = [
  {
    title: "Operations",
    items: [
      {
        title: "Daily overview",
        href: "/admin",
        icon: HomeIcon,
      },
      {
        title: "Enrollment",
        href: "/admin/enrollment",
        icon: NotebookTabsIcon,
        badge: "12",
      },
      {
        title: "Children",
        href: "/admin/children",
        icon: UserRoundCheckIcon,
      },
      {
        title: "Classrooms",
        href: "/admin/classrooms",
        icon: BookOpenTextIcon,
      },
      {
        title: "Staff",
        href: "/admin/staff",
        icon: UsersIcon,
      },
      {
        title: "Billing",
        href: "/admin/billing",
        icon: BanknoteArrowDownIcon,
      },
      {
        title: "Reports",
        href: "/admin/reports",
        icon: ClipboardListIcon,
      },
    ],
  },
]

export const portalLinks: NavLink[] = [
  { label: "Login", href: "/login" },
]

export const reassurancePoints = [
  "Live updates from classrooms and teachers",
  "Clear tuition, forms, and billing in one place",
  "Calm, mobile-friendly experience for busy families",
]

export const trustLabels = [
  {
    title: "Licensed care",
    detail: "Built around transparent routines, health notes, and family trust.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Family-first communication",
    detail: "Parents see the details that matter without digging through clutter.",
    icon: HeartHandshakeIcon,
  },
]

import {
  CreditCardIcon,
  LayoutDashboardIcon,
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
    title: "Parent Portal",
    items: [
      {
        title: "Dashboard",
        href: "/parent",
        icon: LayoutDashboardIcon,
        summary: "Application progress, checklist, and child enrollment details",
      },
      {
        title: "Overview",
        href: "/parent/billing",
        icon: CreditCardIcon,
        summary: "Enrollment progress, current invoice, and payment history",
      },
    ],
  },
]

export const adminNav: PortalNavGroup[] = [
  {
    title: "Admin Portal",
    items: [
      {
        title: "Enrollments",
        href: "/admin",
        icon: LayoutDashboardIcon,
        summary: "Submitted forms, payment state, and manual approval",
      },
      {
        title: "Programs & Pricing",
        href: "/admin/rooms",
        icon: CreditCardIcon,
        summary: "Manage classrooms, schedules, and tuition rates",
      },
    ],
  },
]

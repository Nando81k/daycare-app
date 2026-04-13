import type { SiteMetadata } from "@/types/app"

export const parentSignUpPageContent = {
  metadata: {
    title: "Parent Sign Up",
    description:
      "Create a parent account to submit enrollment details, review payment status, and track approval.",
    pathname: "/signup/parent",
  } satisfies SiteMetadata,
  eyebrow: "Parent sign up",
  title: "Create your daycare account",
  description:
    "Start with a simple account, then complete your enrollment form and track payment and approval in one small portal.",
}

export const simpleParentDashboardPageContent = {
  metadata: {
    title: "Parent Dashboard",
    description:
      "Parent enrollment dashboard for child applications, required documents, and payment status.",
    pathname: "/parent",
  } satisfies SiteMetadata,
  eyebrow: "Parent dashboard",
  title: "Application progress, documents, and payment in one family workspace.",
  description:
    "Manage child applications, upload required documents, and keep payment status visible without leaving the parent portal.",
}

export const simpleParentEnrollmentPageContent = {
  metadata: {
    title: "Enrollment Form",
    description:
      "Parent enrollment dashboard for guided child applications and document follow-up.",
    pathname: "/parent/enrollment",
  } satisfies SiteMetadata,
  eyebrow: "Enrollment form",
  title: "Complete the enrollment dashboard",
  description:
    "Finish child details, guardian information, required documents, and final review in one guided workspace.",
}

export const simpleParentPaymentPageContent = {
  metadata: {
    title: "Overview",
    description:
      "Parent overview page showing enrollment status, invoice details, and payment history.",
    pathname: "/parent/billing",
  } satisfies SiteMetadata,
  eyebrow: "Overview",
  title: "Your family overview",
  description:
    "See what's due, continue your enrollment, and review past receipts.",
}

export const simpleAdminDashboardPageContent = {
  metadata: {
    title: "Admin Enrollments",
    description:
      "Lightweight admin view for enrollment submissions, payment state, and manual approval.",
    pathname: "/admin",
  } satisfies SiteMetadata,
  eyebrow: "Enrollment review",
  title: "Submitted enrollments and payment status",
  description:
    "Review new enrollment submissions, check whether a family has paid, and approve enrollments manually.",
}

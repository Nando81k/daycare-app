import Link from "next/link"

import { AuthScreen } from "@/components/auth/auth-screen"
import { PortalLoginForm } from "@/components/marketing/portal-login-form"

export function ParentLoginScreen() {
  return (
    <AuthScreen
      imagePosition="left"
      imageSrc="/marketing/creative-table.jpg"
      imageAlt="Two young children work side by side at a colorful preschool table."
      imageCaption="Family portal · 2026"
      imageBadge="No. 02"
      eyebrow="Welcome back"
      title="Sign in to your family portal."
      description="Manage enrollment, billing, and the daily updates from your child's classroom."
      footer={
        <>
          New family?{" "}
          <Link
            href="/signup/parent"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            Begin enrollment
          </Link>
        </>
      }
    >
      <PortalLoginForm portalRole="parent" />
    </AuthScreen>
  )
}

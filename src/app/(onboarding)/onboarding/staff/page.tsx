import { redirect } from "next/navigation"

import { StaffOnboardingWizard } from "@/components/staff/onboarding/staff-onboarding-wizard"
import { getCurrentSession } from "@/lib/auth"
import { getStaffOnboardingForUser } from "@/lib/dal/staff-onboarding"
import { createPageMetadata } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export const metadata = createPageMetadata({
  title: "Staff onboarding",
  description: "Finish your Ambassadors Care staff setup.",
  pathname: "/onboarding/staff",
})

export default async function StaffOnboardingPage() {
  const session = await getCurrentSession()
  if (!session) redirect("/login")
  if (session.user.role === "PARENT") redirect("/parent")

  const bundle = await getStaffOnboardingForUser(session.user.id)

  // No staff profile means an admin invited a portal account that was never
  // linked to a roster row. Drop them at the portal home; the director can fix.
  if (!bundle) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/teacher")
  }

  // Already finished — don't put them through the wizard again.
  if (bundle.progress.status === "COMPLETE") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/teacher")
  }

  return <StaffOnboardingWizard bundle={bundle} userRole={session.user.role} />
}

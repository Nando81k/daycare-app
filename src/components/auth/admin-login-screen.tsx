import { AuthScreen } from "@/components/auth/auth-screen"
import { PortalLoginForm } from "@/components/marketing/portal-login-form"

export function AdminLoginScreen() {
  return (
    <AuthScreen
      imagePosition="right"
      imageSrc="/marketing/storytime-classroom.jpg"
      imageAlt="A teacher reads with children gathered together during story time."
      imageCaption="Staff workspace · Restricted"
      imageBadge="No. 03"
      eyebrow="Staff access"
      title="The admin workspace."
      description="Manage families, classrooms, enrollment, and billing. Sign in with the credentials issued to your role."
    >
      <PortalLoginForm portalRole="admin" />
    </AuthScreen>
  )
}

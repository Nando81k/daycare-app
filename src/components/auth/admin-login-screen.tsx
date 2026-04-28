import { AuthScreen } from "@/components/auth/auth-screen"
import { PortalLoginForm } from "@/components/marketing/portal-login-form"

export function AdminLoginScreen() {
  return (
    <AuthScreen
      imagePosition="right"
      imageSrc="/marketing/cardboard-craft.jpg"
      imageAlt="A teacher works with young children on a cardboard craft project in a bright classroom."
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

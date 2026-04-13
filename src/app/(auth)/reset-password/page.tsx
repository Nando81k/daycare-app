import { PasswordResetRequestPage } from "@/components/auth/password-reset-request-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Reset Password",
  description: "Request a secure password reset link for the parent or admin portal.",
  pathname: "/reset-password",
})

export default function ResetPasswordRequestRoute() {
  return <PasswordResetRequestPage />
}

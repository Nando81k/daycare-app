import { TokenPasswordPage } from "@/components/auth/token-password-page"
import { resetPassword } from "@/app/actions/auth"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Choose A New Password",
  description: "Set a new secure password for your portal account.",
})

export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <TokenPasswordPage
      token={token}
      title="Create a new portal password"
      description="Use the secure link from your email to reset access and rotate your current sessions."
      submitLabel="Update password"
      action={resetPassword}
    />
  )
}

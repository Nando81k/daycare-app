import { acceptPortalInvite } from "@/app/actions/auth"
import { TokenPasswordPage } from "@/components/auth/token-password-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Accept Portal Invite",
  description: "Finish setting up your Ambassadors Care portal access.",
})

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <TokenPasswordPage
      token={token}
      title="Finish setting up your portal access"
      description="Choose the password you will use for your Ambassadors Care portal account."
      submitLabel="Set password and continue"
      action={acceptPortalInvite}
    />
  )
}

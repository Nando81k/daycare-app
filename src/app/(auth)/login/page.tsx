import { UnifiedLoginScreen } from "@/components/auth/unified-login-screen"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Sign in",
  description:
    "Sign in to Ambassadors Care — choose Parent or Admin / Staff to reach the right portal.",
  pathname: "/login",
})

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab = tab === "admin" ? "admin" : "parent"
  return <UnifiedLoginScreen initialTab={initialTab} />
}

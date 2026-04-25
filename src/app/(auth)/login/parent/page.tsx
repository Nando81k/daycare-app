import { ParentLoginScreen } from "@/components/auth/parent-login-screen"
import { loginPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata(loginPageContent.parent.metadata)

export default function ParentLoginPage() {
  return <ParentLoginScreen />
}

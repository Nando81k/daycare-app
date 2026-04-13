import { AuthWorkspace } from "@/components/auth/auth-workspace"
import { loginPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = loginPageContent.parent

export const metadata = createPageMetadata(page.metadata)

export default function ParentLoginPage() {
  return <AuthWorkspace defaultTab="parent-login" />
}

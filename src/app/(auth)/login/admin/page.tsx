import { AuthWorkspace } from "@/components/auth/auth-workspace"
import { loginPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = loginPageContent.admin

export const metadata = createPageMetadata(page.metadata)

export default function AdminLoginPage() {
  return <AuthWorkspace defaultTab="admin-login" />
}

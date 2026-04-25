import { AdminLoginScreen } from "@/components/auth/admin-login-screen"
import { loginPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata(loginPageContent.admin.metadata)

export default function AdminLoginPage() {
  return <AdminLoginScreen />
}

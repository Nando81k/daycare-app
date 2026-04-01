import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { PortalLoginPage } from "@/components/marketing/portal-login-page"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user?.id) {
    redirect("/post-login")
  }

  return <PortalLoginPage />
}

import { redirect } from "next/navigation"

import { requireSession } from "@/lib/dal/auth"

export default async function PostLoginPage() {
  const session = await requireSession()

  redirect(session.user.role === "ADMIN" ? "/admin" : "/parent")
}

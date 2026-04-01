import { redirect } from "next/navigation"

import { AcceptInviteForm } from "@/components/shared/accept-invite-form"

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    redirect("/login")
  }

  return (
    <section className="mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <AcceptInviteForm token={token} />
    </section>
  )
}

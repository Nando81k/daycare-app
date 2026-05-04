import { redirect } from "next/navigation"

export default function AdminWaitlistLegacyPage() {
  redirect("/admin/enrollment?tab=waitlist")
}

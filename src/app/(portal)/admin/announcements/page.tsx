import { redirect } from "next/navigation"

export default function AdminAnnouncementsLegacyPage() {
  redirect("/admin/communications?tab=broadcasts")
}

import type { Metadata } from "next"

import { AdminProgramsPageView } from "@/components/admin/admin-programs-page"
import { getAdminProgramsData } from "@/lib/dal/admin"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Programs & Pricing",
  description: "Manage classrooms, schedules, and tuition rates",
  pathname: "/admin/rooms",
})

export default async function AdminRoomsPage() {
  const data = await getAdminProgramsData()
  return <AdminProgramsPageView {...data} />
}

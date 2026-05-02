import { redirect } from "next/navigation"

import { ParentDashboardPageView } from "@/components/parent/parent-dashboard-page"
import { getParentOverviewData } from "@/lib/dal/parent-overview"

export default async function ParentDashboardPage() {
  const data = await getParentOverviewData()

  if (!data) redirect("/login/parent")

  return <ParentDashboardPageView data={data} />
}

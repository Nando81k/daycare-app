import { notFound } from "next/navigation"

import { ParentChildPageView } from "@/components/parent/parent-child-page"
import { getParentChildPageData } from "@/lib/dal/parent"

export default async function ParentChildPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getParentChildPageData(id)

  if (!data) notFound()

  return (
    <ParentChildPageView
      child={data.child}
      dailyReport={data.dailyReport}
      attendanceHistory={data.attendanceHistory}
    />
  )
}

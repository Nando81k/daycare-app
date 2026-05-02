import { AdminAuditLogPageView } from "@/components/admin/admin-audit-log-page"
import { getAdminAuditData } from "@/lib/dal/admin-audit"

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    action?: string
    subjectType?: string
    page?: string
  }>
}) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number.parseInt(sp.page, 10) || 1) : 1
  const data = await getAdminAuditData({
    query: sp.q,
    action: sp.action,
    subjectType: sp.subjectType,
    page,
  })

  return (
    <AdminAuditLogPageView
      entries={data.entries}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      pageCount={data.pageCount}
      actions={data.actions}
      subjectTypes={data.subjectTypes}
      filters={{
        query: sp.q ?? "",
        action: sp.action ?? "",
        subjectType: sp.subjectType ?? "",
      }}
    />
  )
}

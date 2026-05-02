import { AdminBillingPageView } from "@/components/admin/billing/admin-billing-page"
import { getAdminBillingData } from "@/lib/dal/admin-billing"

export default async function AdminBillingPage() {
  const data = await getAdminBillingData()
  return <AdminBillingPageView data={data} />
}

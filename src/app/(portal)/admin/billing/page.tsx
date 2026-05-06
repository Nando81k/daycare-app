import { AdminBillingPageView } from "@/components/admin/billing/admin-billing-page"
import {
  getAdminBillingData,
  getAdminTuitionPlansData,
} from "@/lib/dal/admin-billing"

export default async function AdminBillingPage() {
  const [data, tuition] = await Promise.all([
    getAdminBillingData(),
    getAdminTuitionPlansData(),
  ])
  return <AdminBillingPageView data={data} tuition={tuition} />
}

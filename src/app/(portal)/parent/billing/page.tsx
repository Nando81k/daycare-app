import { getParentBillingData } from "@/lib/dal/parent"
import { ParentBillingPageView } from "@/components/parent/parent-billing-page"

export default async function BillingPage() {
  const data = await getParentBillingData()
  return <ParentBillingPageView {...data} />
}

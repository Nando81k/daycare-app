import { getParentBillingData } from "@/lib/dal/parent"
import { ParentBillingPageView } from "@/components/parent/parent-billing-page"
import { isStripeCheckoutEnabled } from "@/lib/env"

export default async function BillingPage() {
  const data = await getParentBillingData()
  return (
    <ParentBillingPageView
      {...data}
      checkoutEnabled={isStripeCheckoutEnabled()}
    />
  )
}

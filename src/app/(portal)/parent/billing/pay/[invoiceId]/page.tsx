import { notFound } from "next/navigation"

import { getInvoiceForPayment } from "@/lib/dal/parent"
import { ParentPaymentPageView } from "@/components/parent/parent-payment-page"

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const data = await getInvoiceForPayment(invoiceId)
  if (!data) notFound()
  return <ParentPaymentPageView {...data} />
}

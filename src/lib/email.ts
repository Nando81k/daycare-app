import { Resend } from "resend"

import { brandConfig } from "@/config/brand"
import { prisma } from "@/lib/db"
import { appEnv } from "@/lib/env"
import { formatCurrencyFromCents } from "@/lib/format"

type TransactionalEmail = {
  to: string
  subject: string
  html: string
  text: string
}

let resendClient: Resend | null = null

function getResendClient() {
  if (!appEnv.resendApiKey) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(appEnv.resendApiKey)
  }

  return resendClient
}

export async function sendTransactionalEmail(message: TransactionalEmail) {
  const resend = getResendClient()

  if (!resend) {
    console.info("[email:dev-fallback]", {
      to: message.to,
      subject: message.subject,
      text: message.text,
    })

    return {
      id: `local-email-${Date.now()}`,
      provider: "console",
    }
  }

  const response = await resend.emails.send({
    from: appEnv.resendFromEmail,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })

  if (response.error) {
    throw new Error(response.error.message)
  }

  return {
    id: response.data?.id ?? `resend-${Date.now()}`,
    provider: "resend",
  }
}

export async function sendDunningEmail({
  familyId,
  amountCents,
  invoiceLabel,
  failureReason,
}: {
  familyId: string
  amountCents: number
  invoiceLabel: string
  failureReason: string | null
}) {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      parents: {
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  const recipient = family?.parents.find((p) => p.billingContact === "primary") ?? family?.parents[0]
  const email = recipient?.user.email

  if (!email) {
    console.warn("[email:dunning] no recipient for family", { familyId })
    return null
  }

  const amount = formatCurrencyFromCents(amountCents)
  const subject = `Action needed: payment for ${invoiceLabel} could not be processed`
  const reasonLine = failureReason ? `Stripe reported: ${failureReason}.` : "Your card was declined."
  const text = [
    `Hello ${recipient?.user.name ?? "there"},`,
    "",
    `We were unable to process your ${amount} payment for "${invoiceLabel}".`,
    reasonLine,
    "",
    `Please sign in to your ${brandConfig.name} portal to update your payment method or retry the charge.`,
    `If you need help, reply to this email or contact us at ${brandConfig.supportEmail}.`,
    "",
    `— ${brandConfig.name}`,
  ].join("\n")
  const html = `<p>Hello ${recipient?.user.name ?? "there"},</p>
<p>We were unable to process your <strong>${amount}</strong> payment for &ldquo;${invoiceLabel}&rdquo;. ${reasonLine}</p>
<p>Please sign in to your <strong>${brandConfig.name}</strong> portal to update your payment method or retry the charge. If you need help, reply to this email or contact us at <a href="mailto:${brandConfig.supportEmail}">${brandConfig.supportEmail}</a>.</p>
<p>— ${brandConfig.name}</p>`

  return sendTransactionalEmail({ to: email, subject, html, text })
}

import "server-only"

import { getOptionalEnv } from "@/lib/env"
import { getResend } from "@/lib/resend"

const fallbackFrom = "Abassadors Care <no-reply@abassadorscare.com>"

export async function sendAdminInviteEmail({
  to,
  inviteLink,
  invitedByName,
}: {
  to: string
  inviteLink: string
  invitedByName: string
}) {
  const resend = getResend()

  if (!resend) {
    return { skipped: true as const }
  }

  await resend.emails.send({
    from: getOptionalEnv("RESEND_FROM_EMAIL") ?? fallbackFrom,
    to,
    subject: "You’re invited to Abassadors Care admin access",
    html: `
      <p>Hello,</p>
      <p>${invitedByName} invited you to join Abassadors Care as an admin.</p>
      <p><a href="${inviteLink}">Accept your invite</a></p>
      <p>This link expires in 7 days.</p>
    `,
  })

  return { skipped: false as const }
}

export async function sendApplicationAcknowledgementEmail({
  to,
  parentName,
}: {
  to: string
  parentName: string
}) {
  const resend = getResend()
  if (!resend) {
    return { skipped: true as const }
  }

  await resend.emails.send({
    from: getOptionalEnv("RESEND_FROM_EMAIL") ?? fallbackFrom,
    to,
    subject: "Enrollment application received",
    html: `
      <p>Hi ${parentName},</p>
      <p>We received your enrollment application at Abassadors Care.</p>
      <p>You can track status changes in your parent dashboard.</p>
    `,
  })

  return { skipped: false as const }
}

export async function sendApplicationStatusEmail({
  to,
  statusLabel,
  note,
}: {
  to: string
  statusLabel: string
  note?: string | null
}) {
  const resend = getResend()
  if (!resend) {
    return { skipped: true as const }
  }

  await resend.emails.send({
    from: getOptionalEnv("RESEND_FROM_EMAIL") ?? fallbackFrom,
    to,
    subject: `Application update: ${statusLabel}`,
    html: `
      <p>Your enrollment application status is now <strong>${statusLabel}</strong>.</p>
      ${note ? `<p>Note: ${note}</p>` : ""}
      <p>Open your parent dashboard for full details.</p>
    `,
  })

  return { skipped: false as const }
}

export async function sendDepositInvoiceEmail({
  to,
  invoiceNumber,
  amountCents,
}: {
  to: string
  invoiceNumber: string
  amountCents: number
}) {
  const resend = getResend()
  if (!resend) {
    return { skipped: true as const }
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100)

  await resend.emails.send({
    from: getOptionalEnv("RESEND_FROM_EMAIL") ?? fallbackFrom,
    to,
    subject: `Deposit invoice ${invoiceNumber}`,
    html: `
      <p>Your enrollment was accepted.</p>
      <p>Deposit invoice <strong>${invoiceNumber}</strong> has been issued for <strong>${amount}</strong>.</p>
      <p>Log in to the parent billing area to complete payment.</p>
    `,
  })

  return { skipped: false as const }
}

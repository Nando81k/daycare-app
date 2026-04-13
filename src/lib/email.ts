import { Resend } from "resend"

import { appEnv } from "@/lib/env"

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

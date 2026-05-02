import { createContactLead } from "@/lib/dal/public"
import { consumeRateLimit } from "@/lib/rate-limit"
import { contactFormSchema } from "@/lib/validators/marketing"
import { verifyTurnstileToken } from "@/lib/turnstile"

export async function POST(request: Request) {
  // 5 messages per IP per hour — enough for honest senders, painful for spam.
  const limit = await consumeRateLimit({
    scope: "contact",
    limit: 5,
    windowSec: 60 * 60,
  })
  if (!limit.ok) {
    return Response.json(
      {
        ok: false,
        message: `Too many submissions. Try again in ${limit.retryAfterSec} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    )
  }

  try {
    const payload = (await request.json()) as Record<string, unknown> & {
      turnstileToken?: string
    }
    const captcha = await verifyTurnstileToken(payload.turnstileToken)
    if (!captcha.ok) {
      return Response.json(
        { ok: false, message: "CAPTCHA verification failed. Try again." },
        { status: 400 }
      )
    }

    const values = contactFormSchema.parse(payload)
    await createContactLead(values)
    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 })
    }
    return Response.json(
      { ok: false, message: "Unable to send the message." },
      { status: 500 }
    )
  }
}

import {
  createWaitlistLead,
  getClassroomAvailability,
} from "@/lib/dal/public"
import { consumeRateLimit } from "@/lib/rate-limit"
import { waitlistSchema } from "@/lib/validators/marketing"
import { verifyTurnstileToken } from "@/lib/turnstile"

export async function POST(request: Request) {
  const limit = await consumeRateLimit({
    scope: "waitlist",
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

  // Auto-close the waitlist when there are still seats available — families
  // should enroll directly instead. Mirrors the public-page state and acts as
  // defense-in-depth against direct API submissions.
  const availability = await getClassroomAvailability()
  if (availability.hasOpenSeats) {
    return Response.json(
      {
        ok: false,
        message:
          "The waitlist is closed — we currently have open spots in one or more classrooms. Please create a parent account to start enrollment.",
      },
      { status: 409 }
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

    const values = waitlistSchema.parse(payload)
    await createWaitlistLead(values)
    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 })
    }
    return Response.json(
      { ok: false, message: "Unable to submit the waitlist request." },
      { status: 500 }
    )
  }
}

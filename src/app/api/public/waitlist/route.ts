import { createWaitlistLead } from "@/lib/dal/public"
import { waitlistSchema } from "@/lib/validators/marketing"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const values = waitlistSchema.parse(payload)

    await createWaitlistLead(values)

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 })
    }

    return Response.json({ ok: false, message: "Unable to submit the waitlist request." }, { status: 500 })
  }
}

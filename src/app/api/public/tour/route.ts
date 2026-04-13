import { tourRequestSchema } from "@/lib/validators/marketing"
import { createTourLead } from "@/lib/dal/public"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const values = tourRequestSchema.parse(payload)

    await createTourLead(values)

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 })
    }

    return Response.json({ ok: false, message: "Unable to submit the tour request." }, { status: 500 })
  }
}

import { createContactLead } from "@/lib/dal/public"
import { contactFormSchema } from "@/lib/validators/marketing"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const values = contactFormSchema.parse(payload)

    await createContactLead(values)

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ ok: false, message: error.message }, { status: 400 })
    }

    return Response.json({ ok: false, message: "Unable to send the message." }, { status: 500 })
  }
}

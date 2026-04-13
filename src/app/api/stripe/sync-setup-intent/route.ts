import { syncSetupIntent } from "@/lib/billing"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PARENT") {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const body = (await request.json()) as {
    setupIntentId?: string
  }

  if (!body.setupIntentId) {
    return Response.json({ error: "Setup intent is required." }, { status: 400 })
  }

  try {
    const result = await syncSetupIntent(body.setupIntentId)
    return Response.json({ result })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not sync setup intent.",
      },
      {
        status: 400,
      }
    )
  }
}

import { runAutopaySweep } from "@/lib/billing"
import { appEnv } from "@/lib/env"

function isAuthorized(request: Request) {
  const bearer = request.headers.get("authorization")

  if (!appEnv.cronSecret) {
    return false
  }

  return bearer === `Bearer ${appEnv.cronSecret}`
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const results = await runAutopaySweep()
    return Response.json({
      processed: results.length,
      results,
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Autopay sweep failed.",
      },
      {
        status: 400,
      }
    )
  }
}

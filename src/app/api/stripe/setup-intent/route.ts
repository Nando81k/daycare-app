import { createFamilySetupIntent } from "@/lib/billing"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PARENT") {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const body = (await request.json()) as {
    familyId?: string
  }

  const profile = await prisma.parentProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      familyId: true,
    },
  })

  if (!profile || body.familyId !== profile.familyId) {
    return Response.json({ error: "Family billing profile not found." }, { status: 404 })
  }

  try {
    const setupIntent = await createFamilySetupIntent(profile.familyId)
    return Response.json(setupIntent)
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not create setup intent.",
      },
      {
        status: 400,
      }
    )
  }
}

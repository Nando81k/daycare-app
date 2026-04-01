import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"

import { auth } from "@/auth"

export async function POST(request: Request): Promise<Response> {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            role: session.user.role,
          }),
        }
      },
      onUploadCompleted: async () => {},
    })

    return Response.json(jsonResponse)
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Upload failed.",
      }),
      { status: 400 }
    )
  }
}

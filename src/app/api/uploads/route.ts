import { type HandleUploadBody, handleUpload } from "@vercel/blob/client"

import { getCurrentUser } from "@/lib/auth"
import {
  appEnv,
  isBlobConfigured,
} from "@/lib/env"
import {
  documentUploadConstraints,
  photoUploadConstraints,
} from "@/lib/blob"

type UploadClientPayload = {
  scope: "document" | "daily-report-photo"
}

export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return Response.json(
      {
        error: "Vercel Blob is not configured for this environment.",
      },
      {
        status: 503,
      }
    )
  }

  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      {
        error: "You must be signed in to upload files.",
      },
      {
        status: 401,
      }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const response = await handleUpload({
      token: appEnv.blobReadWriteToken ?? undefined,
      request,
      body,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = clientPayload ? (JSON.parse(clientPayload) as UploadClientPayload) : null

        if (!payload) {
          throw new Error("Missing upload payload.")
        }

        if (payload.scope === "document" && user.role !== "PARENT" && user.role !== "ADMIN") {
          throw new Error("Only parent or admin users can upload documents.")
        }

        if (payload.scope === "daily-report-photo" && user.role !== "ADMIN") {
          throw new Error("Only admin users can upload child photos.")
        }

        const constraints =
          payload.scope === "document" ? documentUploadConstraints : photoUploadConstraints

        return {
          allowedContentTypes: constraints.allowedContentTypes,
          maximumSizeInBytes: constraints.maxBytes,
          validUntil: Date.now() + 60 * 60 * 1000,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            scope: payload.scope,
            userId: user.id,
          }),
        }
      },
      onUploadCompleted: async () => {},
    })

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed."

    return Response.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    )
  }
}

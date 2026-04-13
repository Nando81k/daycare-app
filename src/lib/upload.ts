"use client"

export type UploadResult = {
  pathname: string
  url: string
  downloadUrl: string
  contentType: string
}

export function isUploadEnabled(): boolean {
  const provider = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER
  return provider === "local" || provider === "blob"
}

export async function uploadFile(
  pathname: string,
  file: File,
  options: { access: "public" | "private"; scope: string },
): Promise<UploadResult> {
  const provider = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER

  if (provider === "local") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("pathname", pathname)
    formData.append("scope", options.scope)

    const response = await fetch("/api/uploads/local", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Upload failed.")
    }

    return response.json() as Promise<UploadResult>
  }

  if (provider === "blob") {
    const { upload } = await import("@vercel/blob/client")
    const result = await upload(pathname, file, {
      access: options.access,
      handleUploadUrl: "/api/uploads",
      clientPayload: JSON.stringify({ scope: options.scope }),
    })

    return {
      pathname: result.pathname,
      url: result.url,
      downloadUrl: result.downloadUrl,
      contentType: result.contentType,
    }
  }

  throw new Error("File uploads are not configured in this environment.")
}

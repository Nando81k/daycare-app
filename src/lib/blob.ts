import { del } from "@vercel/blob"

import { appEnv, isBlobConfigured } from "@/lib/env"

const uploadPaths = {
  document(documentId: string, fileName: string) {
    return `documents/${documentId}/${slugifyFileName(fileName)}`
  },
  dailyReportPhoto(childSlug: string, fileName: string) {
    return `daily-reports/${childSlug}/${Date.now()}-${slugifyFileName(fileName)}`
  },
}

export function slugifyFileName(fileName: string) {
  const lastDot = fileName.lastIndexOf(".")
  const extension = lastDot > -1 ? fileName.slice(lastDot).toLowerCase() : ""
  const name = lastDot > -1 ? fileName.slice(0, lastDot) : fileName

  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}${extension}`
}

export function getDocumentUploadPath(documentId: string, fileName: string) {
  return uploadPaths.document(documentId, fileName)
}

export function getDailyReportPhotoUploadPath(childSlug: string, fileName: string) {
  return uploadPaths.dailyReportPhoto(childSlug, fileName)
}

export async function deleteBlobIfConfigured(pathnameOrUrl?: string | null) {
  if (!pathnameOrUrl) {
    return
  }

  const provider = process.env.NEXT_PUBLIC_UPLOAD_PROVIDER

  if (provider === "local") {
    const { resolve, sep } = await import("node:path")
    const { unlink } = await import("node:fs/promises")
    const uploadsRoot = resolve(process.cwd(), "public", "uploads")
    const resolvedPath = resolve(uploadsRoot, pathnameOrUrl.replace(/\.\.\//g, ""))

    if (resolvedPath.startsWith(uploadsRoot + sep)) {
      await unlink(resolvedPath).catch(() => {})
    }
    return
  }

  if (!isBlobConfigured()) {
    return
  }

  await del(pathnameOrUrl, {
    token: appEnv.blobReadWriteToken ?? undefined,
  })
}

export const documentUploadConstraints = {
  maxBytes: 10 * 1024 * 1024,
  allowedContentTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
}

export const photoUploadConstraints = {
  maxBytes: 8 * 1024 * 1024,
  allowedContentTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
  ],
}

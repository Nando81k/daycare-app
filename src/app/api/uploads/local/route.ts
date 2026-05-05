import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { getCurrentUser } from "@/lib/auth"
import { documentUploadConstraints, photoUploadConstraints } from "@/lib/blob"

const VALID_PATH_PREFIXES = [
  "documents/",
  "daily-reports/",
  "staff-documents/",
  "staff-photos/",
]

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      { error: "You must be signed in to upload files." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const pathname = formData.get("pathname") as string | null
  const scope = formData.get("scope") as string | null

  if (!file || !pathname || !scope) {
    return Response.json(
      { error: "Missing file, pathname, or scope." },
      { status: 400 },
    )
  }

  // ---------- authorisation ----------
  // Staff onboarding documents (staff-documents/, staff-photos/) and parent
  // forms (documents/) all use scope=document or scope=photo. Permit any
  // signed-in role for these — the server actions enforce ownership.
  if (scope === "document" && !user.role) {
    return Response.json(
      { error: "Sign in to upload documents." },
      { status: 401 },
    )
  }

  if (scope === "daily-report-photo" && user.role !== "ADMIN") {
    return Response.json(
      { error: "Only admin users can upload child photos." },
      { status: 403 },
    )
  }

  // ---------- file constraints ----------
  const constraints =
    scope === "document" ? documentUploadConstraints : photoUploadConstraints

  if (file.size > constraints.maxBytes) {
    return Response.json(
      {
        error: `File too large. Maximum size is ${constraints.maxBytes / (1024 * 1024)} MB.`,
      },
      { status: 400 },
    )
  }

  if (!constraints.allowedContentTypes.includes(file.type)) {
    return Response.json(
      { error: `File type "${file.type}" is not allowed.` },
      { status: 400 },
    )
  }

  // ---------- path safety ----------
  const sanitized = pathname.replace(/\.\./g, "").replace(/^\/+/, "")

  if (!VALID_PATH_PREFIXES.some((prefix) => sanitized.startsWith(prefix))) {
    return Response.json({ error: "Invalid upload path." }, { status: 400 })
  }

  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads")
  const resolvedPath = path.resolve(uploadsRoot, sanitized)

  if (!resolvedPath.startsWith(uploadsRoot + path.sep)) {
    return Response.json({ error: "Invalid upload path." }, { status: 400 })
  }

  // ---------- write to disk ----------
  await mkdir(path.dirname(resolvedPath), { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(resolvedPath, buffer)

  const url = `/uploads/${sanitized}`

  return Response.json({
    pathname: sanitized,
    url,
    downloadUrl: url,
    contentType: file.type,
  })
}

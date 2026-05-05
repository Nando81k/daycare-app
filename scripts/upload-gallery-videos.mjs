// One-shot uploader for the public gallery videos. Reads BLOB_READ_WRITE_TOKEN
// from .env.blob.tmp (pull via `vercel env pull` first), uploads every .mp4
// in the source dir to the `gallery/` prefix on Vercel Blob, and prints the
// public URLs ready to paste into src/config/gallery.ts.

import { readdirSync, readFileSync, statSync } from "node:fs"
import { basename, join } from "node:path"
import { put } from "@vercel/blob"

const SRC_DIR = "/Users/nando/Desktop/Ambassadors-care folder"
const ENV_FILE = "/Users/nando/daycare-app/.env.blob.tmp"

const envText = readFileSync(ENV_FILE, "utf8")
const tokenLine = envText.split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="))
if (!tokenLine) throw new Error("BLOB_READ_WRITE_TOKEN not found in env file")
const token = tokenLine.replace(/^BLOB_READ_WRITE_TOKEN=/, "").replace(/^"|"$/g, "")

const files = readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith(".mp4"))
console.log(`Found ${files.length} mp4 files`)

const results = []
for (const name of files) {
  const path = join(SRC_DIR, name)
  const size = statSync(path).size
  const sanitized = name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const pathname = `gallery/${sanitized}`
  process.stdout.write(`  ${pathname} (${(size / 1024 / 1024).toFixed(1)} MB) ... `)
  const blob = await put(pathname, readFileSync(path), {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "video/mp4",
    allowOverwrite: true,
  })
  console.log("OK")
  results.push({ name: sanitized, url: blob.url, sizeBytes: size })
}

console.log("\n=== Public URLs ===")
for (const r of results) console.log(`${r.name}: ${r.url}`)

console.log("\n=== Paste into src/config/gallery.ts ===")
console.log(JSON.stringify(results, null, 2))

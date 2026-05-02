import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lightweight health probe for uptime monitors.
 * Returns 200 with `db: "ok"` when Postgres responds, 503 when it doesn't.
 * Intentionally cheap — a single `SELECT 1` so it can be hit every minute.
 */
export async function GET() {
  const startedAt = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json(
      {
        status: "ok",
        db: "ok",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    return Response.json(
      {
        status: "error",
        db: "down",
        error: error instanceof Error ? error.message : "Unknown DB error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    )
  }
}

import "dotenv/config"

import { defineConfig } from "prisma/config"

// Read DATABASE_URL from process.env directly so `prisma generate` can run
// at build time (e.g. on Vercel) even when the URL isn't set. Runtime ops
// that actually need a connection (migrate deploy, db push, queries) will
// surface a clear error if the var is missing.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
})

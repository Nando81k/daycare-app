import type { DefaultSession } from "next-auth"

type Role = "PARENT" | "ADMIN"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      householdId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
    householdId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
    householdId?: string | null
  }
}

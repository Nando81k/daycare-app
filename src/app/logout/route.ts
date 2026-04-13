import { NextResponse } from "next/server"

import { destroySession } from "@/lib/auth"

export async function GET(request: Request) {
  await destroySession()

  const { searchParams } = new URL(request.url)
  const nextPath = searchParams.get("next")
  const redirectPath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/"

  return NextResponse.redirect(new URL(redirectPath, request.url))
}

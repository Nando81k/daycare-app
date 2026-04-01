import { NextResponse } from "next/server"

import { auth } from "@/auth"

function isInRoute(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const session = req.auth

  const isParentRoute = isInRoute(pathname, "/parent")
  const isAdminRoute = isInRoute(pathname, "/admin")
  const isProtectedRoute = isParentRoute || isAdminRoute
  const isLoginRoute = isInRoute(pathname, "/login") || isInRoute(pathname, "/signup")

  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session?.user && isLoginRoute) {
    const redirectPath = session.user.role === "ADMIN" ? "/admin" : "/parent"
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl))
  }

  if (session?.user && isAdminRoute && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/parent", req.nextUrl))
  }

  if (session?.user && isParentRoute && session.user.role !== "PARENT") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}

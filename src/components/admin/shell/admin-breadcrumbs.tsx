"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { adminNav } from "@/config/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const NAV_LABEL_BY_HREF = new Map(
  adminNav.flatMap((group) =>
    group.items.map((item) => [item.href, item.title] as const)
  )
)

const DYNAMIC_SEGMENT_LABEL: Record<string, string> = {
  "/admin/enrollment/[id]": "Application detail",
}

function titleCase(segment: string) {
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

type Crumb = {
  label: string
  href: string
  isLast: boolean
}

function buildCrumbs(pathname: string): Crumb[] {
  // Strip query/hash if any.
  const pathOnly = pathname.split("?")[0].split("#")[0]
  const parts = pathOnly.split("/").filter(Boolean)

  // Always start at /admin → "Dashboard"
  if (parts[0] !== "admin") return []

  const crumbs: Crumb[] = [
    {
      label: NAV_LABEL_BY_HREF.get("/admin") ?? "Dashboard",
      href: "/admin",
      isLast: parts.length === 1,
    },
  ]

  let acc = "/admin"
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i]
    acc = `${acc}/${segment}`

    // If it looks like a dynamic id (cuid-style), use the parent route's label map.
    const looksLikeId =
      /^[a-z0-9]{20,}$/i.test(segment) || /^c[a-z0-9]{24}$/i.test(segment)

    let label: string
    if (looksLikeId) {
      const parentRoute = `/admin/${parts.slice(1, i).join("/")}/[id]`
      label =
        DYNAMIC_SEGMENT_LABEL[parentRoute] ??
        DYNAMIC_SEGMENT_LABEL[`${acc.replace(segment, "[id]")}`] ??
        "Detail"
    } else {
      label = NAV_LABEL_BY_HREF.get(acc) ?? titleCase(segment)
    }

    crumbs.push({
      label,
      href: acc,
      isLast: i === parts.length - 1,
    })
  }

  return crumbs
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BellDotIcon, SearchIcon } from "lucide-react"

import { adminNav, parentNav, type DashboardNavGroup } from "@/data/navigation"
import { childProfile } from "@/data/parent"
import { AppLogo } from "@/components/shared/app-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

function isActive(pathname: string, href: string) {
  if (href === "/parent" || href === "/admin") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar({ kind }: { kind: "parent" | "admin" }) {
  const pathname = usePathname()
  const groups: DashboardNavGroup[] = kind === "parent" ? parentNav : adminNav
  const footerCopy =
    kind === "parent"
      ? {
          title: childProfile.name,
          subtitle: childProfile.classroom,
          fallback: "MJ",
        }
      : {
          title: "Operations Desk",
          subtitle: "Abassadors Care leadership",
          fallback: "AC",
        }

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="md:pt-4"
    >
      <SidebarHeader className="gap-4 px-4 py-4">
        <div className="rounded-[1.5rem] border border-sidebar-border/80 bg-background/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <AppLogo compact href={kind === "parent" ? "/parent" : "/admin"} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {kind === "parent" ? "Family dashboard" : "Center operations"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {kind === "parent"
              ? "Stay close to the day without interrupting it."
              : "Run the center with clarity and fewer loose ends."}
          </p>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput placeholder="Search" className="h-10 rounded-2xl pl-9" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href)}
                      tooltip={item.title}
                      size="lg"
                      className="rounded-[1.1rem] px-3 text-[0.95rem] data-[active=true]:shadow-[0_18px_32px_-24px_rgba(31,64,62,0.65)]"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="right-3 rounded-full bg-background/80 px-2">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="rounded-[1.5rem] border border-sidebar-border/80 bg-background/78 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border/60 bg-secondary">
              <AvatarFallback>{footerCopy.fallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {footerCopy.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {footerCopy.subtitle}
              </p>
            </div>
            <BellDotIcon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

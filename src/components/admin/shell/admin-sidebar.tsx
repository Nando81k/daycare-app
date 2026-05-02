"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink, LogOut } from "lucide-react"

import { adminNav } from "@/config/navigation"
import { brandConfig } from "@/config/brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="border-b border-border/40">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-1.5 py-1 group-data-[collapsible=icon]:justify-center"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-[linear-gradient(180deg,var(--color-brand-blue),var(--color-navy))] text-[0.7rem] font-bold tracking-[0.16em] text-primary-foreground shadow-[0_12px_30px_-18px_rgba(13,59,120,0.55)]">
            AC
          </span>
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-[0.98rem] text-foreground truncate">
              {brandConfig.name}
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Admin workspace
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActiveRoute(pathname, item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Public site">
              <Link href="/" target="_blank" rel="noreferrer">
                <ExternalLink />
                <span>Public site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign out"
              className="text-muted-foreground hover:text-destructive"
            >
              <Link href="/logout">
                <LogOut />
                <span>Sign out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  type LucideIcon,
} from "lucide-react"

import { brandConfig } from "@/config/brand"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  title: string
  icon: LucideIcon
  summary: string
}

const NAV: NavItem[] = [
  {
    href: "/teacher",
    title: "Dashboard",
    icon: LayoutDashboard,
    summary: "Today's classroom roster + status",
  },
  {
    href: "/teacher/attendance",
    title: "Attendance",
    icon: CalendarCheck,
    summary: "Mark check-in / check-out per child",
  },
  {
    href: "/teacher/daily-reports",
    title: "Daily reports",
    icon: ClipboardList,
    summary: "Post today's report for each child",
  },
  {
    href: "/teacher/messages",
    title: "Messages",
    icon: MessageSquare,
    summary: "Chat with families in your classroom",
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/teacher") return pathname === "/teacher"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function TeacherTopbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="portal-shell-container flex h-16 items-center gap-4 md:h-20">
        <Link
          href="/teacher"
          className="flex items-center gap-3"
          aria-label="Teacher portal home"
        >
          <Image
            src="/branding/ac-logo-icon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 shrink-0 rounded-[0.85rem] shadow-[0_12px_30px_-18px_rgba(13,59,120,0.55)]"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span
              className="font-heading text-[1.1rem]"
              style={{ color: "var(--navy)" }}
            >
              {brandConfig.shortName}
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Teacher portal
            </span>
          </span>
        </Link>

        <nav
          aria-label="Teacher portal"
          className="ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex"
        >
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-primary-foreground shadow-(--shadow-soft)"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/logout"
            className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-destructive md:inline-flex md:items-center md:gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[18rem] flex-col gap-0 p-0"
            >
              <SheetHeader className="border-b border-border/60 px-5 py-4">
                <SheetTitle
                  className="text-base font-heading"
                  style={{ color: "var(--navy)" }}
                >
                  {brandConfig.shortName}
                </SheetTitle>
                <SheetDescription>Teacher portal navigation</SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Teacher portal mobile"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
              >
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active = isActive(pathname, item.href)
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="flex flex-col">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              active
                                ? "text-primary-foreground/85"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.summary}
                          </span>
                        </span>
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
              <div className="border-t border-border/60 px-3 py-3">
                <SheetClose asChild>
                  <Link
                    href="/logout"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

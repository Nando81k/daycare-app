"use client"

import { startTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { ParentSignUpForm } from "@/components/marketing/parent-sign-up-form"
import { PortalLoginForm } from "@/components/marketing/portal-login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const tabToPath = {
  "parent-login": "/login/parent",
  "parent-signup": "/signup/parent",
  "admin-login": "/login/admin",
} as const

const pathToTab = {
  "/login/parent": "parent-login",
  "/signup/parent": "parent-signup",
  "/login/admin": "admin-login",
} as const

const tabMeta = {
  "parent-login": {
    label: "Parent",
    title: "Welcome back",
    description: "Sign in to manage your family's enrollment and billing.",
  },
  "parent-signup": {
    label: "Sign up",
    title: "Join our community",
    description: "Create an account to begin enrollment for your family.",
  },
  "admin-login": {
    label: "Admin",
    title: "Staff portal",
    description: "Sign in to manage classrooms, families, and enrollment.",
  },
} as const

export type AuthWorkspaceTab = keyof typeof tabToPath

export function AuthWorkspaceTabs({ defaultTab }: { defaultTab: AuthWorkspaceTab }) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = pathToTab[pathname as keyof typeof pathToTab] ?? defaultTab
  const currentMeta = tabMeta[currentTab]

  function handleValueChange(nextTab: string) {
    const nextPath = tabToPath[nextTab as AuthWorkspaceTab]

    if (!nextPath || nextPath === pathname) {
      return
    }

    startTransition(() => {
      router.push(nextPath)
    })
  }

  return (
    <div className={cn("w-full", currentTab === "parent-signup" ? "max-w-md" : "max-w-sm")}>
      <Tabs value={currentTab} onValueChange={handleValueChange} className="gap-8">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-full p-1">
          {(Object.keys(tabToPath) as AuthWorkspaceTab[]).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-9 rounded-full px-4 text-sm font-medium"
            >
              {tabMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{currentMeta.title}</h1>
          <p className="max-w-xs text-sm text-balance text-muted-foreground">
            {currentMeta.description}
          </p>
        </div>

        <TabsContent value="parent-login" className="mt-0">
          <PortalLoginForm portalRole="parent" />
        </TabsContent>

        <TabsContent value="parent-signup" className="mt-0">
          <ParentSignUpForm />
        </TabsContent>

        <TabsContent value="admin-login" className="mt-0">
          <PortalLoginForm portalRole="admin" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

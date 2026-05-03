"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthScreen } from "@/components/auth/auth-screen"
import { PortalLoginForm } from "@/components/marketing/portal-login-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Tab = "parent" | "admin"

const COPY: Record<
  Tab,
  { eyebrow: string; title: string; description: string }
> = {
  parent: {
    eyebrow: "Welcome back",
    title: "Sign in to your family portal.",
    description:
      "Manage enrollment, billing, and the daily updates from your child's classroom.",
  },
  admin: {
    eyebrow: "Staff access",
    title: "The admin workspace.",
    description:
      "Manage families, classrooms, enrollment, and billing. Sign in with the credentials issued to your role.",
  },
}

export function UnifiedLoginScreen({
  initialTab = "parent",
}: {
  initialTab?: Tab
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)
  const copy = COPY[tab]

  const handleTabChange = (next: string) => {
    const nextTab = next === "admin" ? "admin" : "parent"
    setTab(nextTab)
    const url = nextTab === "admin" ? "/login?tab=admin" : "/login"
    router.replace(url, { scroll: false })
  }

  return (
    <AuthScreen
      imagePosition="left"
      imageSrc="/marketing/creative-table.jpg"
      imageAlt="Two young children work side by side at a colorful preschool table."
      imageCaption="Ambassadors Care · 2026"
      imageBadge={tab === "admin" ? "No. 03" : "No. 02"}
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      footer={
        tab === "parent" ? (
          <>
            New family?{" "}
            <Link
              href="/signup/parent"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              Begin enrollment
            </Link>
          </>
        ) : (
          <>Need access? Ask the director to invite you from the Staff page.</>
        )
      }
    >
      <Tabs value={tab} onValueChange={handleTabChange} className="mb-8 gap-0">
        <TabsList variant="line" className="w-full p-0">
          <TabsTrigger value="parent">Parent</TabsTrigger>
          <TabsTrigger value="admin">Admin / Staff</TabsTrigger>
        </TabsList>
      </Tabs>

      <PortalLoginForm key={tab} portalRole={tab} />
    </AuthScreen>
  )
}

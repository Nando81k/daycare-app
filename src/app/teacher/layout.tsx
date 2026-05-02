import type * as React from "react"

import { TeacherTopbar } from "@/components/teacher/shell/teacher-topbar"
import { requireRole } from "@/lib/auth"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("TEACHER")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TeacherTopbar />
      <main className="portal-shell-container flex-1 py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}

import type * as React from "react"

import { AuthScreen } from "@/components/auth/auth-screen"

type AuthStandalonePageProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthStandalonePage({
  title,
  description,
  children,
}: AuthStandalonePageProps) {
  return (
    <AuthScreen
      imagePosition="left"
      imageSrc="/marketing/storytime-classroom.jpg"
      imageAlt="A teacher reads with children gathered together during story time."
      imageCaption="Account & access"
      imageBadge="No. 05"
      eyebrow="Account"
      title={title}
      description={description}
    >
      {children}
    </AuthScreen>
  )
}

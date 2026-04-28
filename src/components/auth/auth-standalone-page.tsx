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
      imageSrc="/marketing/focused-markers.jpg"
      imageAlt="A young child sits on the floor concentrating on a drawing with markers."
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

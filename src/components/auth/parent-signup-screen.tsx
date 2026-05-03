import Link from "next/link"

import { AuthScreen } from "@/components/auth/auth-screen"
import { ParentSignUpForm } from "@/components/marketing/parent-sign-up-form"

export function ParentSignUpScreen() {
  return (
    <AuthScreen
      imagePosition="left"
      imageSrc="/marketing/discovery-toys.jpg"
      imageAlt="A young girl explores a colorful learning toy in a bright preschool room."
      imageCaption="Now enrolling · Sept 2026"
      imageBadge="No. 04"
      eyebrow="Begin enrollment"
      title="Create your family account."
      description="One short form. Once your account is set, the enrollment wizard handles the rest at your pace."
      contentClassName="py-8"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ParentSignUpForm />
    </AuthScreen>
  )
}

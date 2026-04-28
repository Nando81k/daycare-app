import Link from "next/link"

import { AuthScreen } from "@/components/auth/auth-screen"
import { ParentSignUpForm } from "@/components/marketing/parent-sign-up-form"

const SIGNUP_NOTES = [
  {
    title: "Programs by age",
    body: "Preschool, Pre-K, and Junior Kindergarten — pick the right fit for your child.",
  },
  {
    title: "Daily portal",
    body: "Photos, notes, and milestones from teachers in a single quiet feed.",
  },
  {
    title: "Affordable tuition",
    body: "Clear monthly costs with predictable billing and no surprises.",
  },
] as const

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
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login/parent"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ParentSignUpForm />

      <ul className="mt-12 grid gap-6 border-t border-border/60 pt-8 sm:grid-cols-3">
        {SIGNUP_NOTES.map((note, index) => (
          <li key={note.title}>
            <p className="text-xs uppercase tracking-[0.22em] text-accent">
              0{index + 1}
            </p>
            <p className="mt-3 font-heading text-base text-foreground">{note.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
          </li>
        ))}
      </ul>
    </AuthScreen>
  )
}

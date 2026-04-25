import { ParentSignUpScreen } from "@/components/auth/parent-signup-screen"
import { parentSignUpPageContent } from "@/data/minimal-portal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata(parentSignUpPageContent.metadata)

export default function ParentSignUpPage() {
  return <ParentSignUpScreen />
}

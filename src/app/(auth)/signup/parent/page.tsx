import { AuthWorkspace } from "@/components/auth/auth-workspace"
import { parentSignUpPageContent } from "@/data/minimal-portal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata(parentSignUpPageContent.metadata)

export default function ParentSignUpPage() {
  return <AuthWorkspace defaultTab="parent-signup" />
}

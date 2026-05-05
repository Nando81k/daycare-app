import { CheckCircle2 } from "lucide-react"

import { StaffDocumentUploadCard } from "@/components/staff/onboarding/staff-document-upload-card"
import type { StaffDocument } from "@prisma/client"

export function StepDocuments({ documents }: { documents: StaffDocument[] }) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
        <p className="mt-3 font-semibold text-foreground">No documents required</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The director hasn&apos;t requested any documents from you. You can continue.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-7 text-muted-foreground">
        Upload each document below. PDFs and clear photos both work. We&apos;ll let the
        director know each one is ready for review — you don&apos;t need to wait for approval
        before continuing the wizard.
      </p>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <StaffDocumentUploadCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  )
}

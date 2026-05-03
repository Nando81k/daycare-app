"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PenLineIcon } from "lucide-react"

import { submitParentDocumentTypedSignature } from "@/app/actions/parent"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialMutationState } from "@/lib/action-state"

export function ParentTypedSignatureDialog({
  documentId,
  documentTitle,
  defaultName,
}: {
  documentId: string
  documentTitle: string
  defaultName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [state, formAction, isPending] = useActionState(
    submitParentDocumentTypedSignature,
    initialMutationState
  )

  useEffect(() => {
    if (!state.success) {
      return
    }

    /* eslint-disable react-hooks/set-state-in-effect -- mirrors the
       useActionState success → close-and-refresh pattern used in
       parent-messages-page.tsx; setState here is the reset, not an
       intermediate render trigger. */
    setOpen(false)
    setAcknowledged(false)
    /* eslint-enable react-hooks/set-state-in-effect */
    router.refresh()
  }, [router, state.success])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PenLineIcon className="h-3.5 w-3.5" />
          Type to sign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign {documentTitle}</DialogTitle>
          <DialogDescription>
            Type your full legal name below. The school will see your typed
            signature, the date, and your IP address as the verification
            record.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="documentId" value={documentId} />

          {state.error ? (
            <AlertBanner
              tone="destructive"
              title="Signature not saved"
              description={state.error}
            />
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor={`signer-${documentId}`} className="text-xs">
              Your full name
            </Label>
            <Input
              id={`signer-${documentId}`}
              name="signerName"
              defaultValue={defaultName}
              placeholder="e.g. Olivia Harper"
              autoComplete="name"
            />
            {state.fieldErrors?.signerName ? (
              <p className="text-xs text-red-700">
                {state.fieldErrors.signerName}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/55 bg-muted/30 p-3">
            <Checkbox
              id={`ack-${documentId}`}
              name="acknowledged"
              checked={acknowledged}
              onCheckedChange={(value) => setAcknowledged(value === true)}
            />
            <Label
              htmlFor={`ack-${documentId}`}
              className="text-sm leading-6 text-foreground"
            >
              I am the parent or authorized guardian and this typed name is my
              legally binding signature.
            </Label>
          </div>
          {state.fieldErrors?.acknowledged ? (
            <p className="text-xs text-red-700">
              {state.fieldErrors.acknowledged}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !acknowledged}>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Sign and submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

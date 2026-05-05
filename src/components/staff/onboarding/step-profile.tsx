"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2 } from "lucide-react"

import { saveStaffProfileStep } from "@/app/actions/staff-onboarding"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { initialMutationState } from "@/lib/action-state"
import { getStaffPhotoUploadPath } from "@/lib/blob"
import { isUploadEnabled, uploadFile } from "@/lib/upload"
import type { StaffOnboardingBundle } from "@/lib/dal/staff-onboarding"

export function StepProfile({
  bundle,
  onSaved,
}: {
  bundle: StaffOnboardingBundle
  onSaved: () => void
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    saveStaffProfileStep,
    initialMutationState,
  )

  const [photoUrl, setPhotoUrl] = useState<string | null>(
    bundle.staffProfile.photoBlobUrl ?? null,
  )
  const [photoPathname, setPhotoPathname] = useState<string | null>(
    bundle.staffProfile.photoBlobPathname ?? null,
  )
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onSaved()
    }
  }, [state.success, router, onSaved])

  async function handlePhotoChange(file: File | null) {
    setPhotoError(null)
    if (!file) return
    if (!isUploadEnabled()) {
      setPhotoError("File uploads are not configured in this environment yet.")
      return
    }
    try {
      setPhotoUploading(true)
      const result = await uploadFile(
        getStaffPhotoUploadPath(bundle.staffProfile.id, file.name),
        file,
        { access: "public", scope: "photo" },
      )
      setPhotoUrl(result.url)
      setPhotoPathname(result.pathname)
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Photo upload failed.")
    } finally {
      setPhotoUploading(false)
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <AlertBanner tone="destructive" title="Could not save profile" description={state.error} />
      ) : null}

      <div className="grid gap-5 md:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-32 overflow-hidden rounded-full bg-muted ring-2 ring-border/60">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Your profile photo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
          <label className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-primary underline-offset-4 hover:underline">
            {photoUploading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </span>
            ) : photoUrl ? (
              "Change photo"
            ) : (
              "Add a photo"
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handlePhotoChange(event.target.files?.[0] ?? null)}
            />
          </label>
          {photoError ? (
            <p className="text-center text-xs text-destructive">{photoError}</p>
          ) : null}
          <input type="hidden" name="photoBlobPathname" value={photoPathname ?? ""} />
          <input type="hidden" name="photoBlobUrl" value={photoUrl ?? ""} />
        </div>

        <FieldGroup>
          <Field invalid={Boolean(state.fieldErrors.phone)}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={bundle.staffProfile.phone ?? ""}
              placeholder="08012345678"
              aria-invalid={Boolean(state.fieldErrors.phone)}
              required
            />
            <FieldError>{state.fieldErrors.phone}</FieldError>
          </Field>
          <Field invalid={Boolean(state.fieldErrors.pronouns)}>
            <FieldLabel htmlFor="pronouns">Pronouns (optional)</FieldLabel>
            <Input
              id="pronouns"
              name="pronouns"
              defaultValue={bundle.staffProfile.pronouns ?? ""}
              placeholder="she/her, he/him, they/them"
            />
          </Field>
          <Field invalid={Boolean(state.fieldErrors.hireDate)}>
            <FieldLabel htmlFor="hireDate">Hire date (optional)</FieldLabel>
            <Input
              id="hireDate"
              name="hireDate"
              type="date"
              defaultValue={
                bundle.staffProfile.hireDate
                  ? new Date(bundle.staffProfile.hireDate).toISOString().slice(0, 10)
                  : ""
              }
            />
            <FieldError>{state.fieldErrors.hireDate}</FieldError>
          </Field>
        </FieldGroup>
      </div>

      <Field invalid={Boolean(state.fieldErrors.bio)}>
        <FieldLabel htmlFor="bio">Short bio (optional)</FieldLabel>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bundle.staffProfile.bio ?? ""}
          placeholder="A sentence or two about your background and what you bring to the classroom. Families may see this on a future 'Meet the team' page."
        />
        <FieldError>{state.fieldErrors.bio}</FieldError>
      </Field>

      <div className="rounded-2xl border border-border/65 bg-muted/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
          Emergency contact
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Someone we can call in an emergency. We&apos;ll keep this private.
        </p>
        <FieldGroup className="mt-4 sm:grid sm:grid-cols-2 sm:gap-4">
          <Field invalid={Boolean(state.fieldErrors.emergencyContactName)}>
            <FieldLabel htmlFor="emergencyContactName">Name</FieldLabel>
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              defaultValue={bundle.staffProfile.emergencyContactName ?? ""}
              required
            />
            <FieldError>{state.fieldErrors.emergencyContactName}</FieldError>
          </Field>
          <Field invalid={Boolean(state.fieldErrors.emergencyContactPhone)}>
            <FieldLabel htmlFor="emergencyContactPhone">Phone</FieldLabel>
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              defaultValue={bundle.staffProfile.emergencyContactPhone ?? ""}
              required
            />
            <FieldError>{state.fieldErrors.emergencyContactPhone}</FieldError>
          </Field>
        </FieldGroup>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
        >
          {isPending ? "Saving…" : "Save profile and continue"}
        </Button>
      </div>
    </form>
  )
}

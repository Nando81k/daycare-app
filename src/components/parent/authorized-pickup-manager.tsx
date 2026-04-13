"use client"

import { useActionState, useState } from "react"

import { deleteAuthorizedPickup, upsertAuthorizedPickup } from "@/app/actions/parent"
import { ParentSubmitButton } from "@/components/parent/parent-action-panel"
import {
  ParentFieldGroup,
  ParentTextField,
  ParentTextareaField,
} from "@/components/parent/parent-form-fields"
import { AlertBanner } from "@/components/shared/alert-banner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AuthorizedPickupPreview } from "@/types/app"
import { initialMutationState } from "@/lib/action-state"

function AuthorizedPickupDeleteControl({
  pickupId,
  childSlug,
}: {
  pickupId: string
  childSlug: string
}) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [state, formAction] = useActionState(deleteAuthorizedPickup, initialMutationState)

  return (
    <div className="flex flex-col gap-3">
      {state.error ? (
        <AlertBanner tone="destructive" title="Could not remove pickup" description={state.error} />
      ) : null}
      {state.success && state.message ? (
        <AlertBanner tone="success" title="Updated" description={state.message} />
      ) : null}

      {isConfirming ? (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="pickupId" value={pickupId} />
          <input type="hidden" name="childSlug" value={childSlug} />
          <ParentSubmitButton
            idleLabel="Confirm remove"
            pendingLabel="Removing..."
            variant="destructive"
            size="sm"
          />
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
        >
          Remove contact
        </button>
      )}
    </div>
  )
}

function AuthorizedPickupEditor({
  childSlug,
  pickup,
}: {
  childSlug: string
  pickup?: AuthorizedPickupPreview
}) {
  const [state, formAction] = useActionState(upsertAuthorizedPickup, initialMutationState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="childSlug" value={childSlug} />
      {pickup ? <input type="hidden" name="pickupId" value={pickup.id} /> : null}

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {pickup ? "Update pickup details" : "Add a new authorized pickup"}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {pickup
            ? "Adjust contact details or pickup notes that the classroom should keep on file."
            : "Add another approved adult who may pick up your child when plans change."}
        </p>
      </div>

      <ParentFieldGroup className="2xl:grid 2xl:grid-cols-2 2xl:gap-4">
        <ParentTextField
          name="name"
          label="Name"
          defaultValue={pickup?.name}
          error={state.fieldErrors.name}
        />
        <ParentTextField
          name="relationship"
          label="Relationship"
          defaultValue={pickup?.relationship}
          error={state.fieldErrors.relationship}
        />
        <ParentTextField
          name="phone"
          label="Phone"
          defaultValue={pickup?.phone}
          inputMode="tel"
          error={state.fieldErrors.phone}
        />
        <ParentTextareaField
          name="note"
          label="Pickup note"
          defaultValue={pickup?.note}
          rows={3}
          error={state.fieldErrors.note}
        />
      </ParentFieldGroup>

      <div className="flex flex-wrap items-center gap-3">
        <ParentSubmitButton
          idleLabel={pickup ? "Save contact" : "Add contact"}
          pendingLabel={pickup ? "Saving..." : "Adding..."}
          size="sm"
        />
        {pickup ? <AuthorizedPickupDeleteControl pickupId={pickup.id} childSlug={childSlug} /> : null}
      </div>

      {state.error ? (
        <AlertBanner tone="destructive" title="Could not save pickup" description={state.error} />
      ) : null}
      {state.success && state.message ? (
        <AlertBanner tone="success" title="Saved" description={state.message} />
      ) : null}
    </form>
  )
}

function PickupSummaryList({
  pickups,
}: {
  pickups: AuthorizedPickupPreview[]
}) {
  if (!pickups.length) {
    return (
      <Empty className="items-start justify-start gap-2 rounded-[1rem] border border-dashed border-border/60 bg-background/45 p-4 text-left">
        <EmptyHeader className="max-w-none items-start gap-1">
          <EmptyTitle>No approved pickups on file yet</EmptyTitle>
          <EmptyDescription>
            Add another approved adult below if pickup plans sometimes change during the week.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="divide-y divide-border/45">
      {pickups.map((pickup) => (
        <div
          key={pickup.id}
          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{pickup.name}</p>
              <Badge variant="secondary">{pickup.relationship}</Badge>
            </div>
            {pickup.note ? (
              <p className="text-sm leading-6 text-muted-foreground">{pickup.note}</p>
            ) : null}
          </div>
          <p className="text-sm font-medium text-foreground">{pickup.phone}</p>
        </div>
      ))}
    </div>
  )
}

function PickupAccordionLabel({
  title,
  subtitle,
  badge,
}: {
  title: string
  subtitle: string
  badge?: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 pr-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </div>
      <span className="text-sm font-normal leading-6 text-muted-foreground">{subtitle}</span>
    </div>
  )
}

export function AuthorizedPickupManager({
  childSlug,
  pickups,
}: {
  childSlug: string
  pickups: AuthorizedPickupPreview[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <PickupSummaryList pickups={pickups} />

      <Separator />

      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Manage pickups</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Expand a contact to edit it, or add another approved adult below.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-[1.1rem] border border-border/50 bg-background/34"
        >
          {pickups.map((pickup) => (
            <AccordionItem key={pickup.id} value={pickup.id}>
              <AccordionTrigger className="px-4 py-3.5 hover:text-foreground sm:px-5">
                <PickupAccordionLabel
                  title={`Edit ${pickup.name}`}
                  subtitle={pickup.phone}
                  badge={pickup.relationship}
                />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 sm:px-5">
                <AuthorizedPickupEditor childSlug={childSlug} pickup={pickup} />
              </AccordionContent>
            </AccordionItem>
          ))}

          <AccordionItem value="add-authorized-pickup">
            <AccordionTrigger className="px-4 py-3.5 hover:text-foreground sm:px-5">
              <PickupAccordionLabel
                title="Add authorized pickup"
                subtitle="Create another approved pickup contact for schedule changes."
              />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 sm:px-5">
              <AuthorizedPickupEditor childSlug={childSlug} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

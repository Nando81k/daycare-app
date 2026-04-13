"use client"

import { useActionState } from "react"

import { issuePortalInvite } from "@/app/actions/auth"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import { AdminFieldGroup, AdminSelectField, AdminTextField } from "@/components/admin/admin-form-fields"
import { initialMutationState } from "@/lib/action-state"

export function AdminInvitePanel({
  adminUserId,
}: {
  adminUserId: string
}) {
  const [state, formAction] = useActionState(issuePortalInvite.bind(null, adminUserId), initialMutationState)

  return (
    <AdminActionPanel
      eyebrow="Access invites"
      title="Send a secure portal invite"
      description="This first pass supports inviting existing parent or admin accounts already linked in the database. Public signup still stays off."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        <AdminFieldGroup>
          <AdminTextField
            name="email"
            label="Existing account email"
            placeholder="olivia@harperfamily.com"
            type="email"
            error={state.fieldErrors.email}
          />
          <AdminSelectField
            name="role"
            label="Portal role"
            defaultValue="PARENT"
            options={[
              { label: "Parent", value: "PARENT" },
              { label: "Admin", value: "ADMIN" },
            ]}
            error={state.fieldErrors.role}
          />
        </AdminFieldGroup>
        <div className="flex flex-wrap gap-3">
          <AdminSubmitButton idleLabel="Send invite" pendingLabel="Sending..." />
        </div>
      </form>
    </AdminActionPanel>
  )
}

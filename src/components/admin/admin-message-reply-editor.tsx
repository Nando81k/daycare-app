"use client"

import { useActionState } from "react"

import { sendAdminReply } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminMessageReplyEditor({
  threadId,
  subject,
  onClear,
}: {
  threadId: string
  subject: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(sendAdminReply, initialState)
  const formKey = `reply-${threadId}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="threadId" value={threadId} />
      <AdminActionPanel
        eyebrow="Reply"
        title={subject}
        description="Send a reply to this message thread."
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Cancel
              </Button>
            ) : null}
            <AdminSubmitButton size="sm" idleLabel="Send reply" pendingLabel="Sending..." />
          </div>
        }
      >
        <AdminFieldGroup>
          <AdminTextareaField
            name="body"
            label="Message"
            placeholder="Type your reply..."
            rows={4}
            error={state.fieldErrors.body}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}

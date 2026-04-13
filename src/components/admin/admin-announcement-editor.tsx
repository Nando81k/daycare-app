"use client"

import { useActionState } from "react"

import { createAnnouncement, updateAnnouncement } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState, AdminAnnouncementPreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const defaultAnnouncement = {
  title: "",
  audience: "",
  summary: "",
  body: "",
  scheduledForValue: "",
} satisfies Pick<
  AdminAnnouncementPreview,
  "title" | "audience" | "summary" | "body" | "scheduledForValue"
>

export function AdminAnnouncementEditor({
  announcement,
  onClear,
}: {
  announcement?: AdminAnnouncementPreview
  onClear?: () => void
}) {
  const action = announcement ? updateAnnouncement : createAnnouncement
  const [state, formAction] = useActionState(action, initialState)
  const content = announcement ?? defaultAnnouncement
  const formKey = announcement
    ? `${announcement.id}-${announcement.publishStatus}-${announcement.title}-${announcement.summary}-${announcement.scheduledForValue ?? ""}`
    : "new-announcement"

  return (
    <form key={formKey} action={formAction}>
      {announcement ? <input type="hidden" name="announcementId" value={announcement.id} /> : null}
      <AdminActionPanel
        eyebrow={announcement ? "Announcement editor" : "New announcement"}
        title={announcement ? announcement.title : "Create a new family update"}
        description={
          announcement
            ? "Drafts and scheduled items stay editable until they are published."
            : "Write once, then save as draft, schedule for later, or publish immediately."
        }
        state={state}
        footer={
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {announcement
                  ? `${announcement.audience} · ${announcement.scheduledFor}`
                  : "Published items become read-only in this phase."}
              </p>
              {onClear ? (
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                  {announcement ? "Close" : "Reset"}
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AdminSubmitButton
                size="sm"
                variant="outline"
                name="intent"
                value="save-draft"
                idleLabel="Save draft"
                pendingLabel="Saving draft..."
              />
              <AdminSubmitButton
                size="sm"
                variant="secondary"
                name="intent"
                value="schedule"
                idleLabel="Schedule"
                pendingLabel="Scheduling..."
              />
              <AdminSubmitButton
                size="sm"
                name="intent"
                value="publish-now"
                idleLabel="Publish now"
                pendingLabel="Publishing..."
              />
            </div>
          </div>
        }
      >
        <AdminFieldGroup className="gap-4">
          <AdminTextField
            name="title"
            label="Title"
            defaultValue={content.title}
            placeholder="Family breakfast reminder"
            error={state.fieldErrors.title}
          />
          <AdminTextField
            name="audience"
            label="Audience"
            defaultValue={content.audience}
            placeholder="All families"
            description="Keep this explicit so a family update never feels like a vague broadcast."
            error={state.fieldErrors.audience}
          />
          <AdminTextareaField
            name="summary"
            label="Summary"
            defaultValue={content.summary}
            placeholder="Short overview for the queue and admin review surfaces."
            description="This summary appears in queue previews, so keep it concise and specific."
            error={state.fieldErrors.summary}
            rows={3}
          />
          <AdminTextareaField
            name="body"
            label="Body"
            defaultValue={content.body ?? ""}
            placeholder="Add the full message if you want more than a short summary."
            error={state.fieldErrors.body}
            rows={5}
          />
          <AdminTextField
            name="scheduledFor"
            type="datetime-local"
            label="Scheduled for"
            defaultValue={content.scheduledForValue}
            description="Required only when you choose Schedule."
            error={state.fieldErrors.scheduledFor}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}

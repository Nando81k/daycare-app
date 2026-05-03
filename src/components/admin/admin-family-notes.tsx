"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Trash2Icon } from "lucide-react"

import { addFamilyNote, deleteFamilyNote } from "@/app/actions/admin"
import { AdminSubmitButton } from "@/components/admin/admin-action-panel"
import { AdminTextareaField } from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState, FamilyNotePreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminFamilyNotes({
  familyId,
  notes,
}: {
  familyId: string
  notes: FamilyNotePreview[]
}) {
  const router = useRouter()
  const [addState, addAction] = useActionState(addFamilyNote, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (addState.success) {
      formRef.current?.reset()
      router.refresh()
    }
  }, [addState.success, router])

  return (
    <div className="flex flex-col gap-5">
      <form ref={formRef} action={addAction} className="flex flex-col gap-3">
        <input type="hidden" name="familyId" value={familyId} />
        <AdminTextareaField
          name="body"
          label="Add a note"
          placeholder="Custody arrangement, billing conversation, parent preference, etc."
          description="Internal-only — never shown to families."
          error={addState.fieldErrors.body}
          rows={3}
        />
        {addState.error ? (
          <p className="text-xs text-destructive">{addState.error}</p>
        ) : null}
        <div className="flex items-center justify-end">
          <AdminSubmitButton size="sm" idleLabel="Save note" pendingLabel="Saving…" />
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No notes yet. Saved notes are visible to admins only.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <FamilyNoteRow key={note.id} note={note} />
          ))}
        </ul>
      )}
    </div>
  )
}

function FamilyNoteRow({ note }: { note: FamilyNotePreview }) {
  const router = useRouter()
  const [deleteState, deleteAction] = useActionState(deleteFamilyNote, initialState)

  useEffect(() => {
    if (deleteState.success) {
      router.refresh()
    }
  }, [deleteState.success, router])

  return (
    <li
      className="flex flex-col gap-2 rounded-md border border-border/50 bg-muted/15 px-4 py-3"
      aria-busy={deleteState.success === false && deleteState.error === null ? false : undefined}
    >
      <p className="whitespace-pre-line text-sm leading-6 text-foreground">{note.body}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
        <span>
          {note.authorName} · {note.createdAtLabel}
        </span>
        <form action={deleteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="h-3 w-3" />
            Delete
          </Button>
        </form>
      </div>
      {deleteState.error ? (
        <p className="text-xs text-destructive">{deleteState.error}</p>
      ) : null}
    </li>
  )
}

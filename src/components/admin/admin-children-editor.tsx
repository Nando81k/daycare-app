"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { updateChildProfile, upsertChildDailyReport } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AdminActionState, AdminChildHubRecord, ClassroomSummaryPreview } from "@/types/app"

import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import type { DailyActivityPreview, DailyMealPreview, DailyRestPreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

function formatMealLines(meals: DailyMealPreview[]) {
  return meals
    .map((meal) => `${meal.time} | ${meal.label} | ${meal.details} | ${meal.status}`)
    .join("\n")
}

function formatRestLines(rest: DailyRestPreview[]) {
  return rest
    .map((item) => `${item.time} | ${item.label} | ${item.duration} | ${item.note}`)
    .join("\n")
}

function formatActivityLines(activities: DailyActivityPreview[]) {
  return activities
    .map((activity) => `${activity.time} | ${activity.title} | ${activity.description}`)
    .join("\n")
}

function formatStaffNoteLines(notes: string[]) {
  return notes.join("\n")
}

export function AdminChildrenEditor({
  child,
  classrooms,
  onClear,
}: {
  child: AdminChildHubRecord
  classrooms: ClassroomSummaryPreview[]
  onClear?: () => void
}) {
  const router = useRouter()
  const [profileState, profileFormAction] = useActionState(updateChildProfile, initialState)
  const [reportState, reportFormAction] = useActionState(upsertChildDailyReport, initialState)
  const formKey = `${child.id}-${child.firstName}-${child.lastName}-${child.classroomId}`

  useEffect(() => {
    if (!profileState.success && !reportState.success) {
      return
    }

    router.refresh()
  }, [profileState.success, reportState.success, router])

  const classroomOptions = classrooms.map((room) => ({
    label: room.name,
    value: room.id,
  }))
  const todaysReport = child.latestDailyReport?.isToday ? child.latestDailyReport : null
  const latestReport = child.latestDailyReport
  const reportHint = todaysReport
    ? `${todaysReport.dateLabel} is already live for parents. Saving will refresh what they see on the overview page.`
    : latestReport
      ? `The last saved report is from ${latestReport.dateLabel}. Saving here will create a fresh parent-facing update for today.`
      : "No daily report has been saved yet. Saving here will create the first parent-facing update for today."

  return (
    <Tabs defaultValue="profile" className="gap-4">
      <TabsList
        variant="line"
        className="w-full justify-start gap-5 border-b border-border/70 px-0 pb-2"
      >
        <TabsTrigger value="profile" className="flex-none px-0">
          Profile
        </TabsTrigger>
        <TabsTrigger value="daily-report" className="flex-none px-0">
          Daily report
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <form key={formKey} action={profileFormAction}>
          <input type="hidden" name="childId" value={child.id} />
          <AdminActionPanel
            eyebrow="Child profile"
            title={child.name}
            description={`Edit profile details, classroom assignment, and health information for ${child.firstName}.`}
            state={profileState}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {child.ageLabel} · {child.familyName}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {onClear ? (
                    <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                      Close
                    </Button>
                  ) : null}
                  <AdminSubmitButton size="sm" idleLabel="Save changes" pendingLabel="Saving..." />
                </div>
              </div>
            }
          >
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Attendance</span>
                  <StatusBadge variant={getChildAttendanceVariant(child.attendanceStatus)}>
                    {formatAdminLabel(child.attendanceStatus)}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Billing</span>
                  <StatusBadge variant={getFamilyBalanceVariant(child.balanceStatus)}>
                    {formatAdminLabel(child.balanceStatus)}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Documents</span>
                  <StatusBadge variant={getDocumentVariant(child.documentsStatus)}>
                    {formatAdminLabel(child.documentsStatus)}
                  </StatusBadge>
                </div>
                {child.latestPhotoCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Photos</span>
                    <StatusBadge variant="info">
                      {child.latestPhotoCount} photo{child.latestPhotoCount === 1 ? "" : "s"}
                    </StatusBadge>
                  </div>
                ) : null}
              </div>
            </div>

            <AdminFieldGroup className="gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminTextField
                  name="firstName"
                  label="First name"
                  defaultValue={child.firstName}
                  error={profileState.fieldErrors.firstName}
                />
                <AdminTextField
                  name="lastName"
                  label="Last name"
                  defaultValue={child.lastName}
                  error={profileState.fieldErrors.lastName}
                />
              </div>
              <AdminSelectField
                name="classroomId"
                label="Classroom"
                defaultValue={child.classroomId}
                options={classroomOptions}
                error={profileState.fieldErrors.classroomId}
              />
              <AdminTextField
                name="allergies"
                label="Allergies"
                defaultValue={child.allergies.join(", ")}
                placeholder="Comma-separated, e.g. Peanuts, Dairy"
                description="Leave empty if no known allergies."
                error={profileState.fieldErrors.allergies}
              />
              <AdminTextareaField
                name="medicalNotes"
                label="Medical notes"
                defaultValue={child.medicalNotes}
                placeholder="Medications, conditions, or care instructions"
                error={profileState.fieldErrors.medicalNotes}
                rows={3}
              />
              <AdminTextareaField
                name="comfortNotes"
                label="Comfort notes"
                defaultValue={child.comfortNotes}
                placeholder="Comfort items, routines, or preferences"
                error={profileState.fieldErrors.comfortNotes}
                rows={3}
              />
            </AdminFieldGroup>

            {child.siblings.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Siblings in roster
                </p>
                <div className="grid gap-3">
                  {child.siblings.map((sibling) => (
                    <div
                      key={sibling.id}
                      className="surface-panel-quiet flex items-center justify-between gap-3 rounded-[1.2rem] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sibling.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sibling.ageLabel} · {sibling.classroom}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </AdminActionPanel>
        </form>
      </TabsContent>

      <TabsContent value="daily-report" className="mt-0">
        <form
          key={`${formKey}-${latestReport?.dateLabel ?? "new"}-${latestReport?.isToday ? "today" : "stale"}`}
          action={reportFormAction}
        >
          <input type="hidden" name="childId" value={child.id} />
          <AdminActionPanel
            eyebrow="Daily report"
            title={`Update ${child.firstName}'s day`}
            description="This report feeds the parent overview page, child profile, and photo gallery context. Save here when the classroom update is ready for families."
            state={reportState}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Saving creates or refreshes today&apos;s parent-facing daily report.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {onClear ? (
                    <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                      Close
                    </Button>
                  ) : null}
                  <AdminSubmitButton size="sm" idleLabel="Publish update" pendingLabel="Saving..." />
                </div>
              </div>
            }
          >
            <div className="surface-panel-quiet grid gap-3 rounded-[1.2rem] px-4 py-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Report status
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {todaysReport ? "Today's update in progress" : "No update saved for today yet"}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">{reportHint}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Latest saved report
                </p>
                <p className="text-sm font-semibold text-foreground">{latestReport?.dateLabel ?? "None yet"}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {latestReport ? latestReport.summary : "Parents will see this as soon as the first update is saved."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Attached photos
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {child.latestPhotoCount} photo{child.latestPhotoCount === 1 ? "" : "s"}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Photos already uploaded stay attached to the latest daily report for this child.
                </p>
              </div>
            </div>

            <AdminFieldGroup className="gap-4">
              <AdminTextareaField
                name="arrivalMood"
                label="Arrival update"
                defaultValue={todaysReport?.arrivalMood ?? ""}
                placeholder="How did the child arrive and settle into the room?"
                description="This appears near the top of the parent overview."
                error={reportState.fieldErrors.arrivalMood}
                rows={2}
              />
              <AdminTextareaField
                name="summary"
                label="Day summary"
                defaultValue={todaysReport?.summary ?? ""}
                placeholder="Short paragraph covering the overall rhythm of the day."
                description="Aim for one clear parent-facing paragraph."
                error={reportState.fieldErrors.summary}
                rows={4}
              />
              <div className="grid gap-4 xl:grid-cols-2">
                <AdminTextareaField
                  name="mealsText"
                  label="Meals"
                  defaultValue={formatMealLines(todaysReport?.meals ?? [])}
                  placeholder={"9:15 AM | Morning snack | Banana slices and crackers | eaten"}
                  description="One item per line: time | label | details | eaten/partial/skipped"
                  error={reportState.fieldErrors.mealsText}
                  rows={5}
                />
                <AdminTextareaField
                  name="restText"
                  label="Rest"
                  defaultValue={formatRestLines(todaysReport?.rest ?? [])}
                  placeholder={"12:35 PM | Rest time | 48 minutes | Rested quietly, then looked through books"}
                  description="One item per line: time | label | duration | note"
                  error={reportState.fieldErrors.restText}
                  rows={5}
                />
              </div>
              <AdminTextareaField
                name="activitiesText"
                label="Activities"
                defaultValue={formatActivityLines(todaysReport?.activities ?? [])}
                placeholder={"9:45 AM | Garden journal drawings | Children sketched seedlings and talked about what plants need to grow."}
                description="One item per line: time | title | description"
                error={reportState.fieldErrors.activitiesText}
                rows={5}
              />
              <AdminTextareaField
                name="staffNotesText"
                label="Staff notes"
                defaultValue={formatStaffNoteLines(todaysReport?.staffNotes ?? [])}
                placeholder={"Please send the green rain jacket tomorrow.\nEllie asked for a quieter rest transition and responded well to books first."}
                description="One parent-facing note per line."
                error={reportState.fieldErrors.staffNotesText}
                rows={4}
              />
            </AdminFieldGroup>
          </AdminActionPanel>
        </form>
      </TabsContent>
    </Tabs>
  )
}

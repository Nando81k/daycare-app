import { format } from "date-fns"
import { CheckCircle2Icon, Clock3Icon, FileTextIcon } from "lucide-react"

import { createEnrollmentApplication } from "@/app/actions/enrollment"
import { EnrollmentDocumentUploader } from "@/components/parent/enrollment-document-uploader"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireCurrentUser } from "@/lib/dal/auth"
import { getParentEnrollmentApplications } from "@/lib/dal/enrollment"

function statusLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase()
}

export default async function ParentEnrollmentPage() {
  const user = await requireCurrentUser()
  const applications = await getParentEnrollmentApplications(user.id)

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Enrollment"
        title="Submit and track enrollment with full intake details."
        description="Upload required documents, share health and emergency information, and follow status updates from the admin team."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Enrollment application</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createEnrollmentApplication} className="grid gap-5">
              <FieldGroup className="grid gap-5 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="primaryContactName">Primary contact name</FieldLabel>
                  <Input id="primaryContactName" name="primaryContactName" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="primaryContactEmail">Primary contact email</FieldLabel>
                  <Input id="primaryContactEmail" name="primaryContactEmail" type="email" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="primaryContactPhone">Primary contact phone</FieldLabel>
                  <Input id="primaryContactPhone" name="primaryContactPhone" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="secondaryContactName">Secondary contact name</FieldLabel>
                  <Input id="secondaryContactName" name="secondaryContactName" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="secondaryContactPhone">Secondary contact phone</FieldLabel>
                  <Input id="secondaryContactPhone" name="secondaryContactPhone" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="desiredProgramSlug">Desired program</FieldLabel>
                  <Input
                    id="desiredProgramSlug"
                    name="desiredProgramSlug"
                    placeholder="infant, toddler, preschool, or pre-k"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="childFirstName">Child first name</FieldLabel>
                  <Input id="childFirstName" name="childFirstName" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="childLastName">Child last name</FieldLabel>
                  <Input id="childLastName" name="childLastName" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="childBirthDate">Child birth date</FieldLabel>
                  <Input id="childBirthDate" name="childBirthDate" type="date" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="desiredStartDate">Desired start date</FieldLabel>
                  <Input id="desiredStartDate" name="desiredStartDate" type="date" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="careSchedule">Preferred care schedule</FieldLabel>
                  <Input
                    id="careSchedule"
                    name="careSchedule"
                    placeholder="5 full days, 3 days, extended day"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tourPreference">Tour preference</FieldLabel>
                  <Input id="tourPreference" name="tourPreference" placeholder="Weekday morning or evening" />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="allergies">Allergies</FieldLabel>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="List allergies and relevant reactions."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="medicalNotes">Medical notes</FieldLabel>
                  <Textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    placeholder="Medications, care requirements, provider guidance."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="emergencyContacts">Emergency contacts and pickup details</FieldLabel>
                  <Textarea
                    id="emergencyContacts"
                    name="emergencyContacts"
                    placeholder="Include names, relationship, phone numbers, and pickup permissions."
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="additionalNotes">Additional notes</FieldLabel>
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    placeholder="Share transition concerns, routines, or accommodations."
                  />
                </Field>
              </FieldGroup>

              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">Required documents</p>
                <EnrollmentDocumentUploader />
              </div>

              <div className="grid gap-2 rounded-2xl border border-border/60 bg-background/70 p-4">
                <label className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <input name="consentPolicies" type="checkbox" className="mt-1" required />
                  I confirm all application details are accurate and I approve policy review.
                </label>
                <label className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <input name="consentPhoto" type="checkbox" className="mt-1" required />
                  I acknowledge photo/media permission preferences are included in this intake submission.
                </label>
              </div>

              <Button type="submit" size="lg">
                Submit enrollment application
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Application status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {applications.length ? (
                applications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-border/60 bg-background/80 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {application.childFirstName} {application.childLastName}
                      </p>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {statusLabel(application.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {format(application.submittedAt, "MMM d, yyyy")}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {application.events.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex gap-2 text-sm text-muted-foreground">
                          <Clock3Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <span>{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-center">
                  <FileTextIcon className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No applications yet. Submit your first intake packet from the form.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl tracking-tight">
                <CheckCircle2Icon className="size-5 text-primary" />
                What happens next
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm leading-6 text-muted-foreground">
              <p>1. Admin team reviews application and attached records.</p>
              <p>2. Tour scheduling and classroom fit confirmation is coordinated.</p>
              <p>3. On acceptance, a deposit invoice is generated in your billing dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

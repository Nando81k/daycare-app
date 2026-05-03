import type { EnrollmentLeadDetail } from "@/lib/dal/admin"

type Lead = EnrollmentLeadDetail["lead"]
type Application = EnrollmentLeadDetail["application"]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  const display =
    typeof value === "string" && value.trim().length === 0 ? "—" : value
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-2 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{display ?? "—"}</span>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function EnrollmentApplicationCards({
  lead,
  application,
}: {
  lead: Lead
  application: Application
}) {
  // Best-effort fallbacks: if no application is present, split the lead's
  // single childName at the first space.
  const fallbackFirstName = lead.childName.split(" ")[0] ?? ""
  const fallbackLastName = lead.childName
    .split(" ")
    .slice(1)
    .join(" ")
    .trim()
  const fullName = application
    ? `${application.childFirstName} ${application.childLastName}`.trim()
    : lead.childName

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Child">
        <Row label="Name" value={fullName} />
        <Row
          label="First name"
          value={application?.childFirstName ?? fallbackFirstName}
        />
        <Row
          label="Last name"
          value={application?.childLastName ?? fallbackLastName}
        />
        <Row
          label="Date of birth"
          value={application?.dateOfBirth ?? "—"}
        />
        <Row
          label="Age label"
          value={application?.childAgeLabel ?? lead.childAgeLabel}
        />
        <Row
          label="Primary language"
          value={application?.primaryLanguage ?? "—"}
        />
      </Card>

      <Card title="Guardian">
        <Row label="Name" value={application?.parentName ?? "—"} />
        <Row
          label="Relationship"
          value={application?.relationshipToChild ?? "—"}
        />
        <Row label="Email" value={application?.parentEmail ?? "—"} />
        <Row label="Phone" value={application?.parentPhone ?? "—"} />
        <Row label="Address" value={application?.homeAddress ?? "—"} />
        <Row
          label="Emergency contact"
          value={
            application
              ? `${application.emergencyContactName}${application.emergencyContactPhone ? ` · ${application.emergencyContactPhone}` : ""}`
              : "—"
          }
        />
      </Card>

      <Card title="Program & schedule">
        <Row
          label="Program"
          value={application?.programSlug || lead.programInterest}
        />
        <Row
          label="Schedule"
          value={application?.scheduleSlug ?? "—"}
        />
        <Row
          label="Requested start"
          value={application?.preferredStartDate || lead.requestedStart}
        />
      </Card>

      <Card title="Health & safety">
        <Row
          label="Pediatrician"
          value={application?.pediatricianName ?? "—"}
        />
        <Row
          label="Pediatrician phone"
          value={application?.pediatricianPhone ?? "—"}
        />
        <Row
          label="Health notes"
          value={application?.healthNotes ?? "—"}
        />
      </Card>

      {lead.note ? (
        <div className="md:col-span-2">
          <Card title="Family notes">
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {lead.note}
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

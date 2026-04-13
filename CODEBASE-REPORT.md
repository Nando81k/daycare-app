# Daycare App — Comprehensive Codebase Research Report

> Generated from full source code analysis of every key file.

---

## Table of Contents

1. [Prisma Schema & Data Models](#1-prisma-schema--data-models)
2. [Admin Enrollment Management](#2-admin-enrollment-management)
3. [Admin Billing & Invoice Management](#3-admin-billing--invoice-management)
4. [Parent Enrollment & Application Wizard](#4-parent-enrollment--application-wizard)
5. [Parent Billing & Stripe Integration](#5-parent-billing--stripe-integration)
6. [Document Workflow](#6-document-workflow)
7. [Data Access Layer (DAL)](#7-data-access-layer-dal)
8. [Status Flows & Enums](#8-status-flows--enums)
9. [Directory Structure](#9-directory-structure)
10. [Architecture Notes](#10-architecture-notes)

---

## 1. Prisma Schema & Data Models

**File:** `prisma/schema.prisma` (~420 lines)

### Enums

```prisma
enum EnrollmentLeadStage {
  TOUR_REQUESTED
  CONTACTED
  TOUR_SCHEDULED
  APPLICATION_SENT
  ACCEPTED
  DENIED
}

enum EnrollmentLeadPriority { LOW  NORMAL  HIGH  URGENT }
enum EnrollmentLeadType     { TOUR  WAITLIST  CONTACT }
enum WaitlistStatus          { ACTIVE  OFFERED  ACCEPTED  DECLINED  EXPIRED }
enum InvoiceStatus           { PAID  DUE  DRAFT }
enum PaymentStatus           { PAID  PROCESSING  FAILED }
enum DocumentStatus          { REQUIRED  SUBMITTED  APPROVED  EXPIRED }
```

### Key Models

#### Family

```prisma
model Family {
  id              String   @id @default(cuid())
  familyName      String
  enrollmentStage String   @default("new")   // ← plain string, not the enum
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  children         Child[]
  enrollmentLeads  EnrollmentLead[]
  invoices         Invoice[]
  documents        Document[]
  billingProfile   FamilyBillingProfile?
  parentProfiles   ParentProfile[]
  authorizedPickups AuthorizedPickup[]
  auditLogs        AuditLog[]
  messageThreads   MessageThread[]
}
```

#### Child

```prisma
model Child {
  id            String   @id @default(cuid())
  slug          String   @unique @default(cuid())
  firstName     String
  lastName      String
  dateOfBirth   DateTime
  familyId      String
  classroomId   String?
  allergies     Json     @default("[]")
  medicalNotes  Json     @default("[]")
  comfortNotes  Json     @default("[]")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  family        Family     @relation(...)
  classroom     Classroom? @relation(...)
  documents     Document[]
  dailyReports  DailyReport[]
}
```

#### EnrollmentLead

```prisma
model EnrollmentLead {
  id             String                @id @default(cuid())
  familyId       String?
  contactName    String
  contactEmail   String
  contactPhone   String                @default("")
  stage          EnrollmentLeadStage   @default(TOUR_REQUESTED)
  priority       EnrollmentLeadPriority @default(NORMAL)
  assignedTo     String?
  note           String?               // JSON-serialized enrollment wizard draft
  childName      String?
  childAge       String?
  leadType       EnrollmentLeadType    @default(TOUR)
  waitlistStatus WaitlistStatus?

  // Tour fields
  tourDate       DateTime?
  tourTime       String?
  tourNotes      String?

  // Contact/Application fields
  applicationDate     DateTime?
  applicationNotes    String?
  contactPreference   String?
  preferredStartDate  DateTime?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  family         Family?  @relation(...)
}
```

#### Invoice & Payment

```prisma
model Invoice {
  id                    String        @id @default(cuid())
  familyId              String
  description           String
  amountCents           Int
  dueDate               DateTime
  status                InvoiceStatus @default(DRAFT)
  stripePaymentIntentId String?       @unique
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  family   Family    @relation(...)
  payments Payment[]
}

model Payment {
  id                    String        @id @default(cuid())
  invoiceId             String?
  familyId              String
  amountCents           Int
  status                PaymentStatus @default(PROCESSING)
  stripePaymentIntentId String        @unique
  receiptUrl            String?
  failureReason         String?
  paidAt                DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  invoice  Invoice? @relation(...)
}
```

#### FamilyBillingProfile

```prisma
model FamilyBillingProfile {
  id                     String   @id @default(cuid())
  familyId               String   @unique
  stripeCustomerId       String   @unique
  defaultPaymentMethodId String?
  defaultPaymentBrand    String?
  defaultPaymentLast4    String?
  defaultPaymentLabel    String?
  autopayEnabled         Boolean  @default(false)
  autopayUpdatedAt       DateTime?
  lastPaymentError       String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  family Family @relation(...)
}
```

#### Document

```prisma
model Document {
  id             String         @id @default(cuid())
  familyId       String
  childId        String?
  title          String
  category       String
  owner          String
  status         DocumentStatus @default(REQUIRED)
  originalName   String?
  blobUrl        String?
  blobPathname   String?
  blobContentType String?
  submittedAt    DateTime?
  approvedAt     DateTime?
  reviewedByName String?
  note           String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  family Family @relation(...)
  child  Child? @relation(...)
}
```

#### Other Models (summary)

| Model | Purpose |
|---|---|
| `ParentProfile` | userId (unique), familyId, billingContact, phone |
| `Classroom` | name, ageGroup, capacity, teacherName |
| `CalendarEvent` | title, description, startDate, endDate, allDay, type |
| `Announcement` | title, content, audience, publishedAt |
| `MessageThread` | familyId, subject, status (open/closed) |
| `Message` | threadId, role (STAFF/PARENT), senderName, content |
| `AuthorizedPickup` | familyId, name, phone, relationship |
| `DailyReport` | childId, date, activities, meals, mood, notes |
| `DailyReportPhoto` | reportId, url, caption |
| `AuditLog` | userId, action, entityType, entityId, meta (Json) |
| `SchoolSetting` | key (unique), value |

---

## 2. Admin Enrollment Management

### Directory Structure

```
src/app/(portal)/admin/
├── page.tsx                    → redirects to admin dashboard
├── enrollment/page.tsx         → redirect("/admin")
├── billing/page.tsx
├── calendar/page.tsx
├── children/page.tsx
├── classrooms/page.tsx
├── communications/page.tsx
├── documents/page.tsx
├── families/page.tsx
├── reports/page.tsx
├── settings/page.tsx
└── ...

src/components/admin/
├── admin-enrollment-page.tsx
├── admin-enrollment-editor.tsx
├── admin-billing-page.tsx
├── admin-invoice-editor.tsx
├── admin-documents-page.tsx
├── admin-document-request-editor.tsx
├── admin-document-review-editor.tsx
└── ... (30+ other admin components)
```

### Admin Enrollment Page (`admin-enrollment-page.tsx`, ~800 lines)

**Purpose:** Lists all enrollment leads in a full-screen DataTable with stage/status filtering.

Key elements:
- Reads from `adminData.enrollment` (mock data object) or DAL
- `StatusBadge` with stage-to-tone mapping: `accepted → "success"`, `denied → "destructive"`, `submitted → "info"`, `in-review → "warning"`, `draft → "secondary"`
- DataTable columns: Lead name, Child, Age, Stage (badge), Priority, Assigned To, Actions
- Filters: stage (All, Tour requested, Contacted, etc.), priority, assignedTo
- Row click → opens `AdminEnrollmentEditor` in a Sheet (slide-over panel)

### Admin Enrollment Editor (`admin-enrollment-editor.tsx`, ~500 lines)

**Purpose:** Side-panel editor for viewing/updating a single enrollment lead.

```tsx
// Key prop shape
interface AdminEnrollmentEditorProps {
  lead: AdminEnrollmentPreview
  onClose: () => void
}
```

Features:
- Displays: contact name/email/phone, child name/age, lead type, waitlist status
- Stage progression: Select dropdown with all `EnrollmentLeadStage` values
- Priority selector: LOW / NORMAL / HIGH / URGENT
- Assigned-to field (text input)
- Notes textarea (admin-only notes)
- Tour scheduling: date + time + notes (visible when stage = TOUR_SCHEDULED)
- Application date/notes (visible when stage = APPLICATION_SENT)
- **Form submission** → calls `updateEnrollmentLead` server action via `useActionState`

### Server Action: `updateEnrollmentLead`

**File:** `src/app/actions/admin.ts`

```typescript
export async function updateEnrollmentLead(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const parsed = updateEnrollmentLeadSchema.parse({
    leadId:       formData.get("leadId"),
    stage:        formData.get("stage"),
    priority:     formData.get("priority"),
    assignedTo:   formData.get("assignedTo"),
    note:         formData.get("note"),
    tourDate:     formData.get("tourDate") || null,
    tourTime:     formData.get("tourTime") || null,
    tourNotes:    formData.get("tourNotes") || null,
  })

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: { id: parsed.leadId },
      data: {
        stage:      parsed.stage,
        priority:   parsed.priority,
        assignedTo: parsed.assignedTo || null,
        note:       parsed.note || null,
        tourDate:   parsed.tourDate ? new Date(parsed.tourDate) : null,
        tourTime:   parsed.tourTime || null,
        tourNotes:  parsed.tourNotes || null,
      },
    })
    await tx.auditLog.create({
      data: {
        userId:     session.user.id,
        action:     "enrollment_lead.updated",
        entityType: "EnrollmentLead",
        entityId:   parsed.leadId,
        meta:       { stage: parsed.stage, priority: parsed.priority },
      },
    })
  })

  revalidatePaths(["/admin", "/admin/enrollment", "/admin/families"])
  return { status: "success", message: "Enrollment lead updated." }
}
```

### Server Action: `approveEnrollmentApplication`

```typescript
export async function approveEnrollmentApplication(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const leadId = z.string().min(1).parse(formData.get("leadId"))

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: { id: leadId },
      data: { stage: "ACCEPTED" },
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "enrollment_lead.approved",
        entityType: "EnrollmentLead",
        entityId: leadId,
        meta: {},
      },
    })
  })

  revalidatePaths(["/admin", "/admin/enrollment", "/admin/families"])
  return { status: "success", message: "Application approved." }
}
```

### Server Action: `updateFamilyStage`

```typescript
export async function updateFamilyStage(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const parsed = updateFamilyStageSchema.parse({
    familyId: formData.get("familyId"),
    stage:    formData.get("stage"),
  })

  await prisma.$transaction(async (tx) => {
    await tx.family.update({
      where: { id: parsed.familyId },
      data: { enrollmentStage: parsed.stage },
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "family.stage_updated",
        entityType: "Family",
        entityId: parsed.familyId,
        meta: { stage: parsed.stage },
      },
    })
  })

  revalidatePaths(["/admin", "/admin/families"])
  return { status: "success", message: "Family stage updated." }
}
```

### DAL: `getSimpleAdminEnrollmentData`

**File:** `src/lib/dal/minimal-portal.ts`

```typescript
export async function getSimpleAdminEnrollmentData() {
  await requireRole("ADMIN")

  const leads = await prisma.enrollmentLead.findMany({
    where: { leadType: { not: "WAITLIST" } },
    include: {
      family: {
        include: {
          invoices:  { orderBy: { createdAt: "desc" }, take: 1 },
          payments:  { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return leads.map((lead) => ({
    id: lead.id,
    contactName: lead.contactName,
    contactEmail: lead.contactEmail,
    childName: lead.childName ?? "—",
    childAge: lead.childAge ?? "—",
    enrollment: {
      stageLabel: getEnrollmentStatus(lead.stage).label,
      stageTone:  getEnrollmentStatus(lead.stage).tone,
    },
    payment: getAdminPaymentStatus(lead.family),
    submittedAt: lead.applicationDate,
    updatedAt: lead.updatedAt,
  }))
}
```

---

## 3. Admin Billing & Invoice Management

### Admin Billing Page (`admin-billing-page.tsx`, ~800 lines)

**Purpose:** Full billing overview with invoices table, payment tracking, and bulk actions.

Key features:
- Invoices DataTable: columns for Family, Description, Amount (`formatCurrencyFromCents`), Due Date, Status (badge), Actions
- Status filter: All, Draft, Due, Paid
- "Create invoice" button → opens `AdminInvoiceEditor`
- "Send reminders" bulk action for DUE invoices
- Payment history section with recent payments
- Summary cards: Total outstanding, Overdue count, Paid this month

### Admin Invoice Editor (`admin-invoice-editor.tsx`, ~350 lines)

**Purpose:** Sheet editor to create or edit an invoice.

```tsx
// Form fields
- Family selector (search + select from families list)
- Description (text input)
- Amount (number input, stored as cents)
- Due date (date picker)
- Status selector: DRAFT / DUE / PAID
```

Form submission → `createInvoice` server action:

```typescript
export async function createInvoice(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const parsed = createInvoiceSchema.parse({
    familyId:    formData.get("familyId"),
    description: formData.get("description"),
    amountCents: Number(formData.get("amountCents")),
    dueDate:     formData.get("dueDate"),
    status:      formData.get("status"),
  })

  await prisma.$transaction(async (tx) => {
    await tx.invoice.create({
      data: {
        familyId:    parsed.familyId,
        description: parsed.description,
        amountCents: parsed.amountCents,
        dueDate:     new Date(parsed.dueDate),
        status:      parsed.status as InvoiceStatus,
      },
    })
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "invoice.created",
        entityType: "Invoice",
        entityId: parsed.familyId,
        meta: { amountCents: parsed.amountCents, status: parsed.status },
      },
    })
  })

  revalidatePaths(["/admin", "/admin/billing", "/parent/billing"])
  return { status: "success", message: "Invoice created." }
}
```

---

## 4. Parent Enrollment & Application Wizard

### Directory Structure

```
src/app/(portal)/parent/
├── page.tsx                     → parent dashboard
├── enrollment/page.tsx          → getSimpleParentPortalData() → View
├── billing/page.tsx
├── billing/pay/                 → DOES NOT EXIST (pay is inline)
├── documents/page.tsx
├── messages/page.tsx
├── profile/page.tsx
└── ...

src/components/parent/
├── parent-enrollment-dashboard-page.tsx   (~1500 lines, wizard)
├── parent-simple-enrollment-page.tsx      (~180 lines, summary)
├── parent-billing-controls.tsx            (~600 lines, Stripe)
├── parent-simple-payment-page.tsx         (~190 lines, billing view)
├── parent-document-upload-card.tsx        (~170 lines)
└── ...
```

### Route: `parent/enrollment/page.tsx`

```typescript
import { getSimpleParentPortalData } from "@/lib/dal/minimal-portal"
import { ParentSimpleEnrollmentPageView } from "@/components/parent/parent-simple-enrollment-page"

export default async function ParentEnrollmentPage() {
  const data = await getSimpleParentPortalData()
  return <ParentSimpleEnrollmentPageView data={data} />
}
```

The `ParentSimpleEnrollmentPageView` renders a summary card or redirects to the dashboard wizard based on status.

### Enrollment Dashboard Wizard (`parent-enrollment-dashboard-page.tsx`, ~1500 lines)

This is the most complex component in the entire app — a 5-step multi-application enrollment wizard.

#### Step Definitions

```typescript
const enrollmentSteps = [
  { id: 1, label: "Child details",        Icon: Baby },
  { id: 2, label: "Guardian info",        Icon: Users },
  { id: 3, label: "Program & schedule",   Icon: Building2 },
  { id: 4, label: "Health & safety",      Icon: HeartPulse },
  { id: 5, label: "Documents & review",   Icon: FileText },
]
```

#### Step Validation: `isStepComplete`

```typescript
function isStepComplete(
  stepId: number,
  draft: ParentEnrollmentApplicationDraft,
  hasRequiredDocs: boolean
): boolean {
  switch (stepId) {
    case 1: return !!(
      draft.childFirstName && draft.childLastName &&
      draft.dateOfBirth && draft.childAgeLabel &&
      draft.homeAddress && draft.preferredStartDate
    )
    case 2: return !!(
      draft.parentName && draft.relationshipToChild &&
      draft.email && draft.phone &&
      draft.emergencyContactName && draft.emergencyContactPhone
    )
    case 3: return !!(
      draft.programInterest && draft.scheduleNeed && draft.requestedStart
    )
    case 4: return !!(
      draft.pediatricianName && draft.pediatricianPhone &&
      draft.healthChecklist.immunizationRecords &&
      draft.healthChecklist.emergencyContacts &&
      draft.healthChecklist.authorizedPickups &&
      draft.healthChecklist.healthChanges
    )
    case 5: return draft.accepted && !hasRequiredDocs
    default: return false
  }
}
```

#### State Management

```typescript
function ParentEnrollmentDashboardWorkspace({ data }: Props) {
  // Multi-application state
  const [applications, setApplications] = useState<LocalApplication[]>(
    data.applications.length
      ? data.applications.map(mapServerAppToLocal)
      : [createFreshApplication(data)]
  )
  const [selectedApplicationId, setSelectedApplicationId] = useState(applications[0].localId)
  const [currentStep, setCurrentStep] = useState(1)

  // Server action state
  const [actionState, setActionState] = useState<MutationActionState>(initialActionState)

  // Transition states for non-blocking mutations
  const [isSaving, startSavingTransition] = useTransition()
  const [isSubmitting, startSubmittingTransition] = useTransition()
  const [isDeleting, startDeletingTransition] = useTransition()

  // Derived state
  const selectedApp = applications.find(a => a.localId === selectedApplicationId)!
  const draft = selectedApp.draft
```

#### Draft Field Update

```typescript
function setDraftField<K extends keyof ParentEnrollmentApplicationDraft>(
  key: K,
  value: ParentEnrollmentApplicationDraft[K]
) {
  updateSelectedApplication((app) => ({
    ...app,
    draft: { ...app.draft, [key]: value },
  }))
}
```

#### Save Handler (persists to server)

```typescript
async function handleSave() {
  startSavingTransition(async () => {
    const formData = buildApplicationFormData(selectedApp)
    const result = await saveEnrollmentApplicationDraft({} as MutationActionState, formData)
    setActionState(result)

    if (result.status === "success" && result.entityId) {
      updateSelectedApplication((app) => ({
        ...app,
        persistedId: result.entityId!,
        statusLabel: "Draft saved",
        statusTone: "secondary",
      }))
      router.refresh()
    }
  })
}
```

#### Submit Handler

```typescript
async function handleSubmit() {
  startSubmittingTransition(async () => {
    // Save first if not persisted
    if (!selectedApp.persistedId) {
      const saveFormData = buildApplicationFormData(selectedApp)
      const saveResult = await saveEnrollmentApplicationDraft({} as MutationActionState, saveFormData)
      if (saveResult.status !== "success" || !saveResult.entityId) {
        setActionState(saveResult)
        return
      }
      updateSelectedApplication(app => ({ ...app, persistedId: saveResult.entityId! }))
    }

    const submitFormData = new FormData()
    submitFormData.set("leadId", selectedApp.persistedId!)
    const result = await submitEnrollmentApplication({} as MutationActionState, submitFormData)
    setActionState(result)

    if (result.status === "success") {
      updateSelectedApplication(app => ({
        ...app,
        statusLabel: "Submitted",
        statusTone: "info",
      }))
      router.refresh()
    }
  })
}
```

#### Delete Handler

```typescript
async function handleDelete() {
  startDeletingTransition(async () => {
    if (!selectedApp.persistedId) {
      // Pure local delete
      removeLocalApplication(selectedApp.localId)
      return
    }

    const formData = new FormData()
    formData.set("leadId", selectedApp.persistedId)
    const result = await deleteEnrollmentApplicationDraft({} as MutationActionState, formData)
    setActionState(result)

    if (result.status === "success") {
      removeLocalApplication(selectedApp.localId)
      router.refresh()
    }
  })
}
```

#### JSX Layout (3-column grid)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: PageShell + Save Draft / Continue Application btns │
├────────────┬──────────────────────────┬─────────────────────┤
│  LEFT      │  MAIN                    │  RIGHT              │
│            │                          │                     │
│  Progress  │  Step Card               │  Enrollment Summary │
│  ┌──────┐  │  ┌─────────────────────┐ │  ┌───────────────┐ │
│  │Step 1│  │  │ Step Title + Status │ │  │Child: ...     │ │
│  │Step 2│  │  │                     │ │  │Program: ...   │ │
│  │Step 3│  │  │ <StepComponent />   │ │  │Schedule: ...  │ │
│  │Step 4│  │  │                     │ │  │Start: ...     │ │
│  │Step 5│  │  │ Back | Save | Next  │ │  │Status: ...    │ │
│  └──────┘  │  └─────────────────────┘ │  └───────────────┘ │
│            │                          │                     │
│  Apps      │                          │  Required Checklist │
│  ┌──────┐  │                          │  ┌───────────────┐ │
│  │App 1 │  │                          │  │● Birth cert   │ │
│  │App 2 │  │                          │  │○ Immunization │ │
│  │+ Add │  │                          │  │● Emergency    │ │
│  └──────┘  │                          │  └───────────────┘ │
│            │                          │                     │
│            │                          │  Need Help?         │
│            │                          │  📞 Phone + Link   │
└────────────┴──────────────────────────┴─────────────────────┘
```

#### Step Components

**Step 1 — ChildDetailsStep:**
Fields: childFirstName, childLastName, dateOfBirth (date), childAgeLabel (Select with age group options), homeAddress, preferredStartDate (date), primaryLanguage. Shows a tip box.

**Step 2 — GuardianStep:**
Fields: parentName, relationshipToChild, email, phone, emergencyContactName, emergencyContactPhone. Plus authorized pickup contacts CRUD (add/remove, each with name/relationship/phone).

**Step 3 — ProgramStep:**
Three program cards (Preschool / Pre-K / Junior Kindergarten) as selectable buttons with `border-sky-200 bg-sky-50` active state. Schedule preference Select (scheduleOptions). Requested start Select (requestedStartOptions).

**Step 4 — HealthStep:**
Fields: pediatricianName, pediatricianPhone, healthNotes (Textarea). Plus 4-item health checklist with Checkboxes: immunizationRecords, emergencyContacts, authorizedPickups, healthChanges.

**Step 5 — DocumentsStep:**
Renders `ParentDocumentUploadCard` for each document. Shows "Documents will appear here when requested" if none. Review reminder card. Final acceptance Checkbox: "I confirm the information provided is accurate."

### Server Action: `saveEnrollmentApplicationDraft`

**File:** `src/app/actions/parent.ts` — The most complex action (~200 lines)

```typescript
export async function saveEnrollmentApplicationDraft(
  _prevState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  const { session, family, user } = await getParentActionContext()

  // Extract all ~25 form fields from formData
  const childFirstName = formData.get("childFirstName") as string
  const childLastName  = formData.get("childLastName") as string
  // ... (all other fields)

  // Serialize the full draft as JSON for the `note` field
  const draftPayload = {
    childFirstName, childLastName, dateOfBirth, childAgeLabel,
    homeAddress, preferredStartDate, primaryLanguage,
    parentName, relationshipToChild, email, phone,
    emergencyContactName, emergencyContactPhone,
    pickups, // Array of {name, phone, relationship}
    programInterest, scheduleNeed, requestedStart,
    pediatricianName, pediatricianPhone, healthNotes,
    healthChecklist, // Object with 4 booleans
    accepted,
  }

  const existingLeadId = formData.get("leadId") as string | null

  const lead = await prisma.$transaction(async (tx) => {
    const upsertedLead = await tx.enrollmentLead.upsert({
      where: { id: existingLeadId || "" },
      create: {
        familyId:        family.id,
        contactName:     parentName || user.name || "Parent",
        contactEmail:    email || user.email || "",
        contactPhone:    phone,
        stage:           "CONTACTED",
        leadType:        "CONTACT",
        childName:       [childFirstName, childLastName].filter(Boolean).join(" ") || null,
        childAge:        childAgeLabel || null,
        applicationDate: new Date(),
        note:            JSON.stringify(draftPayload),
      },
      update: {
        contactName:  parentName || undefined,
        contactEmail: email || undefined,
        contactPhone: phone || undefined,
        childName:    [childFirstName, childLastName].filter(Boolean).join(" ") || undefined,
        childAge:     childAgeLabel || undefined,
        note:         JSON.stringify(draftPayload),
      },
    })

    // Side effects: update family name, user name, parent profile phone
    if (parentName) {
      await tx.family.update({
        where: { id: family.id },
        data: { familyName: parentName },
      })
      await tx.user.update({
        where: { id: session.user.id },
        data: { name: parentName },
      })
    }
    if (phone) {
      await tx.parentProfile.update({
        where: { userId: session.user.id },
        data: { phone },
      })
    }

    await tx.auditLog.create({ /* ... */ })
    return upsertedLead
  })

  revalidatePaths(["/parent", "/parent/enrollment", "/admin", "/admin/enrollment"])
  return { status: "success", message: "Draft saved.", entityId: lead.id }
}
```

### Server Action: `submitEnrollmentApplication`

```typescript
export async function submitEnrollmentApplication(
  _prevState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  const { session } = await getParentActionContext()
  const leadId = z.string().min(1).parse(formData.get("leadId"))

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: { id: leadId },
      data: { stage: "APPLICATION_SENT" },
    })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/parent", "/parent/enrollment", "/admin", "/admin/enrollment"])
  return { status: "success", message: "Application submitted." }
}
```

### Server Action: `deleteEnrollmentApplicationDraft`

```typescript
export async function deleteEnrollmentApplicationDraft(
  _prevState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  const { session, family } = await getParentActionContext()
  const leadId = z.string().min(1).parse(formData.get("leadId"))

  // Verify the lead belongs to this family
  const lead = await prisma.enrollmentLead.findFirst({
    where: { id: leadId, familyId: family.id },
  })
  if (!lead) return { status: "error", message: "Application not found." }

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.delete({ where: { id: leadId } })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/parent", "/parent/enrollment", "/admin", "/admin/enrollment"])
  return { status: "success", message: "Draft deleted." }
}
```

---

## 5. Parent Billing & Stripe Integration

### Server-Side Stripe Functions (`lib/billing.ts`)

#### `ensureFamilyStripeCustomer(familyId)`

```typescript
export async function ensureFamilyStripeCustomer(familyId: string) {
  const family = await prisma.family.findUniqueOrThrow({
    where: { id: familyId },
    include: { billingProfile: true },
  })

  if (family.billingProfile?.stripeCustomerId) {
    return family.billingProfile.stripeCustomerId
  }

  const stripe = getStripeClient()
  const customer = await stripe.customers.create({
    name: family.familyName,
    metadata: { familyId },
  })

  await prisma.familyBillingProfile.upsert({
    where: { familyId },
    create: { familyId, stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  })

  return customer.id
}
```

#### `createFamilySetupIntent(familyId)`

```typescript
export async function createFamilySetupIntent(familyId: string) {
  const customerId = await ensureFamilyStripeCustomer(familyId)
  const stripe = getStripeClient()

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: "off_session",
    automatic_payment_methods: { enabled: true },
  })

  return { clientSecret: setupIntent.client_secret! }
}
```

#### `syncSetupIntent(setupIntentId)`

```typescript
export async function syncSetupIntent(setupIntentId: string) {
  const stripe = getStripeClient()
  const si = await stripe.setupIntents.retrieve(setupIntentId, {
    expand: ["payment_method"],
  })

  const pm = si.payment_method as Stripe.PaymentMethod
  const card = pm.card

  await prisma.familyBillingProfile.update({
    where: { stripeCustomerId: si.customer as string },
    data: {
      defaultPaymentMethodId: pm.id,
      defaultPaymentBrand:    card?.brand ?? null,
      defaultPaymentLast4:    card?.last4 ?? null,
      defaultPaymentLabel:    formatStripePaymentMethodLabel(pm),
    },
  })
}
```

#### `createInvoicePaymentIntent(invoiceId)`

```typescript
export async function createInvoicePaymentIntent(invoiceId: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { family: { include: { billingProfile: true } } },
  })

  if (invoice.status !== "DUE") throw new Error("Invoice is not due")

  const customerId = await ensureFamilyStripeCustomer(invoice.familyId)
  const stripe = getStripeClient()

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   invoice.amountCents,
    currency: "usd",
    customer: customerId,
    metadata: { invoiceId },
    automatic_payment_methods: { enabled: true },
  })

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return { clientSecret: paymentIntent.client_secret! }
}
```

#### `syncPaymentIntent(paymentIntentId)`

```typescript
export async function syncPaymentIntent(paymentIntentId: string) {
  const stripe = getStripeClient()
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["payment_method"],
  })

  const pm = pi.payment_method as Stripe.PaymentMethod | null
  const invoiceId = pi.metadata?.invoiceId

  if (pi.status === "succeeded" && invoiceId) {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      })
      await tx.payment.upsert({
        where: { stripePaymentIntentId: pi.id },
        create: {
          familyId:              pi.metadata.familyId ?? "",
          invoiceId,
          amountCents:           pi.amount,
          status:                "PAID",
          stripePaymentIntentId: pi.id,
          receiptUrl:            (pi.latest_charge as any)?.receipt_url ?? null,
          paidAt:                new Date(),
        },
        update: { status: "PAID", paidAt: new Date() },
      })
    })
  }

  // Always update billing profile with latest card info
  if (pm?.card) {
    await prisma.familyBillingProfile.update({
      where: { stripeCustomerId: pi.customer as string },
      data: {
        defaultPaymentMethodId: pm.id,
        defaultPaymentBrand:    pm.card.brand,
        defaultPaymentLast4:    pm.card.last4,
        defaultPaymentLabel:    formatStripePaymentMethodLabel(pm),
        lastPaymentError:       pi.status === "succeeded" ? null : pi.last_payment_error?.message,
      },
    })
  }
}
```

#### `runAutopaySweep()`

```typescript
export async function runAutopaySweep() {
  const dueInvoices = await prisma.invoice.findMany({
    where: {
      status: "DUE",
      family: {
        billingProfile: {
          autopayEnabled:           true,
          defaultPaymentMethodId:   { not: null },
        },
      },
    },
    include: { family: { include: { billingProfile: true } } },
  })

  for (const invoice of dueInvoices) {
    const bp = invoice.family.billingProfile!
    const stripe = getStripeClient()

    try {
      const pi = await stripe.paymentIntents.create({
        amount:                    invoice.amountCents,
        currency:                  "usd",
        customer:                  bp.stripeCustomerId,
        payment_method:            bp.defaultPaymentMethodId!,
        confirm:                   true,
        off_session:               true,
        automatic_payment_methods: { enabled: true },
        metadata:                  { invoiceId: invoice.id },
      })

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { stripePaymentIntentId: pi.id },
      })

      await syncPaymentIntent(pi.id)
    } catch (error) {
      await prisma.payment.create({
        data: {
          familyId:              invoice.familyId,
          invoiceId:             invoice.id,
          amountCents:           invoice.amountCents,
          status:                "FAILED",
          stripePaymentIntentId: `failed_${invoice.id}_${Date.now()}`,
          failureReason:         error instanceof Error ? error.message : "Unknown error",
        },
      })
    }
  }
}
```

### Client-Side Stripe Integration (`parent-billing-controls.tsx`, ~600 lines)

#### Component Architecture

```
ParentBillingControls (export)
├── StripePaymentSection (pay an invoice)
│   └── InlineStripeForm mode="payment"
│       └── @stripe/react-stripe-js Elements + PaymentElement
├── StripeSetupSection (save a card)
│   └── InlineStripeForm mode="setup"
│       └── @stripe/react-stripe-js Elements + PaymentElement
└── Autopay BillingPanel (toggle on/off)
    └── Form → toggleParentAutopay server action
```

#### `InlineStripeForm`

```typescript
function InlineStripeForm({
  mode,
  onComplete,
}: {
  mode: "setup" | "payment"
  onComplete: (id: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    if (mode === "setup") {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })
      if (error) { setError(error.message ?? "..."); setProcessing(false); return }
      if (setupIntent) onComplete(setupIntent.id)
    } else {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })
      if (error) { setError(error.message ?? "..."); setProcessing(false); return }
      if (paymentIntent) onComplete(paymentIntent.id)
    }
  }
  // ... renders PaymentElement + submit button
}
```

#### `StripeSetupSection` Flow

```
1. Parent clicks "Set up a card"
2. POST /api/stripe/setup-intent → createFamilySetupIntent(familyId) → { clientSecret }
3. <Elements stripe={stripePromise} options={{ clientSecret }}>
     <InlineStripeForm mode="setup" onComplete={...} />
   </Elements>
4. Stripe.js renders PaymentElement (card form)
5. Parent enters card → confirmSetup()
6. onComplete: POST /api/stripe/sync-setup-intent → syncSetupIntent(id)
7. router.refresh() → success dialog "Card saved"
```

#### `StripePaymentSection` Flow

```
1. Component identifies currentDueInvoice from props
2. Parent clicks "Pay now"
3. POST /api/stripe/payment-intent { invoiceId } → createInvoicePaymentIntent → { clientSecret }
4. <Elements stripe={stripePromise} options={{ clientSecret }}>
     <InlineStripeForm mode="payment" onComplete={...} />
   </Elements>
5. Stripe.js renders PaymentElement
6. Parent confirms → confirmPayment()
7. onComplete: POST /api/stripe/sync-payment-intent → syncPaymentIntent(id)
8. router.refresh() → success dialog "Payment confirmed"
```

#### Autopay Toggle

```typescript
// toggleParentAutopay server action
export async function toggleParentAutopay(
  _prevState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { session, family } = await getParentActionContext()
  const enabled = formData.get("enabled") === "true"

  await prisma.$transaction(async (tx) => {
    await tx.familyBillingProfile.update({
      where: { familyId: family.id },
      data: {
        autopayEnabled: enabled,
        autopayUpdatedAt: new Date(),
      },
    })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/parent", "/parent/billing"])
  return { status: "success", message: enabled ? "Autopay enabled." : "Autopay disabled." }
}
```

---

## 6. Document Workflow

### Full Lifecycle

```
Admin: createDocumentRequest       → Document(status: REQUIRED)
            ↓
Parent: submitParentDocumentUpload → Document(status: SUBMITTED, blob fields set)
            ↓
Admin: reviewDocumentSubmission    → Document(status: APPROVED or back to REQUIRED)
```

### Admin: Create Document Request (`admin-document-request-editor.tsx`)

```typescript
// Server action
export async function createDocumentRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const parsed = createDocumentRequestSchema.parse({
    familyId: formData.get("familyId"),
    childId:  formData.get("childId") || null,
    title:    formData.get("title"),
    category: formData.get("category"),
    note:     formData.get("note") || null,
  })

  await prisma.$transaction(async (tx) => {
    await tx.document.create({
      data: {
        familyId: parsed.familyId,
        childId:  parsed.childId,
        title:    parsed.title,
        category: parsed.category,
        owner:    "school",
        status:   "REQUIRED",
        note:     parsed.note,
      },
    })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/admin", "/admin/documents", "/parent", "/parent/documents"])
  return { status: "success", message: "Document request created." }
}
```

### Parent: Upload Document (`parent-document-upload-card.tsx`)

```typescript
// Client component with file upload
async function handleUpload(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) return

  // Upload to blob storage
  const blob = await uploadFile(getDocumentUploadPath(document.id, file.name), file)

  // Submit via server action
  const actionFormData = new FormData()
  actionFormData.set("documentId", document.id)
  actionFormData.set("blobUrl", blob.url)
  actionFormData.set("blobPathname", blob.pathname)
  actionFormData.set("blobContentType", file.type)
  actionFormData.set("originalName", file.name)

  const result = await submitParentDocumentUpload({} as ParentActionState, actionFormData)
}
```

Server action:

```typescript
export async function submitParentDocumentUpload(
  _prevState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { session, family } = await getParentActionContext()
  // ... Zod validation ...

  await prisma.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: parsed.documentId },
      data: {
        status:          "SUBMITTED",
        blobUrl:         parsed.blobUrl,
        blobPathname:    parsed.blobPathname,
        blobContentType: parsed.blobContentType,
        originalName:    parsed.originalName,
        submittedAt:     new Date(),
      },
    })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/parent", "/parent/documents", "/admin", "/admin/documents"])
  return { status: "success", message: "Document uploaded." }
}
```

### Admin: Review Document (`admin-document-review-editor.tsx`)

```typescript
export async function reviewDocumentSubmission(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN")
  const parsed = reviewDocumentSchema.parse({
    documentId: formData.get("documentId"),
    status:     formData.get("status"), // "APPROVED" or "REQUIRED" (reject)
    note:       formData.get("note") || null,
  })

  await prisma.$transaction(async (tx) => {
    await tx.document.update({
      where: { id: parsed.documentId },
      data: {
        status:         parsed.status as DocumentStatus,
        approvedAt:     parsed.status === "APPROVED" ? new Date() : null,
        reviewedByName: session.user.name,
        note:           parsed.note,
      },
    })
    await tx.auditLog.create({ /* ... */ })
  })

  revalidatePaths(["/admin", "/admin/documents", "/parent", "/parent/documents"])
  return { status: "success", message: "Document reviewed." }
}
```

---

## 7. Data Access Layer (DAL)

**File:** `src/lib/dal/minimal-portal.ts` (~500 lines)

### `getSimpleParentPortalData()`

This is the main parent portal data function. Returns:

```typescript
interface SimpleParentPortalPreview {
  parentName: string
  familyName: string
  accountEmail: string
  phone: string
  billingContact: boolean

  enrollment: {
    leadId: string | null
    stageLabel: string      // "Approved", "Submitted", "Draft saved", etc.
    stageTone: string       // "success", "info", "secondary", etc.
    detail: string
    submittedAt: string | null
    draft: ParentEnrollmentApplicationDraft | null
  }

  applications: Array<{
    leadId: string
    statusLabel: string
    statusTone: string
    draft: ParentEnrollmentApplicationDraft
    updatedAt: Date
  }>

  documents: Array<{
    id: string
    title: string
    category: string
    status: string          // lowercase mapped
    note: string | null
    blobUrl: string | null
    originalName: string | null
    submittedAt: string | null
  }>

  payments: {
    statusLabel: string
    statusTone: string
    detail: string
    currentInvoice: { ... } | null
    invoices: Array<{ ... }>
    paymentHistory: Array<{ ... }>
    paymentMethod: {
      familyId: string
      label: string
      detail: string
      autopayStatus: string
      note: string | null
      brand: string | null
      last4: string | null
      stripeConfigured: boolean
    }
  }
}
```

### Status Mapping Functions

```typescript
function getEnrollmentStatus(stage: EnrollmentLeadStage) {
  switch (stage) {
    case "ACCEPTED":         return { label: "Approved",      tone: "success" }
    case "DENIED":           return { label: "Not approved",  tone: "destructive" }
    case "APPLICATION_SENT": return { label: "Submitted",     tone: "info" }
    case "TOUR_SCHEDULED":   return { label: "Under review",  tone: "info" }
    case "CONTACTED":        return { label: "Draft saved",   tone: "secondary" }
    default:                 return { label: "Not started",   tone: "secondary" }
  }
}

function getPaymentStatus({ latestInvoice, latestPaidPayment }) {
  if (!latestInvoice && !latestPaidPayment) return { label: "No payment requested", tone: "secondary" }
  if (latestPaidPayment)                     return { label: "Paid", tone: "success" }
  if (latestInvoice?.status === "DUE")       return { label: "Payment due", tone: "warning" }
  if (latestInvoice?.status === "DRAFT")     return { label: "Invoice pending", tone: "info" }
  return { label: "No payment requested", tone: "secondary" }
}

function getAdminPaymentStatus(family: FamilyWithBilling | null) {
  if (!family)                                         return { label: "No portal account", tone: "secondary" }
  const latestInvoice = family.invoices[0]
  if (latestInvoice?.status === "DUE")                 return { label: "Not paid", tone: "warning" }
  if (latestInvoice?.status === "PAID")                return { label: "Paid", tone: "success" }
  if (latestInvoice?.status === "DRAFT")               return { label: "Invoice drafted", tone: "info" }
  return { label: "No payment yet", tone: "secondary" }
}
```

---

## 8. Status Flows & Enums

### Enrollment Flow

```
TOUR_REQUESTED  →  CONTACTED  →  TOUR_SCHEDULED  →  APPLICATION_SENT  →  ACCEPTED
                                                                       →  DENIED
```

**Parent-facing labels:**
| Stage | Label | Tone |
|---|---|---|
| `TOUR_REQUESTED` | Not started | secondary |
| `CONTACTED` | Draft saved | secondary |
| `TOUR_SCHEDULED` | Under review | info |
| `APPLICATION_SENT` | Submitted | info |
| `ACCEPTED` | Approved | success |
| `DENIED` | Not approved | destructive |

### Invoice Flow

```
DRAFT  →  DUE  →  PAID
               →  (stays DUE if payment fails)
```

### Payment Flow

```
PROCESSING  →  PAID
            →  FAILED
```

### Document Flow

```
REQUIRED  →  SUBMITTED  →  APPROVED
                         →  REQUIRED (rejected, re-upload needed)
         →  EXPIRED
```

### Family Stage (plain string)

Used for high-level CRM pipeline: `"new"` → `"contacted"` → `"toured"` → `"applied"` → `"enrolled"` → `"active"` (custom strings, not an enum).

---

## 9. Directory Structure

### Full Portal Routes

```
src/app/(portal)/
├── admin/
│   ├── page.tsx                    (dashboard)
│   ├── enrollment/page.tsx         (redirect → /admin)
│   ├── billing/page.tsx
│   ├── calendar/page.tsx
│   ├── children/page.tsx
│   ├── classrooms/page.tsx
│   ├── communications/page.tsx
│   ├── documents/page.tsx
│   ├── families/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   ├── waitlist/page.tsx
│   └── [familySlug]/
│       └── page.tsx
│
└── parent/
    ├── page.tsx                    (dashboard)
    ├── enrollment/page.tsx
    ├── billing/page.tsx
    ├── documents/page.tsx
    ├── messages/page.tsx
    ├── profile/page.tsx
    ├── calendar/page.tsx
    ├── reports/page.tsx
    ├── pickups/page.tsx
    ├── children/
    │   └── [childSlug]/page.tsx
    └── daily-reports/
        └── [childSlug]/page.tsx
```

### Component Organization

```
src/components/
├── admin/          (30+ components: pages, editors, data tables)
├── parent/         (enrollment wizard, billing, documents, etc.)
├── auth/           (login, signup, reset forms)
├── marketing/      (landing page sections)
├── layout/         (shell, header, sidebar, footer)
├── shared/         (StatusBadge, PageShell, AlertBanner, etc.)
├── ui/             (shadcn primitives: Button, Card, Input, etc.)
└── reui/           (extended UI components)
```

### Server Actions

```
src/app/actions/
├── admin.ts        (~1600 lines, 15+ actions)
├── parent.ts       (~1300 lines, 10+ actions)
└── auth.ts         (login, signup, reset, invite)
```

### API Routes

```
src/app/api/
├── stripe/
│   ├── setup-intent/route.ts      (POST → createFamilySetupIntent)
│   ├── sync-setup-intent/route.ts (POST → syncSetupIntent)
│   ├── payment-intent/route.ts    (POST → createInvoicePaymentIntent)
│   └── sync-payment-intent/route.ts (POST → syncPaymentIntent)
├── cron/
│   └── autopay/route.ts           (POST → runAutopaySweep)
├── uploads/route.ts
└── public/route.ts
```

---

## 10. Architecture Notes

### Two Portal Variants

The app has two coexisting data patterns:
1. **Full portal** (`src/data/admin.ts`, `src/data/parent.ts`): Static mock data used for development/demo
2. **Minimal portal** (`src/lib/dal/minimal-portal.ts`): Real Prisma queries used in deployed routes

Route pages in `(portal)/` use the DAL functions (`getSimpleParentPortalData`, `getSimpleAdminEnrollmentData`).

### React 19 Patterns

- **`useActionState`**: Used for synchronous form submissions (admin editors, document upload)
- **`useTransition`**: Used for the enrollment wizard's save/submit/delete operations (non-blocking UI)
- All server actions follow: `"use server"` → Zod parse → `prisma.$transaction` → `AuditLog` → `revalidatePaths()` → return typed state

### Enrollment Draft Storage

The enrollment wizard draft is serialized as JSON into `EnrollmentLead.note`. This stores all ~25 form fields plus health checklist and authorized pickups as a single JSON blob. The DAL deserializes it back into a typed `ParentEnrollmentApplicationDraft` when loading.

### Authentication

- `requireRole("ADMIN")` / `requireRole("PARENT")` — session-based auth
- `getParentActionContext()` — returns `{ session, family, user, billingProfile, children, classroom }`
- All route pages are server components that call DAL before rendering

### Date & Currency Helpers

```typescript
const SCHOOL_TIME_ZONE = "America/New_York"
// TZDate from react-day-picker for timezone-aware dates
formatMonthDay(date)           // "Jan 15"
formatCurrencyFromCents(1500)  // "$15.00"
```

---

*End of report. All code excerpts are from actual source files as read during analysis.*

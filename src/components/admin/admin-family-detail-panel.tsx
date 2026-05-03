"use client"

import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"

import { AdminChildrenEditor } from "@/components/admin/admin-children-editor"
import { AdminFamilyNotes } from "@/components/admin/admin-family-notes"
import {
  DrawerBody,
  DrawerEmpty,
  DrawerField,
  DrawerFieldGrid,
} from "@/components/admin/admin-detail-drawer"
import { AdminFamilyStageEditor } from "@/components/admin/admin-family-stage-editor"
import { AdminInvoiceEditor } from "@/components/admin/admin-invoice-editor"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { StatusBadge } from "@/components/shared/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type {
  AdminChildHubRecord,
  ClassroomSummaryPreview,
  DocumentQueuePreview,
  FamilyHubRecord,
} from "@/types/app"

type DrawerTab = "overview" | "children" | "billing" | "documents" | "notes"

export function AdminFamilyDetailPanel({
  family,
  documents = [],
  classrooms = [],
}: {
  family: FamilyHubRecord
  documents?: DocumentQueuePreview[]
  classrooms?: ClassroomSummaryPreview[]
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview")
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    family.childRecords[0]?.id ?? null,
  )

  const selectedChild =
    family.childRecords.find((child) => child.id === selectedChildId) ??
    family.childRecords[0] ??
    null

  return (
    <DrawerBody className="gap-6 px-6 pb-6 pt-5">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DrawerTab)}
        className="flex min-h-0 flex-1 flex-col gap-5"
      >
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">
            Children ({family.childRecords.length})
          </TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-5">
          <DrawerFieldGrid className="gap-x-8" columns={2}>
            <DrawerField
              label="Stage"
              value={
                <StatusBadge variant="default">
                  {formatAdminLabel(family.enrollmentStage)}
                </StatusBadge>
              }
            />
            <DrawerField
              label="Balance"
              value={
                <StatusBadge variant={getFamilyBalanceVariant(family.balanceStatus)}>
                  {formatAdminLabel(family.balanceStatus)}
                </StatusBadge>
              }
            />
            <DrawerField
              label="Children"
              value={`${family.childRecords.length} enrolled`}
            />
            <DrawerField
              label="Documents due"
              value={
                family.documentsDue === 0 ? "None" : `${family.documentsDue} pending`
              }
            />
          </DrawerFieldGrid>

          <AdminFamilyStageEditor
            familyId={family.id}
            familyName={family.familyName}
            currentStage={family.enrollmentStage}
          />
        </TabsContent>

        <TabsContent
          value="children"
          className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:gap-5"
        >
          {family.childRecords.length === 0 ? (
            <DrawerEmpty title="No children registered yet." />
          ) : (
            <>
              <ChildRail
                roster={family.childRecords}
                selectedId={selectedChild?.id ?? null}
                onSelect={(id) => setSelectedChildId(id)}
              />
              <div className="min-w-0 flex-1 space-y-6">
                {selectedChild ? (
                  <>
                    <AdminChildrenEditor
                      key={selectedChild.id}
                      child={selectedChild}
                      classrooms={classrooms}
                    />
                    <ChildCareDetails child={selectedChild} />
                  </>
                ) : (
                  <DrawerEmpty title="Select a child to view their profile and daily report." />
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="billing" className="flex flex-col gap-5">
          {family.balance ? (
            <>
              <DrawerFieldGrid className="gap-x-8">
                <DrawerField label="Total due" value={family.balance.totalDue} emphasis />
                <DrawerField label="Due date" value={family.balance.dueDate} />
                <DrawerField
                  label="Status"
                  value={
                    <StatusBadge variant={getFamilyBalanceVariant(family.balance.status)}>
                      {formatAdminLabel(family.balance.status)}
                    </StatusBadge>
                  }
                />
                <DrawerField
                  label="Method"
                  value={family.balance.paymentMethodDetail ?? family.balance.method}
                />
              </DrawerFieldGrid>
              <AdminInvoiceEditor familyId={family.id} familyName={family.familyName} />
            </>
          ) : (
            <DrawerEmpty title="No billing record yet." />
          )}
        </TabsContent>

        <TabsContent value="documents" className="flex flex-col gap-5">
          {documents.length === 0 ? (
            <DrawerEmpty title="No documents pending for this family." />
          ) : (
            <DocumentBreakdown family={family} documents={documents} />
          )}
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-3">
          <AdminFamilyNotes familyId={family.id} notes={family.notes} />
        </TabsContent>
      </Tabs>
    </DrawerBody>
  )
}

/* ── Children left rail ─────────────────────────────────── */

function ChildRail({
  roster,
  selectedId,
  onSelect,
}: {
  roster: AdminChildHubRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <aside className="lg:w-72 lg:shrink-0 lg:border-r lg:border-border/50 lg:pr-4">
      <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Roster
      </p>
      <ul className="-mx-2 flex flex-col">
        {roster.map((child) => {
          const active = child.id === selectedId
          return (
            <li key={child.id}>
              <button
                type="button"
                onClick={() => onSelect(child.id)}
                aria-pressed={active}
                className={cn(
                  "group flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/40 text-foreground",
                )}
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">{child.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {child.ageLabel} · {child.classroom}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge variant={getChildAttendanceVariant(child.attendanceStatus)}>
                    {formatAdminLabel(child.attendanceStatus)}
                  </StatusBadge>
                  <ChevronRightIcon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all",
                      active
                        ? "text-primary"
                        : "text-muted-foreground/40 group-hover:translate-x-0.5 group-hover:text-foreground",
                    )}
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

/* ── Child care details: contacts, pickups, attendance ─── */

function ChildCareDetails({ child }: { child: AdminChildHubRecord }) {
  const { emergencyContacts, authorizedPickups, recentAttendance } = child
  const hasAny =
    emergencyContacts.length > 0 ||
    authorizedPickups.length > 0 ||
    recentAttendance.length > 0

  if (!hasAny) return null

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CareSection title="Emergency contacts" empty="No emergency contacts on file.">
        {emergencyContacts.length > 0 ? (
          <ul className="flex flex-col rounded-md border border-border/40">
            {emergencyContacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center justify-between gap-3 border-b border-border/40 px-3 py-2.5 last:border-b-0"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {contact.relationship} · {contact.phone}
                  </p>
                </div>
                <StatusBadge
                  variant={/^(1|primary)$/i.test(contact.priority) ? "info" : "secondary"}
                >
                  {contact.priority}
                </StatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
      </CareSection>

      <CareSection title="Authorized pickups" empty="No additional authorized pickups on file.">
        {authorizedPickups.length > 0 ? (
          <ul className="flex flex-col rounded-md border border-border/40">
            {authorizedPickups.map((pickup) => (
              <li
                key={pickup.id}
                className="flex flex-col gap-0.5 border-b border-border/40 px-3 py-2.5 last:border-b-0"
              >
                <p className="text-sm font-medium text-foreground">{pickup.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pickup.relationship} · {pickup.phone}
                </p>
                {pickup.note ? (
                  <p className="text-xs text-muted-foreground">{pickup.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </CareSection>

      <CareSection
        title="Recent attendance"
        empty="No attendance recorded yet."
        className="lg:col-span-2"
      >
        {recentAttendance.length > 0 ? (
          <ul className="flex flex-col rounded-md border border-border/40">
            {recentAttendance.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between gap-3 border-b border-border/40 px-3 py-2.5 last:border-b-0"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {record.dateLabel}
                  </p>
                  {record.note ? (
                    <p className="truncate text-xs text-muted-foreground">{record.note}</p>
                  ) : null}
                </div>
                <StatusBadge variant={getChildAttendanceVariant(record.status)}>
                  {formatAdminLabel(record.status)}
                </StatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
      </CareSection>
    </div>
  )
}

function CareSection({
  title,
  empty,
  className,
  children,
}: {
  title: string
  empty: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h4>
      {children ?? <p className="text-xs text-muted-foreground">{empty}</p>}
    </section>
  )
}

/* ── Documents grouped by household + child ─────────────── */

function DocumentBreakdown({
  family,
  documents,
}: {
  family: FamilyHubRecord
  documents: DocumentQueuePreview[]
}) {
  const familyDocs = documents.filter((doc) => doc.childName === "Family record")
  const childOrder = family.childRecords.map((child) => child.name)
  const childDocsByChild = new Map<string, DocumentQueuePreview[]>()
  for (const child of family.childRecords) {
    childDocsByChild.set(child.name, [])
  }
  for (const doc of documents) {
    if (doc.childName === "Family record") continue
    const bucket = childDocsByChild.get(doc.childName)
    if (bucket) {
      bucket.push(doc)
    } else {
      childDocsByChild.set(doc.childName, [doc])
    }
  }

  const orderedChildKeys = [
    ...childOrder.filter((name) => childDocsByChild.has(name)),
    ...Array.from(childDocsByChild.keys()).filter(
      (name) => !childOrder.includes(name),
    ),
  ]

  return (
    <>
      <DocumentGroup
        label="Household"
        sublabel="Family-level forms"
        docs={familyDocs}
      />
      {orderedChildKeys.map((childName) => {
        const docs = childDocsByChild.get(childName) ?? []
        const child = family.childRecords.find((c) => c.name === childName)
        return (
          <DocumentGroup
            key={childName}
            label={childName}
            sublabel={child ? `${child.ageLabel} · ${child.classroom}` : "Child documents"}
            docs={docs}
          />
        )
      })}
    </>
  )
}

function DocumentGroup({
  label,
  sublabel,
  docs,
}: {
  label: string
  sublabel: string
  docs: DocumentQueuePreview[]
}) {
  const dueCount = docs.filter(
    (doc) => doc.status === "required" || doc.status === "expired",
  ).length

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{label}</h4>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <span className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {docs.length === 0
            ? "No documents"
            : dueCount > 0
              ? `${dueCount} pending · ${docs.length} total`
              : `${docs.length} on file`}
        </span>
      </div>
      {docs.length > 0 ? (
        <ul className="flex flex-col rounded-md border border-border/40">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 border-b border-border/40 px-3 py-2.5 last:border-b-0 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                <p className="truncate text-xs text-muted-foreground">Due {doc.dueDate}</p>
              </div>
              <StatusBadge variant={getDocumentVariant(doc.status)}>
                {formatAdminLabel(doc.status)}
              </StatusBadge>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

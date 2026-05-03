"use client"

import { ChevronRightIcon } from "lucide-react"

import {
  DrawerBody,
  DrawerEmpty,
  DrawerField,
  DrawerFieldGrid,
} from "@/components/admin/admin-detail-drawer"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { StatusBadge } from "@/components/shared/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DocumentQueuePreview, FamilyHubRecord } from "@/types/app"
import { AdminFamilyStageEditor } from "@/components/admin/admin-family-stage-editor"
import { AdminInvoiceEditor } from "@/components/admin/admin-invoice-editor"

export function AdminFamilyDetailPanel({
  family,
  onChildSelect,
  documents = [],
}: {
  family: FamilyHubRecord
  onChildSelect: (childId: string) => void
  documents?: DocumentQueuePreview[]
}) {
  return (
    <DrawerBody className="gap-6 px-5 pb-6 pt-5">
      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-5">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children ({family.childRecords.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-5">
          <DrawerFieldGrid className="gap-x-8">
            <DrawerField
              label="Stage"
              value={
                <StatusBadge variant="default">{formatAdminLabel(family.enrollmentStage)}</StatusBadge>
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
              value={family.documentsDue === 0 ? "None" : `${family.documentsDue} pending`}
            />
          </DrawerFieldGrid>

          <AdminFamilyStageEditor
            familyId={family.id}
            familyName={family.familyName}
            currentStage={family.enrollmentStage}
          />
        </TabsContent>

        <TabsContent value="children" className="flex flex-col gap-2">
          {family.childRecords.length === 0 ? (
            <DrawerEmpty title="No children registered yet." />
          ) : (
            <ul className="-mx-2 flex flex-col">
              {family.childRecords.map((child) => (
                <li key={child.id}>
                  <button
                    type="button"
                    onClick={() => onChildSelect(child.id)}
                    className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {child.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {child.ageLabel} · {child.classroom}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <StatusBadge variant={getChildAttendanceVariant(child.attendanceStatus)}>
                          {formatAdminLabel(child.attendanceStatus)}
                        </StatusBadge>
                        {child.allergies.length > 0 ? (
                          <StatusBadge variant="warning">Allergies</StatusBadge>
                        ) : null}
                        <StatusBadge variant={getDocumentVariant(child.documentsStatus)}>
                          {formatAdminLabel(child.documentsStatus)}
                        </StatusBadge>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
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
            (() => {
              const familyDocs = documents.filter(
                (doc) => doc.childName === "Family record",
              )
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
                  // Doc references a child not in the current child list — bucket
                  // it under the unknown name so it isn't lost.
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
                        sublabel={
                          child ? `${child.ageLabel} · ${child.classroom}` : "Child documents"
                        }
                        docs={docs}
                      />
                    )
                  })}
                </>
              )
            })()
          )}
        </TabsContent>
      </Tabs>
    </DrawerBody>
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
        <ul className="-mx-2 flex flex-col rounded-md border border-border/40">
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

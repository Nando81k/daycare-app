"use client"

import { Baby, ClipboardList, FileText, Wallet } from "lucide-react"

import {
  DrawerBody,
  DrawerEmpty,
  DrawerField,
  DrawerFieldGrid,
  DrawerSection,
  DrawerSummary,
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
    <DrawerBody>
      <DrawerSummary
        title={family.familyName}
        subtitle={family.guardians.join(" · ")}
        badges={
          <>
            <StatusBadge variant={getFamilyBalanceVariant(family.balanceStatus)}>
              {formatAdminLabel(family.balanceStatus)}
            </StatusBadge>
            <StatusBadge variant="info">
              {family.childRecords.length} child{family.childRecords.length === 1 ? "" : "ren"}
            </StatusBadge>
            {family.documentsDue > 0 ? (
              <StatusBadge variant="warning">{family.documentsDue} docs due</StatusBadge>
            ) : null}
          </>
        }
        meta={
          <>
            <span>{family.primaryEmail}</span>
            <span>Stage · {formatAdminLabel(family.enrollmentStage)}</span>
          </>
        }
      />

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children ({family.childRecords.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <DrawerSection title="Household" icon={ClipboardList}>
            <DrawerFieldGrid>
              <DrawerField label="Family" value={family.familyName} />
              <DrawerField label="Primary email" value={family.primaryEmail} />
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
              <DrawerField label="Guardians" value={family.guardians.join(", ")} span={2} />
            </DrawerFieldGrid>
          </DrawerSection>

          <AdminFamilyStageEditor
            familyId={family.id}
            familyName={family.familyName}
            currentStage={family.enrollmentStage}
          />
        </TabsContent>

        <TabsContent value="children" className="flex flex-col gap-3">
          <DrawerSection title="Children" icon={Baby} padded={false} contentClassName="gap-0">
            {family.childRecords.length === 0 ? (
              <div className="p-4">
                <DrawerEmpty title="No children registered yet." />
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {family.childRecords.map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => onChildSelect(child.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {child.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {child.ageLabel} · {child.classroom}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
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
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DrawerSection>
        </TabsContent>

        <TabsContent value="billing" className="flex flex-col gap-3">
          {family.balance ? (
            <>
              <DrawerSection title="Current balance" icon={Wallet}>
                <DrawerFieldGrid>
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
              </DrawerSection>
              <AdminInvoiceEditor familyId={family.id} familyName={family.familyName} />
            </>
          ) : (
            <DrawerSection title="Current balance" icon={Wallet}>
              <DrawerEmpty title="No billing record yet." />
            </DrawerSection>
          )}
        </TabsContent>

        <TabsContent value="documents" className="flex flex-col gap-3">
          <DrawerSection
            title="Documents"
            icon={FileText}
            padded={false}
            contentClassName="gap-0"
          >
            {documents.length === 0 ? (
              <div className="p-4">
                <DrawerEmpty title="No documents pending for this family." />
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.childName} · Due {doc.dueDate}
                      </p>
                    </div>
                    <StatusBadge variant={getDocumentVariant(doc.status)}>
                      {formatAdminLabel(doc.status)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </DrawerSection>
        </TabsContent>
      </Tabs>
    </DrawerBody>
  )
}

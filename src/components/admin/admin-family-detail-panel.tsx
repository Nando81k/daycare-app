"use client"

import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
    <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-4">
      <TabsList className="w-full shrink-0">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="children">
          Children ({family.childRecords.length})
        </TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="documents">
          Documents ({documents.length})
        </TabsTrigger>
      </TabsList>

      {/* Overview tab */}
      <TabsContent value="overview" className="grid gap-5 overflow-y-auto">
        <SurfaceCard density="compact" className="gap-4 px-5 py-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
            Family overview
          </p>

          <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Balance</span>
                <StatusBadge variant={getFamilyBalanceVariant(family.balanceStatus)}>
                  {formatAdminLabel(family.balanceStatus)}
                </StatusBadge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Stage</span>
                <StatusBadge variant="default">
                  {formatAdminLabel(family.enrollmentStage)}
                </StatusBadge>
              </div>
              {family.documentsDue > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Documents</span>
                  <StatusBadge variant="warning">
                    {family.documentsDue} due
                  </StatusBadge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Children</span>
                <StatusBadge variant="info">
                  {family.childRecords.length}
                </StatusBadge>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <AdminFamilyStageEditor
          familyId={family.id}
          familyName={family.familyName}
          currentStage={family.enrollmentStage}
        />
      </TabsContent>

      {/* Children tab */}
      <TabsContent value="children" className="grid gap-5 overflow-y-auto">
        {family.childRecords.length > 0 ? (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Children
            </p>
            <div className="grid gap-2">
              {family.childRecords.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/60"
                  onClick={() => onChildSelect(child.id)}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {child.ageLabel} · {child.classroom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Open profile and daily report
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant={getChildAttendanceVariant(child.attendanceStatus)}>
                      {formatAdminLabel(child.attendanceStatus)}
                    </StatusBadge>
                    {child.allergies.length > 0 && (
                      <StatusBadge variant="warning">Allergies</StatusBadge>
                    )}
                    <StatusBadge variant={getDocumentVariant(child.documentsStatus)}>
                      {formatAdminLabel(child.documentsStatus)}
                    </StatusBadge>
                  </div>
                </button>
              ))}
            </div>
          </SurfaceCard>
        ) : (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-sm text-muted-foreground">
              No children registered for this family yet.
            </p>
          </SurfaceCard>
        )}
      </TabsContent>

      {/* Billing tab */}
      <TabsContent value="billing" className="grid gap-5 overflow-y-auto">
        {family.balance ? (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Billing
            </p>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total due</span>
                  <span className="font-medium text-foreground">{family.balance.totalDue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Due date</span>
                  <span className="text-foreground">{family.balance.dueDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge variant={getFamilyBalanceVariant(family.balance.status)}>
                    {formatAdminLabel(family.balance.status)}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-foreground">
                    {family.balance.paymentMethodDetail ?? family.balance.method}
                  </span>
                </div>
              </div>
            </div>
            <AdminInvoiceEditor
              familyId={family.id}
              familyName={family.familyName}
            />
          </SurfaceCard>
        ) : (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-sm text-muted-foreground">
              No billing record for this family yet.
            </p>
          </SurfaceCard>
        )}
      </TabsContent>
      {/* Documents tab */}
      <TabsContent value="documents" className="grid gap-5 overflow-y-auto">
        {documents.length > 0 ? (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Documents
            </p>
            <div className="grid gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.childName} · Due {doc.dueDate}
                    </p>
                  </div>
                  <StatusBadge variant={getDocumentVariant(doc.status)}>
                    {formatAdminLabel(doc.status)}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </SurfaceCard>
        ) : (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <p className="text-sm text-muted-foreground">
              No documents pending for this family.
            </p>
          </SurfaceCard>
        )}
      </TabsContent>
    </Tabs>
  )
}

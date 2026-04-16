import Link from "next/link"

import { AdminInvitePanel } from "@/components/admin/admin-invite-panel"
import { AdminSettingEditor } from "@/components/admin/admin-setting-editor"
import { AlertBanner } from "@/components/shared/alert-banner"
import { FormSection } from "@/components/shared/form-section"
import { PageShell } from "@/components/shared/page-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  adminSettingsPageContent,
  adminSettingsSections,
} from "@/data/admin"
import type { AdminSettingsSectionPreview } from "@/types/app"

export function AdminSettingsPageView({
  settingsSections = adminSettingsSections,
  adminUserId,
}: {
  settingsSections?: AdminSettingsSectionPreview[]
  adminUserId: string
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminSettingsPageContent.eyebrow}
          </p>
          <CardTitle>{adminSettingsPageContent.title}</CardTitle>
          <CardDescription>{adminSettingsPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/announcements" className={buttonVariants({ variant: "outline" })}>
              Review notifications
            </Link>
            <Link href="/" className={buttonVariants({ variant: "default" })}>
              View public site
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Policy groups</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{settingsSections.length}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Family-facing systems</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Billing and notifications</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Current editing mode</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Live policy editing</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Next integration phase</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Billing actions and document workflows</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertBanner
        tone="info"
        title="Settings still need product-level clarity"
        description="As backend integration starts, policy and defaults still need to read like a coherent admin surface instead of an isolated technical panel."
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="grid gap-6">
          {settingsSections.map((section) => (
            <FormSection
              key={section.title}
              title={section.title}
              description={section.description}
              className="rounded-[1.75rem]"
            >
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <AdminSettingEditor key={item.id} item={item} />
                ))}
              </div>
            </FormSection>
          ))}
        </div>

        <div className="grid gap-6">
          <AdminInvitePanel adminUserId={adminUserId} />

          <Card className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Cross-product alignment</p>
              <h2 className="text-xl text-foreground">What should stay consistent</h2>
            </div>
            <div className="grid gap-3">
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Billing policies here should match how due dates and reminders are described in the parent portal.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Communication expectations should align with the public website so admins are not reconciling conflicting copy later.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Notification logic should stay legible because it affects both family trust and staff workload.
              </div>
            </div>
          </Card>

          <Card className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Next backend pass</p>
              <h2 className="text-xl text-foreground">What deepens from here</h2>
            </div>
            <div className="grid gap-3">
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Settings now save back to the database and write audit history for each admin change.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Billing integrations and file/document workflows still need a later operational pass.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Shared policy settings should eventually drive the public site and parent portal instead of staying admin-only.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

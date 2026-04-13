import Link from "next/link"
import { BellRingIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { ParentSettingsEditor } from "@/components/parent/parent-settings-editor"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { parentChildProfile, parentSettings, parentSettingsPageContent } from "@/data/parent"
import type { ParentSettingsPreview } from "@/types/app"

export function ParentSettingsPageView({
  childId = parentChildProfile.id,
  settings = parentSettings,
}: {
  childId?: string
  settings?: ParentSettingsPreview
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentSettingsPageContent.eyebrow}
        title={parentSettingsPageContent.title}
        description={parentSettingsPageContent.description}
        actions={
          <>
            <Link href={`/parent/child/${childId}`} className={buttonVariants({ variant: "outline" })}>
              Pickup contacts
            </Link>
            <Link href="/parent/messages" className={buttonVariants({ variant: "ghost" })}>
              Messages
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Account email</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{settings.accountEmail}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Billing contact</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{settings.billingContact}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Notification settings</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{settings.notificationPreferences.length}</p>
        </div>
      </ParentPageHeader>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-6">
          <ParentSettingsEditor settings={settings} />

          <Card className="gap-4 px-5 py-5">
            <div className="flex items-start gap-3">
              <UserRoundIcon className="mt-1 size-5 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl text-foreground">Current account summary</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  The family email stays read-only for now, while pickup guidance remains visible as policy context instead of another editable field.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Account email</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{settings.accountEmail}</p>
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Pickup guidance</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{settings.pickupPolicy}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="gap-4 px-5 py-5">
            <div className="flex items-start gap-3">
              <BellRingIcon className="mt-1 size-5 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl text-foreground">Current notification stance</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Parents can review the live preference mix and confirm that daily summaries, messages, billing notes, and event reminders are aligned with how they want to hear from the school.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {settings.notificationPreferences.map((preference) => (
                <div
                  key={preference.id}
                  className="flex flex-col gap-3 surface-panel-quiet rounded-[1.2rem] px-4 py-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{preference.label}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{preference.description}</p>
                  </div>
                  <StatusBadge variant={preference.enabled ? "success" : "secondary"}>
                    {preference.enabled ? "On" : "Off"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-4 px-5 py-5">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="mt-1 size-5 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl text-foreground">What stays read-only here</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Emergency contacts and pickup policy are still managed with the school so identity and care notes stay clear.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

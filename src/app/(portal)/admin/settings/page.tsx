import { AdminSettingsPageView } from "@/components/admin/admin-settings-page"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getAdminPortalData } from "@/lib/dal/admin"

type SettingsTab = "general" | "security"

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: SettingsTab = tab === "security" ? "security" : "general"
  const user = await requireRole("ADMIN")
  const [{ settingsSections }, twoFactorRecord] = await Promise.all([
    getAdminPortalData(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorEnabledAt: true, twoFactorSecret: true },
    }),
  ])

  return (
    <AdminSettingsPageView
      settingsSections={settingsSections}
      adminUserId={user.id}
      twoFactor={{
        isEnabled: Boolean(twoFactorRecord?.twoFactorEnabledAt),
        hasPendingSecret: Boolean(
          twoFactorRecord?.twoFactorSecret && !twoFactorRecord?.twoFactorEnabledAt,
        ),
        enabledAtIso: twoFactorRecord?.twoFactorEnabledAt?.toISOString() ?? null,
      }}
      initialTab={initialTab}
    />
  )
}

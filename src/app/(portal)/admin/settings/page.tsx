import { AdminSettingsPageView } from "@/components/admin/admin-settings-page"
import { requireRole } from "@/lib/auth"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminSettingsPage() {
  const user = await requireRole("ADMIN")
  const { settingsSections } = await getAdminPortalData()
  return (
    <AdminSettingsPageView
      settingsSections={settingsSections}
      adminUserId={user.id}
    />
  )
}

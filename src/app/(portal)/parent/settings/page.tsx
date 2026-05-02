import { ParentSettingsPageView } from "@/components/parent/parent-settings-page"
import { getParentPortalData } from "@/lib/dal/parent"

export default async function ParentSettingsPage() {
  const data = await getParentPortalData()
  return (
    <ParentSettingsPageView
      settings={data.settings}
      childId={data.childProfile.id}
    />
  )
}

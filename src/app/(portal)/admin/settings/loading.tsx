import { PageShell } from "@/components/shared/page-shell"
import {
  FormSectionsSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminSettingsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <FormSectionsSkeleton
        sections={2}
        fieldsPerSection={5}
        layoutClass="xl:grid-cols-[1.02fr_0.98fr]"
      />
    </PageShell>
  )
}

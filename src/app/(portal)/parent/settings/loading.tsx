import { PageShell } from "@/components/shared/page-shell"
import {
  FormSectionsSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentSettingsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={3} />
      <FormSectionsSkeleton
        sections={2}
        fieldsPerSection={4}
        layoutClass="xl:grid-cols-[0.92fr_1.08fr]"
      />
    </PageShell>
  )
}

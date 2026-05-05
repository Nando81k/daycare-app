import { ProgramsPage as ProgramsPageView } from "@/components/marketing/programs-page"
import { getPublicProgramsAndPricing } from "@/lib/dal/public"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Programs & Tuition",
  description:
    "Programs by age and the tuition for every schedule, side by side. Preschool, Pre-K, and Junior Kindergarten — clear monthly rates, no surprises.",
  pathname: "/programs",
})

export const dynamic = "force-dynamic"

export default async function ProgramsRoute() {
  const data = await getPublicProgramsAndPricing()
  return <ProgramsPageView data={data} />
}

import ParentEnrollmentWizard from "@/components/parent/parent-enrollment-wizard"
import { getParentEnrollmentWizardData } from "@/lib/dal/parent"
import { buildDashboardDraftFromLead } from "@/lib/parent-enrollment"
import { getEnrollmentPricingOptions } from "@/lib/pricing-server"

export default async function ParentEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const sp = await searchParams
  const startBlank = sp.reset === "1"

  const [pricingOptions, wizardData] = await Promise.all([
    getEnrollmentPricingOptions(),
    getParentEnrollmentWizardData(),
  ])

  // When the parent clicked "Start sibling application", skip the lead resume
  // and only carry forward the family/parent identity fields so the new child
  // gets a fresh draft.
  const initialDraft =
    !startBlank && wizardData?.lead
      ? buildDashboardDraftFromLead({
          familyName: wizardData.lead.familyName,
          parentName: wizardData.lead.parentName,
          email: wizardData.lead.email,
          phone: wizardData.lead.phone,
          leadId: wizardData.lead.id,
          childName: wizardData.lead.childName,
          childAgeLabel: wizardData.lead.childAgeLabel,
          requestedStart: wizardData.lead.requestedStart,
          programInterest: wizardData.lead.programInterest,
          scheduleNeed: wizardData.lead.scheduleNeed,
          note: wizardData.lead.note,
        })
      : wizardData
        ? {
            familyName: wizardData.parent.familyName,
            parentName: wizardData.parent.parentName,
            email: wizardData.parent.email,
            phone: wizardData.parent.phone,
          }
        : undefined

  return (
    <ParentEnrollmentWizard
      pricingOptions={pricingOptions}
      initialDraft={initialDraft}
    />
  )
}

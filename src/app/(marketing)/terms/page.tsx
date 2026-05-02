import Link from "next/link"

import { LegalPageView } from "@/components/marketing/legal-page"
import { brandConfig } from "@/config/brand"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description: `Terms governing use of the ${brandConfig.name} platform by families and staff.`,
  pathname: "/terms",
})

export default function TermsPage() {
  return (
    <LegalPageView
      eyebrow="Legal"
      title="Terms of service"
      effectiveDate="May 1, 2026"
      intro={
        <p>
          These terms govern your use of the {brandConfig.name} platform. By
          creating an account or signing in, you agree to them. They apply to
          parents, guardians, staff, and any other authorized user of the
          service.
        </p>
      }
      sections={[
        {
          heading: "Eligibility + accounts",
          body: (
            <>
              <p>
                You must be at least 18 years old and the legal guardian of
                each child you enroll, or a staff member authorized by the
                center. You are responsible for keeping your sign-in credentials
                confidential and for any activity under your account. Notify us
                immediately if you suspect unauthorized access.
              </p>
            </>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Use the platform only for legitimate enrollment, billing, and
                family-communication purposes.
              </li>
              <li>
                Do not upload content that is unlawful, defamatory, or that
                contains malware, or that infringes anyone&apos;s rights.
              </li>
              <li>
                Do not attempt to disrupt the service, probe for vulnerabilities
                without our written permission, or access accounts that are not
                yours.
              </li>
              <li>
                Communications with staff must remain respectful. The center
                reserves the right to revoke portal access for behavior that
                threatens the safety of children, families, or staff.
              </li>
            </ul>
          ),
        },
        {
          heading: "Tuition + billing",
          body: (
            <>
              <p>
                Tuition, registration, materials, and any other fees are set by
                the center and reflected on the program/pricing pages. Payments
                are processed by Stripe; by completing a payment you accept
                Stripe&apos;s terms in addition to these.
              </p>
              <p>
                Invoices are due by the date shown on the invoice. Late payments
                may incur a late fee per the center&apos;s posted policy.
                Refunds are issued at the center&apos;s discretion in line with
                its withdrawal policy.
              </p>
            </>
          ),
        },
        {
          heading: "Content + ownership",
          body: (
            <>
              <p>
                You retain ownership of the documents and information you
                upload. You grant {brandConfig.name} a non-exclusive license to
                store, display, and process that content as necessary to operate
                the service.
              </p>
              <p>
                Photos and daily reports posted by staff are intended for the
                family of the child involved. You may not redistribute photos
                that include other children without their family&apos;s
                consent.
              </p>
            </>
          ),
        },
        {
          heading: "Privacy",
          body: (
            <p>
              Our handling of personal information is described in the{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              . By using the service you consent to the practices described
              there.
            </p>
          ),
        },
        {
          heading: "Service availability",
          body: (
            <p>
              We aim for high availability but do not guarantee uninterrupted
              service. The platform is provided &ldquo;as is.&rdquo; We may
              modify, suspend, or discontinue features with reasonable notice.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the maximum extent permitted by law, {brandConfig.name} is not
              liable for indirect, incidental, or consequential damages arising
              from your use of the service. Nothing in these terms limits any
              liability that cannot be excluded by law (including liability for
              death or personal injury caused by negligence).
            </p>
          ),
        },
        {
          heading: "Termination",
          body: (
            <p>
              You may close your account at any time by contacting us. We may
              suspend or terminate access for material breach of these terms,
              or where required by law. Outstanding balances remain payable
              after termination.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              We may update these terms from time to time. Material changes will
              be communicated by email and in-app notice. Continued use after
              the effective date of a change constitutes acceptance.
            </p>
          ),
        },
      ]}
    />
  )
}

import { LegalPageView } from "@/components/marketing/legal-page"
import { brandConfig } from "@/config/brand"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: `How ${brandConfig.name} collects, uses, and safeguards information about families and children.`,
  pathname: "/privacy",
})

export default function PrivacyPage() {
  return (
    <LegalPageView
      eyebrow="Legal"
      title="Privacy policy"
      effectiveDate="May 1, 2026"
      intro={
        <p>
          {brandConfig.name} (&ldquo;we,&rdquo; &ldquo;our&rdquo;) provides a
          platform that helps families and the center coordinate enrollment,
          billing, attendance, and daily updates. We take particular care with
          information about minors. This policy explains what we collect, how we
          use it, and the choices you have.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>
                <strong>Account information</strong> — your name, email, phone,
                and the password hash we use to authenticate you.
              </p>
              <p>
                <strong>Family + child profile</strong> — the child&apos;s name,
                date of birth, classroom, allergies, medical and comfort notes,
                emergency contacts, and authorized pickup contacts that you (or
                the center) provide.
              </p>
              <p>
                <strong>Enrollment + documents</strong> — the application you
                submit, the documents you upload (immunization records, signed
                agreements, identification), and any review notes.
              </p>
              <p>
                <strong>Daily updates</strong> — attendance check-in and
                check-out times, daily report content, and photos shared by
                staff.
              </p>
              <p>
                <strong>Billing</strong> — invoices, payment status, the last
                four digits and brand of saved cards (we do not store full card
                numbers; payments are processed by Stripe).
              </p>
              <p>
                <strong>Operational logs</strong> — sign-in events, IP addresses
                and user agents tied to your session, and an audit trail of
                administrative actions taken on your account.
              </p>
            </>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul className="list-disc space-y-1 pl-6">
              <li>Provide the parent + admin portals you sign in to.</li>
              <li>
                Process tuition, registration fees, and refunds through Stripe.
              </li>
              <li>
                Send transactional emails (password resets, invites, receipts,
                announcements you opted into).
              </li>
              <li>
                Detect and respond to suspicious access, abuse, or technical
                issues.
              </li>
              <li>
                Comply with our legal obligations as a child-care provider
                (record-keeping, licensing, health reporting).
              </li>
            </ul>
          ),
        },
        {
          heading: "Sharing",
          body: (
            <>
              <p>
                We do not sell personal information. We share it only with
                processors who help us operate the service:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Stripe</strong> — payment processing.
                </li>
                <li>
                  <strong>Vercel + Neon</strong> — hosting and database.
                </li>
                <li>
                  <strong>Resend</strong> — transactional email delivery.
                </li>
                <li>
                  <strong>Cloudflare</strong> — security and bot protection on
                  public forms.
                </li>
              </ul>
              <p>
                Each is bound by its own data-processing terms. We may disclose
                information if required by law or to protect a child&apos;s
                safety.
              </p>
            </>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <>
              <p>
                You can review and update profile and notification preferences
                from your portal settings page at any time. To request export or
                deletion of your family&apos;s account, contact us at the
                address below — we will respond within 30 days.
              </p>
              <p>
                Children do not interact directly with the platform. Parents or
                legal guardians make all data choices on behalf of minors in
                their care.
              </p>
            </>
          ),
        },
        {
          heading: "Retention",
          body: (
            <p>
              We retain enrollment, billing, and attendance records for the
              period required by applicable child-care licensing rules, after
              which they are deleted or anonymized. Audit logs are retained for
              two years.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              All traffic is encrypted in transit. Passwords are stored using
              salted scrypt hashes. Access to administrative tools is restricted
              by role and protected by an audit log. No system is perfectly
              secure — please contact us immediately if you suspect your account
              has been compromised.
            </p>
          ),
        },
        {
          heading: "Updates to this policy",
          body: (
            <p>
              We will revise this policy as the platform evolves. Material
              changes will be communicated by email and in-app notice before
              they take effect.
            </p>
          ),
        },
      ]}
    />
  )
}

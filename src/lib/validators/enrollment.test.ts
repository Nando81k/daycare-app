import { enrollmentApplicationSchema } from "@/lib/validators/enrollment"

describe("enrollmentApplicationSchema", () => {
  it("accepts a valid intake payload", () => {
    const result = enrollmentApplicationSchema.safeParse({
      primaryContactName: "Jordan Johnson",
      primaryContactEmail: "jordan@example.com",
      primaryContactPhone: "(555) 555-0182",
      childFirstName: "Maya",
      childLastName: "Johnson",
      childBirthDate: "2023-02-04",
      desiredProgramSlug: "preschool",
      desiredStartDate: "2026-09-01",
      emergencyContacts: "Jordan Johnson: (555) 555-0182",
      consentPolicies: true,
      consentPhoto: true,
      documents: [],
    })

    expect(result.success).toBe(true)
  })

  it("rejects missing required consents", () => {
    const result = enrollmentApplicationSchema.safeParse({
      primaryContactName: "Jordan Johnson",
      primaryContactEmail: "jordan@example.com",
      primaryContactPhone: "(555) 555-0182",
      childFirstName: "Maya",
      childLastName: "Johnson",
      childBirthDate: "2023-02-04",
      desiredProgramSlug: "preschool",
      desiredStartDate: "2026-09-01",
      emergencyContacts: "Jordan Johnson: (555) 555-0182",
      consentPolicies: false,
      consentPhoto: false,
      documents: [],
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid primary email", () => {
    const result = enrollmentApplicationSchema.safeParse({
      primaryContactName: "Jordan Johnson",
      primaryContactEmail: "bad-email",
      primaryContactPhone: "(555) 555-0182",
      childFirstName: "Maya",
      childLastName: "Johnson",
      childBirthDate: "2023-02-04",
      desiredProgramSlug: "preschool",
      desiredStartDate: "2026-09-01",
      emergencyContacts: "Jordan Johnson: (555) 555-0182",
      consentPolicies: true,
      consentPhoto: true,
      documents: [],
    })

    expect(result.success).toBe(false)
  })
})

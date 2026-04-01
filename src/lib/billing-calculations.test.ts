import {
  buildInvoiceNumber,
  calculateDepositCents,
  calculateProratedMonthlyAmountCents,
} from "@/lib/billing-calculations"

describe("billing calculations", () => {
  it("calculates deposit from weekly rate and weeks", () => {
    expect(calculateDepositCents({ weeklyRateCents: 56500, depositWeeks: 2 })).toBe(113000)
  })

  it("prorates first month based on start date", () => {
    const amount = calculateProratedMonthlyAmountCents({
      monthlyRateCents: 240000,
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      startDate: new Date("2026-04-16T00:00:00.000Z"),
    })

    expect(amount).toBe(120000)
  })

  it("returns zero when start date is beyond the period", () => {
    const amount = calculateProratedMonthlyAmountCents({
      monthlyRateCents: 240000,
      periodStart: new Date("2026-04-01T00:00:00.000Z"),
      periodEnd: new Date("2026-04-30T00:00:00.000Z"),
      startDate: new Date("2026-05-01T00:00:00.000Z"),
    })

    expect(amount).toBe(0)
  })

  it("creates deterministic invoice numbers", () => {
    expect(
      buildInvoiceNumber({
        issueDate: new Date("2026-04-15T00:00:00.000Z"),
        sequence: 12,
      })
    ).toBe("INV-202604-0012")
  })
})

import { signInSchema, signUpSchema } from "@/lib/validators/auth"

describe("auth validators", () => {
  it("accepts valid credentials payload", () => {
    const result = signInSchema.safeParse({
      email: "parent@example.com",
      password: "Parent#123",
    })

    expect(result.success).toBe(true)
  })

  it("rejects weak signup passwords", () => {
    const result = signUpSchema.safeParse({
      name: "Parent Name",
      email: "parent@example.com",
      password: "password",
    })

    expect(result.success).toBe(false)
  })
})

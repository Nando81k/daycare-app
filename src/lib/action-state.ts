export type MutationActionState = {
  success: boolean
  message: string | null
  error: string | null
  fieldErrors: Record<string, string>
  entityId?: string | null
}

export const initialMutationState: MutationActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
  entityId: null,
}

export function getMutationState(
  overrides?: Partial<MutationActionState>
): MutationActionState {
  return {
    ...initialMutationState,
    ...overrides,
  }
}

export function getFieldErrors(error: {
  flatten: () => {
    fieldErrors: Record<string, string[] | undefined>
  }
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors)
      .map(([key, value]) => [key, value?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
  )
}

export function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export function getStringListValue(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value : ""))
    .filter(Boolean)
}

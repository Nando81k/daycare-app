import type {
  ParentEnrollmentApplicationDraft,
  ParentEnrollmentHealthChecklist,
  ParentEnrollmentPickupDraft,
} from "@/types/app"

const NOTE_MARKER_START = "[DASHBOARD_DETAILS]"
const NOTE_MARKER_END = "[/DASHBOARD_DETAILS]"
const DRAFT_PLACEHOLDER = "To be confirmed"

type SerializedDraftDetails = {
  dateOfBirth: string
  homeAddress: string
  preferredStartDate: string
  primaryLanguage: string
  relationshipToChild: string
  emergencyContactName: string
  emergencyContactPhone: string
  authorizedPickups: ParentEnrollmentPickupDraft[]
  pediatricianName: string
  pediatricianPhone: string
  healthNotes: string
  healthChecklist: ParentEnrollmentHealthChecklist
  accepted: boolean
}

function encodeValue(value: unknown) {
  return encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value))
}

function decodeValue(value: string) {
  return decodeURIComponent(value)
}

function parseChildName(childName: string) {
  const trimmed = childName.trim()

  if (!trimmed) {
    return {
      childFirstName: "",
      childLastName: "",
    }
  }

  const [firstName, ...rest] = trimmed.split(/\s+/)

  return {
    childFirstName: firstName ?? "",
    childLastName: rest.join(" "),
  }
}

function sanitizeStoredValue(value: string) {
  return value === DRAFT_PLACEHOLDER ? "" : value
}

export function combineChildName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim()
}

export function createEmptyHealthChecklist(): ParentEnrollmentHealthChecklist {
  return {
    immunizationRecords: false,
    emergencyContacts: false,
    authorizedPickups: false,
    healthChanges: false,
  }
}

export function createEmptyEnrollmentApplicationDraft(params: {
  familyName: string
  parentName: string
  email: string
  phone: string
}): ParentEnrollmentApplicationDraft {
  return {
    familyName: params.familyName,
    childFirstName: "",
    childLastName: "",
    dateOfBirth: "",
    childAgeLabel: "",
    homeAddress: "",
    preferredStartDate: "",
    primaryLanguage: "",
    parentName: params.parentName,
    relationshipToChild: "",
    email: params.email,
    phone: params.phone,
    emergencyContactName: "",
    emergencyContactPhone: "",
    authorizedPickups: [],
    requestedStart: "",
    programInterest: "",
    scheduleNeed: "",
    pediatricianName: "",
    pediatricianPhone: "",
    healthNotes: "",
    healthChecklist: createEmptyHealthChecklist(),
    note: "",
    accepted: false,
  }
}

export function serializeDashboardApplicationNote(
  draft: Pick<
    ParentEnrollmentApplicationDraft,
    | "dateOfBirth"
    | "homeAddress"
    | "preferredStartDate"
    | "primaryLanguage"
    | "relationshipToChild"
    | "emergencyContactName"
    | "emergencyContactPhone"
    | "authorizedPickups"
    | "pediatricianName"
    | "pediatricianPhone"
    | "healthNotes"
    | "healthChecklist"
    | "accepted"
    | "note"
  >
) {
  const noteLines: string[] = [
    "Enrollment details saved from the parent dashboard.",
    "",
    NOTE_MARKER_START,
  ]

  const details: SerializedDraftDetails = {
    dateOfBirth: draft.dateOfBirth,
    homeAddress: draft.homeAddress,
    preferredStartDate: draft.preferredStartDate,
    primaryLanguage: draft.primaryLanguage,
    relationshipToChild: draft.relationshipToChild,
    emergencyContactName: draft.emergencyContactName,
    emergencyContactPhone: draft.emergencyContactPhone,
    authorizedPickups: draft.authorizedPickups,
    pediatricianName: draft.pediatricianName,
    pediatricianPhone: draft.pediatricianPhone,
    healthNotes: draft.healthNotes,
    healthChecklist: draft.healthChecklist,
    accepted: draft.accepted,
  }

  for (const [key, value] of Object.entries(details)) {
    noteLines.push(`${key}=${encodeValue(value)}`)
  }

  noteLines.push(NOTE_MARKER_END)

  if (draft.note.trim()) {
    noteLines.push("", draft.note.trim())
  }

  return noteLines.join("\n")
}

export function parseDashboardApplicationNote(note: string | null | undefined) {
  if (!note) {
    return {
      parsed: null,
      freeformNote: "",
    }
  }

  const startIndex = note.indexOf(NOTE_MARKER_START)
  const endIndex = note.indexOf(NOTE_MARKER_END)

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return {
      parsed: null,
      freeformNote: note.trim(),
    }
  }

  const metadataLines = note
    .slice(startIndex + NOTE_MARKER_START.length, endIndex)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const metadata = new Map<string, string>()

  for (const line of metadataLines) {
    const separatorIndex = line.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    metadata.set(line.slice(0, separatorIndex), line.slice(separatorIndex + 1))
  }

  const authorizedPickupsValue = metadata.get("authorizedPickups")
  const healthChecklistValue = metadata.get("healthChecklist")

  return {
    parsed: {
      dateOfBirth: decodeValue(metadata.get("dateOfBirth") ?? ""),
      homeAddress: decodeValue(metadata.get("homeAddress") ?? ""),
      preferredStartDate: decodeValue(metadata.get("preferredStartDate") ?? ""),
      primaryLanguage: decodeValue(metadata.get("primaryLanguage") ?? ""),
      relationshipToChild: decodeValue(metadata.get("relationshipToChild") ?? ""),
      emergencyContactName: decodeValue(metadata.get("emergencyContactName") ?? ""),
      emergencyContactPhone: decodeValue(metadata.get("emergencyContactPhone") ?? ""),
      authorizedPickups: authorizedPickupsValue
        ? (JSON.parse(decodeValue(authorizedPickupsValue)) as ParentEnrollmentPickupDraft[])
        : [],
      pediatricianName: decodeValue(metadata.get("pediatricianName") ?? ""),
      pediatricianPhone: decodeValue(metadata.get("pediatricianPhone") ?? ""),
      healthNotes: decodeValue(metadata.get("healthNotes") ?? ""),
      healthChecklist: healthChecklistValue
        ? (JSON.parse(decodeValue(healthChecklistValue)) as ParentEnrollmentHealthChecklist)
        : createEmptyHealthChecklist(),
      accepted: decodeValue(metadata.get("accepted") ?? "false") === "true",
    },
    freeformNote: note.slice(endIndex + NOTE_MARKER_END.length).trim(),
  }
}

export function buildDashboardDraftFromLead(params: {
  familyName: string
  parentName: string
  email: string
  phone: string
  leadId?: string
  childName: string
  childAgeLabel: string
  requestedStart: string
  programInterest: string
  scheduleNeed?: string | null
  note?: string | null
}) {
  const { parsed, freeformNote } = parseDashboardApplicationNote(params.note)
  const childName = parseChildName(params.childName)
  const baseDraft = createEmptyEnrollmentApplicationDraft({
    familyName: params.familyName,
    parentName: params.parentName,
    email: params.email,
    phone: params.phone,
  })

  return {
    ...baseDraft,
    leadId: params.leadId,
    childFirstName: childName.childFirstName,
    childLastName: childName.childLastName,
    childAgeLabel: sanitizeStoredValue(params.childAgeLabel),
    requestedStart: sanitizeStoredValue(params.requestedStart),
    programInterest: sanitizeStoredValue(params.programInterest),
    scheduleNeed: sanitizeStoredValue(params.scheduleNeed ?? ""),
    dateOfBirth: parsed?.dateOfBirth ?? "",
    homeAddress: parsed?.homeAddress ?? "",
    preferredStartDate: parsed?.preferredStartDate ?? "",
    primaryLanguage: parsed?.primaryLanguage ?? "",
    relationshipToChild: parsed?.relationshipToChild ?? "",
    emergencyContactName: parsed?.emergencyContactName ?? "",
    emergencyContactPhone: parsed?.emergencyContactPhone ?? "",
    authorizedPickups: parsed?.authorizedPickups ?? [],
    pediatricianName: parsed?.pediatricianName ?? "",
    pediatricianPhone: parsed?.pediatricianPhone ?? "",
    healthNotes: parsed?.healthNotes ?? "",
    healthChecklist: parsed?.healthChecklist ?? createEmptyHealthChecklist(),
    accepted: parsed?.accepted ?? false,
    note: freeformNote,
  }
}

export function getDraftPlaceholder() {
  return DRAFT_PLACEHOLDER
}

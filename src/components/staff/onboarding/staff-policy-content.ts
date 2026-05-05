import type { StaffPolicyKey } from "@/lib/validators/staff-onboarding"

/**
 * Plain-language summary of each policy the staff member must acknowledge
 * before reaching the portal. The director can replace these with the
 * official handbook copy at any time without code changes — these strings
 * are displayed verbatim in the wizard.
 */
export const STAFF_POLICIES: Record<
  StaffPolicyKey,
  { title: string; summary: string; body: string[] }
> = {
  handbook: {
    title: "Staff handbook",
    summary:
      "Daily expectations, classroom routines, communication standards, and workplace conduct.",
    body: [
      "I understand the daily expectations of my role at Ambassadors Care, including punctuality, classroom preparation, daily reporting, and communication standards.",
      "I will follow the routines and procedures outlined in the staff handbook for arrivals, transitions, meals, naps, outdoor time, and pick-up.",
      "I understand the school's standards for professional conduct, including respectful communication with children, families, and colleagues, and the boundaries around personal-device use during care hours.",
      "I will participate in scheduled training, team meetings, and parent-teacher communications as required by my role.",
    ],
  },
  safeguarding: {
    title: "Child safeguarding & reporting",
    summary:
      "Mandatory reporting, child-protection procedures, and the boundaries that keep every child safe.",
    body: [
      "I understand that every adult on staff is a mandated reporter. I will immediately report any suspected abuse, neglect, or unsafe situation to the director, in writing, and cooperate with any follow-up investigation.",
      "I will never be alone with a child in a closed, unobserved space, and I will follow the school's two-adult-rule for diapering, toileting, and any one-on-one care.",
      "I will not photograph or share images of children outside the school's official communication channels, and I will never share a child's information with anyone outside their authorized pickup list.",
      "I understand that any breach of safeguarding policy is grounds for immediate termination and may be reported to the relevant authorities.",
    ],
  },
  code_of_conduct: {
    title: "Code of conduct & confidentiality",
    summary:
      "Personal conduct, confidentiality of family information, and the trust that holds the school together.",
    body: [
      "I will treat every child, family, and colleague with respect, regardless of background, ability, faith, or family structure.",
      "I will keep all information about families — health, financial, behavioural, and personal — strictly confidential and discuss it only with colleagues directly responsible for the child's care.",
      "I will not accept gifts, payments, or favours from families that could compromise my professional judgement, and I will disclose any potential conflict of interest to the director.",
      "I understand that violating this code may result in disciplinary action, up to and including termination of employment.",
    ],
  },
}

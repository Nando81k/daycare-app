/**
 * Shared label used to flag a `MessageThread` as a billing inquiry. Threads
 * with this `classroomLabel` are routed exclusively to admins (filtered out
 * of the teacher inbox in `getTeacherMessagesData`) and surface as a "Billing"
 * pill in the admin messaging workspace.
 */
export const BILLING_THREAD_LABEL = "Billing"

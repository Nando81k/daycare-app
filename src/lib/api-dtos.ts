import type {
  Child,
  ChildTuitionContract,
  EnrollmentApplication,
  Invoice,
  PaymentTransaction,
  TuitionPlan,
  User,
} from '@prisma/client';

export type ParentSafeChild = Pick<
  Child,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'dateOfBirth'
  | 'allergies'
  | 'medicalNotes'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'photoStorageKey'
  | 'photoMimeType'
  | 'photoSizeBytes'
  | 'photoUploadedAt'
>;

export type ParentSafeEnrollment = Pick<
  EnrollmentApplication,
  | 'id'
  | 'childId'
  | 'status'
  | 'programType'
  | 'startDate'
  | 'notes'
  | 'reviewNotes'
  | 'decisionReason'
  | 'createdAt'
  | 'updatedAt'
  | 'spotHoldExpiresAt'
  | 'spotSecuredAt'
  | 'selectedCadence'
>;

export type AdminFamilyRow = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'isActive' | 'createdAt'> & {
  childrenCount: number;
  outstandingBalanceCents: number;
};

export type AdminPlanRow = Pick<TuitionPlan, 'id' | 'name' | 'programType' | 'monthlyAmountCents' | 'registrationFeeCents' | 'allowMonthly' | 'allowBiweekly' | 'allowWeekly' | 'isActive'>;

export type AdminContractRow = Pick<
  ChildTuitionContract,
  | 'id'
  | 'parentId'
  | 'childId'
  | 'tuitionPlanId'
  | 'billingCadence'
  | 'recurringAmountCents'
  | 'invoiceDay'
  | 'status'
  | 'autoPayEnabled'
  | 'graceDays'
  | 'lateFeeCents'
  | 'startDate'
>;

export type AdminInvoiceRow = Pick<
  Invoice,
  | 'id'
  | 'invoiceNumber'
  | 'status'
  | 'issueDate'
  | 'dueDate'
  | 'totalCents'
  | 'amountDueCents'
  | 'paidAt'
  | 'parentId'
  | 'childId'
  | 'contractId'
>;

export type AdminPaymentRow = Pick<
  PaymentTransaction,
  | 'id'
  | 'parentId'
  | 'invoiceId'
  | 'amountCents'
  | 'status'
  | 'paymentMethod'
  | 'failureReason'
  | 'processedAt'
  | 'createdAt'
>;

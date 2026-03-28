import bcrypt from 'bcryptjs';
import {
  AdminRole,
  BillingCadence,
  ContractStatus,
  EnrollmentStatus,
  FamilyCrmStage,
  FamilyCrmTaskPriority,
  FamilyCrmTaskStatus,
  InvoiceStatus,
  PaymentStatus,
  PrismaClient,
  ProgramType,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@ambassadorscare.com';
const PARENT_EMAIL = 'parent@ambassadorscare.com';
const ADMIN_PASSWORD = 'AdminPassword123!';
const PARENT_PASSWORD = 'ParentPassword123!';

function dateDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toMonthlyFromCadence(monthly: number, cadence: BillingCadence) {
  if (cadence === BillingCadence.MONTHLY) return monthly;
  if (cadence === BillingCadence.BIWEEKLY) return Math.round((monthly * 12) / 26);
  return Math.round((monthly * 12) / 52);
}

function deriveSuggestedCrmStage(input: {
  childrenCount: number;
  hasPendingOrRequestInfoEnrollment: boolean;
  hasApprovedWithoutSecuredSpot: boolean;
  hasActiveContract: boolean;
  openInvoiceCount: number;
  pastDueInvoiceCount: number;
  outstandingBalanceCents: number;
}): FamilyCrmStage {
  const billingRisk =
    input.pastDueInvoiceCount > 0 ||
    (input.openInvoiceCount >= 3 && input.outstandingBalanceCents > 0);
  if (billingRisk) return FamilyCrmStage.AT_RISK_BILLING;
  if (input.hasApprovedWithoutSecuredSpot) return FamilyCrmStage.APPROVED_AWAITING_SPOT;
  if (input.hasPendingOrRequestInfoEnrollment) return FamilyCrmStage.ADMISSIONS_REVIEW;
  if (input.hasActiveContract) return FamilyCrmStage.ACTIVE_FAMILY;
  if (input.childrenCount > 0) return FamilyCrmStage.INTAKE_INCOMPLETE;
  return FamilyCrmStage.LEAD;
}

async function main() {
  console.log('🌱 Seeding v3 baseline...');

  const [adminHash, parentHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 12),
    bcrypt.hash(PARENT_PASSWORD, 12),
  ]);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      firstName: 'Avery',
      lastName: 'Director',
      role: UserRole.ADMIN,
      adminRole: AdminRole.DIRECTOR,
      isActive: true,
      passwordHash: adminHash,
    },
    create: {
      email: ADMIN_EMAIL,
      firstName: 'Avery',
      lastName: 'Director',
      role: UserRole.ADMIN,
      adminRole: AdminRole.DIRECTOR,
      isActive: true,
      phone: '(555) 555-1000',
      passwordHash: adminHash,
    },
  });

  const billingUser = await prisma.user.upsert({
    where: { email: 'billing@ambassadorscare.com' },
    update: {
      firstName: 'Blair',
      lastName: 'Billing',
      role: UserRole.ADMIN,
      adminRole: AdminRole.BILLING,
      isActive: true,
      passwordHash: adminHash,
    },
    create: {
      email: 'billing@ambassadorscare.com',
      firstName: 'Blair',
      lastName: 'Billing',
      role: UserRole.ADMIN,
      adminRole: AdminRole.BILLING,
      isActive: true,
      phone: '(555) 555-1100',
      passwordHash: adminHash,
    },
  });

  const admissionsUser = await prisma.user.upsert({
    where: { email: 'admissions@ambassadorscare.com' },
    update: {
      firstName: 'Jordan',
      lastName: 'Admissions',
      role: UserRole.ADMIN,
      adminRole: AdminRole.ADMISSIONS,
      isActive: true,
      passwordHash: adminHash,
    },
    create: {
      email: 'admissions@ambassadorscare.com',
      firstName: 'Jordan',
      lastName: 'Admissions',
      role: UserRole.ADMIN,
      adminRole: AdminRole.ADMISSIONS,
      isActive: true,
      phone: '(555) 555-1200',
      passwordHash: adminHash,
    },
  });

  const primaryParent = await prisma.user.upsert({
    where: { email: PARENT_EMAIL },
    update: {
      firstName: 'Pat',
      lastName: 'Parent',
      role: UserRole.PARENT,
      adminRole: null,
      isActive: true,
      passwordHash: parentHash,
    },
    create: {
      email: PARENT_EMAIL,
      firstName: 'Pat',
      lastName: 'Parent',
      role: UserRole.PARENT,
      isActive: true,
      phone: '(555) 555-2000',
      passwordHash: parentHash,
    },
  });

  await prisma.centerBillingPolicy.upsert({
    where: { key: 'PRIMARY' },
    update: {
      graceDays: 3,
      lateFeeCents: 2500,
      pauseAfterDaysPastDue: 14,
      reminderOffsets: [7, 3, 0],
      holdHours: 24,
    },
    create: {
      key: 'PRIMARY',
      graceDays: 3,
      lateFeeCents: 2500,
      pauseAfterDaysPastDue: 14,
      reminderOffsets: [7, 3, 0],
      holdHours: 24,
    },
  });

  const tuitionPlans = await Promise.all([
    prisma.tuitionPlan.upsert({
      where: { id: 'plan_infant_monthly' },
      update: {
        name: 'Infant Full-Time',
        programType: ProgramType.INFANT,
        monthlyAmountCents: 165000,
        registrationFeeCents: 45000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: true,
        isActive: true,
      },
      create: {
        id: 'plan_infant_monthly',
        name: 'Infant Full-Time',
        programType: ProgramType.INFANT,
        monthlyAmountCents: 165000,
        registrationFeeCents: 45000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: true,
        isActive: true,
      },
    }),
    prisma.tuitionPlan.upsert({
      where: { id: 'plan_toddler_monthly' },
      update: {
        name: 'Toddler Full-Time',
        programType: ProgramType.TODDLER,
        monthlyAmountCents: 145000,
        registrationFeeCents: 40000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: true,
        isActive: true,
      },
      create: {
        id: 'plan_toddler_monthly',
        name: 'Toddler Full-Time',
        programType: ProgramType.TODDLER,
        monthlyAmountCents: 145000,
        registrationFeeCents: 40000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: true,
        isActive: true,
      },
    }),
    prisma.tuitionPlan.upsert({
      where: { id: 'plan_prek_monthly' },
      update: {
        name: 'Pre-K Full-Time',
        programType: ProgramType.PRE_K,
        monthlyAmountCents: 120000,
        registrationFeeCents: 35000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: false,
        isActive: true,
      },
      create: {
        id: 'plan_prek_monthly',
        name: 'Pre-K Full-Time',
        programType: ProgramType.PRE_K,
        monthlyAmountCents: 120000,
        registrationFeeCents: 35000,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: false,
        isActive: true,
      },
    }),
  ]);

  const familyUsers = [primaryParent];

  for (let i = 1; i <= 11; i += 1) {
    const email = `family${i}@ambassadorscare.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: `Family${i}`,
        lastName: 'Parent',
        role: UserRole.PARENT,
        isActive: true,
        passwordHash: parentHash,
      },
      create: {
        email,
        firstName: `Family${i}`,
        lastName: 'Parent',
        role: UserRole.PARENT,
        isActive: true,
        phone: `(555) 501-${String(i).padStart(4, '0')}`,
        passwordHash: parentHash,
      },
    });
    familyUsers.push(user);
  }

  let invoiceCounter = 1000;

  for (const [familyIndex, family] of familyUsers.entries()) {
    const childCount = familyIndex % 3 === 0 ? 2 : 1;

    for (let c = 0; c < childCount; c += 1) {
      const firstName = `Child${familyIndex + 1}${c + 1}`;
      const lastName = family.lastName;
      const child = await prisma.child.upsert({
        where: {
          id: `child_${family.id}_${c + 1}`,
        },
        update: {
          firstName,
          lastName,
          dateOfBirth:
            c % 2 === 0
              ? new Date('2022-05-01T00:00:00.000Z')
              : new Date('2020-11-01T00:00:00.000Z'),
          allergies: c % 2 === 0 ? 'Peanut allergy' : null,
          medicalNotes: c % 2 === 0 ? 'Carry EpiPen' : null,
          emergencyContactName: `${family.firstName} ${family.lastName}`,
          emergencyContactPhone: family.phone,
          parentId: family.id,
        },
        create: {
          id: `child_${family.id}_${c + 1}`,
          parentId: family.id,
          firstName,
          lastName,
          dateOfBirth:
            c % 2 === 0
              ? new Date('2022-05-01T00:00:00.000Z')
              : new Date('2020-11-01T00:00:00.000Z'),
          allergies: c % 2 === 0 ? 'Peanut allergy' : null,
          medicalNotes: c % 2 === 0 ? 'Carry EpiPen' : null,
          emergencyContactName: `${family.firstName} ${family.lastName}`,
          emergencyContactPhone: family.phone,
        },
      });

      const enrollmentStatusPool: EnrollmentStatus[] = [
        EnrollmentStatus.PENDING,
        EnrollmentStatus.APPROVED,
        EnrollmentStatus.REQUEST_INFO,
        EnrollmentStatus.WAITLISTED,
        EnrollmentStatus.DENIED,
      ];
      const enrollmentStatus = enrollmentStatusPool[(familyIndex + c) % enrollmentStatusPool.length];
      const programTypePool: ProgramType[] = [
        ProgramType.INFANT,
        ProgramType.TODDLER,
        ProgramType.PRESCHOOL,
        ProgramType.PRE_K,
      ];
      const programType = programTypePool[(familyIndex + c) % programTypePool.length];

      const enrollment = await prisma.enrollmentApplication.upsert({
        where: { id: `enrollment_${child.id}` },
        update: {
          parentId: family.id,
          childId: child.id,
          status: enrollmentStatus,
          programType,
          startDate: dateDaysFromNow(14 + familyIndex),
          notes: 'Family submitted intake through v3 wizard.',
          reviewNotes:
            enrollmentStatus === EnrollmentStatus.PENDING
              ? null
              : 'Reviewed and triaged by admissions.',
          decisionReason:
            enrollmentStatus === EnrollmentStatus.REQUEST_INFO
              ? 'Need updated immunization records.'
              : enrollmentStatus === EnrollmentStatus.WAITLISTED
                ? 'Current classroom capacity reached.'
                : enrollmentStatus === EnrollmentStatus.DENIED
                  ? 'Start date request outside available windows.'
                  : null,
          reviewedById:
            enrollmentStatus === EnrollmentStatus.PENDING ? null : admissionsUser.id,
          reviewedAt: enrollmentStatus === EnrollmentStatus.PENDING ? null : new Date(),
          approvedAt: enrollmentStatus === EnrollmentStatus.APPROVED ? new Date() : null,
          selectedCadence:
            enrollmentStatus === EnrollmentStatus.APPROVED
              ? BillingCadence.MONTHLY
              : null,
          spotHoldExpiresAt:
            enrollmentStatus === EnrollmentStatus.APPROVED
              ? dateDaysFromNow(1)
              : null,
          spotSecuredAt:
            enrollmentStatus === EnrollmentStatus.APPROVED && familyIndex % 2 === 0
              ? new Date()
              : null,
        },
        create: {
          id: `enrollment_${child.id}`,
          parentId: family.id,
          childId: child.id,
          status: enrollmentStatus,
          programType,
          startDate: dateDaysFromNow(14 + familyIndex),
          notes: 'Family submitted intake through v3 wizard.',
          reviewNotes:
            enrollmentStatus === EnrollmentStatus.PENDING
              ? null
              : 'Reviewed and triaged by admissions.',
          decisionReason:
            enrollmentStatus === EnrollmentStatus.REQUEST_INFO
              ? 'Need updated immunization records.'
              : enrollmentStatus === EnrollmentStatus.WAITLISTED
                ? 'Current classroom capacity reached.'
                : enrollmentStatus === EnrollmentStatus.DENIED
                  ? 'Start date request outside available windows.'
                  : null,
          reviewedById:
            enrollmentStatus === EnrollmentStatus.PENDING ? null : admissionsUser.id,
          reviewedAt: enrollmentStatus === EnrollmentStatus.PENDING ? null : new Date(),
          approvedAt: enrollmentStatus === EnrollmentStatus.APPROVED ? new Date() : null,
          selectedCadence:
            enrollmentStatus === EnrollmentStatus.APPROVED
              ? BillingCadence.MONTHLY
              : null,
          spotHoldExpiresAt:
            enrollmentStatus === EnrollmentStatus.APPROVED
              ? dateDaysFromNow(1)
              : null,
          spotSecuredAt:
            enrollmentStatus === EnrollmentStatus.APPROVED && familyIndex % 2 === 0
              ? new Date()
              : null,
        },
      });

      if (enrollment.status === EnrollmentStatus.APPROVED && enrollment.spotSecuredAt) {
        const cadencePool: BillingCadence[] = [BillingCadence.MONTHLY, BillingCadence.BIWEEKLY, BillingCadence.WEEKLY];
        const cadence = cadencePool[(familyIndex + c) % cadencePool.length];
        const chosenPlan =
          tuitionPlans.find((plan) => plan.programType === enrollment.programType) || tuitionPlans[1];
        const recurringAmount = toMonthlyFromCadence(chosenPlan.monthlyAmountCents, cadence);

        const contract = await prisma.childTuitionContract.upsert({
          where: { id: `contract_${child.id}` },
          update: {
            parentId: family.id,
            childId: child.id,
            tuitionPlanId: chosenPlan.id,
            billingCadence: cadence,
            recurringAmountCents: recurringAmount,
            invoiceDay: 1 + ((familyIndex + c) % 25),
            startDate: dateDaysFromNow(7),
            nextChargeDate: dateDaysFromNow(30),
            status: familyIndex % 7 === 0 ? ContractStatus.PAUSED : ContractStatus.ACTIVE,
            autoPayEnabled: true,
            graceDays: 3,
            lateFeeCents: 2500,
            stripeSubscriptionId: `sub_v3_${child.id}`,
          },
          create: {
            id: `contract_${child.id}`,
            parentId: family.id,
            childId: child.id,
            tuitionPlanId: chosenPlan.id,
            billingCadence: cadence,
            recurringAmountCents: recurringAmount,
            invoiceDay: 1 + ((familyIndex + c) % 25),
            startDate: dateDaysFromNow(7),
            nextChargeDate: dateDaysFromNow(30),
            status: familyIndex % 7 === 0 ? ContractStatus.PAUSED : ContractStatus.ACTIVE,
            autoPayEnabled: true,
            graceDays: 3,
            lateFeeCents: 2500,
            stripeSubscriptionId: `sub_v3_${child.id}`,
          },
        });

        for (let monthOffset = -1; monthOffset <= 1; monthOffset += 1) {
          invoiceCounter += 1;
          const issueDate = dateDaysFromNow(monthOffset * 30 - 5);
          const dueDate = dateDaysFromNow(monthOffset * 30);
          const isPast = monthOffset < 0;
          const isCurrent = monthOffset === 0;
          const invoiceStatus = isPast
            ? familyIndex % 5 === 0
              ? InvoiceStatus.PAST_DUE
              : InvoiceStatus.PAID
            : isCurrent
              ? familyIndex % 4 === 0
                ? InvoiceStatus.PAST_DUE
                : InvoiceStatus.OPEN
              : InvoiceStatus.OPEN;

          const totalCents = recurringAmount;
          const amountDue = invoiceStatus === InvoiceStatus.PAID ? 0 : totalCents;

          const invoice = await prisma.invoice.upsert({
            where: { invoiceNumber: `INV-${invoiceCounter}` },
            update: {
              contractId: contract.id,
              parentId: family.id,
              childId: child.id,
              status: invoiceStatus,
              issueDate,
              dueDate,
              totalCents,
              amountDueCents: amountDue,
              paidAt: invoiceStatus === InvoiceStatus.PAID ? dateDaysFromNow(monthOffset * 30 + 1) : null,
            },
            create: {
              contractId: contract.id,
              parentId: family.id,
              childId: child.id,
              invoiceNumber: `INV-${invoiceCounter}`,
              status: invoiceStatus,
              issueDate,
              dueDate,
              totalCents,
              amountDueCents: amountDue,
              paidAt: invoiceStatus === InvoiceStatus.PAID ? dateDaysFromNow(monthOffset * 30 + 1) : null,
            },
          });

          await prisma.invoiceLineItem.upsert({
            where: { id: `line_${invoice.id}` },
            update: {
              invoiceId: invoice.id,
              description: `${chosenPlan.name} Tuition`,
              quantity: 1,
              unitAmountCents: totalCents,
              totalAmountCents: totalCents,
            },
            create: {
              id: `line_${invoice.id}`,
              invoiceId: invoice.id,
              description: `${chosenPlan.name} Tuition`,
              quantity: 1,
              unitAmountCents: totalCents,
              totalAmountCents: totalCents,
            },
          });

          const paymentStatus =
            invoiceStatus === InvoiceStatus.PAID
              ? PaymentStatus.SUCCEEDED
              : invoiceStatus === InvoiceStatus.PAST_DUE
                ? PaymentStatus.FAILED
                : null;

          if (paymentStatus) {
            await prisma.paymentTransaction.upsert({
              where: { id: `payment_${invoice.id}` },
              update: {
                parentId: family.id,
                invoiceId: invoice.id,
                amountCents: totalCents,
                status: paymentStatus,
                paymentMethod: 'card',
                processedAt: paymentStatus === PaymentStatus.SUCCEEDED ? new Date() : null,
                failureReason: paymentStatus === PaymentStatus.FAILED ? 'Insufficient funds' : null,
                stripePaymentIntentId: `pi_${invoice.id}`,
                stripeChargeId: paymentStatus === PaymentStatus.SUCCEEDED ? `ch_${invoice.id}` : null,
              },
              create: {
                id: `payment_${invoice.id}`,
                parentId: family.id,
                invoiceId: invoice.id,
                amountCents: totalCents,
                status: paymentStatus,
                paymentMethod: 'card',
                processedAt: paymentStatus === PaymentStatus.SUCCEEDED ? new Date() : null,
                failureReason: paymentStatus === PaymentStatus.FAILED ? 'Insufficient funds' : null,
                stripePaymentIntentId: `pi_${invoice.id}`,
                stripeChargeId: paymentStatus === PaymentStatus.SUCCEEDED ? `ch_${invoice.id}` : null,
              },
            });
          }
        }
      }

      await prisma.communicationEvent.create({
        data: {
          parentId: family.id,
          createdByAdminId: admissionsUser.id,
          childId: child.id,
          enrollmentId: enrollment.id,
          type: 'ENROLLMENT',
          channel: 'IN_APP',
          status: 'SENT',
          subject: 'Enrollment update',
          message: `Application for ${child.firstName} is currently ${enrollment.status}.`,
        },
      });

      if (familyIndex % 4 === 0) {
        await prisma.communicationEvent.create({
          data: {
            parentId: family.id,
            createdByAdminId: billingUser.id,
            childId: child.id,
            type: 'BILLING',
            channel: 'IN_APP',
            status: 'SENT',
            subject: 'Billing reminder',
            message: `Your upcoming tuition cycle for ${child.firstName} starts soon. Review due invoices in Billing.`,
          },
        });
      }
    }
  }

  const defaultTags = await Promise.all([
    prisma.familyCrmTag.upsert({
      where: { name: 'High Priority' },
      update: { color: '#B24545', isSystem: true, sortOrder: 10 },
      create: { name: 'High Priority', color: '#B24545', isSystem: true, sortOrder: 10 },
    }),
    prisma.familyCrmTag.upsert({
      where: { name: 'Billing Watch' },
      update: { color: '#A06A1A', isSystem: true, sortOrder: 20 },
      create: { name: 'Billing Watch', color: '#A06A1A', isSystem: true, sortOrder: 20 },
    }),
    prisma.familyCrmTag.upsert({
      where: { name: 'Needs Follow-up' },
      update: { color: '#4C6078', isSystem: true, sortOrder: 30 },
      create: { name: 'Needs Follow-up', color: '#4C6078', isSystem: true, sortOrder: 30 },
    }),
  ]);

  const crmOwnerPool = [adminUser.id, admissionsUser.id, billingUser.id];
  const parentRows = await prisma.user.findMany({
    where: { role: UserRole.PARENT },
    select: { id: true },
  });
  await prisma.familyCrmProfile.createMany({
    data: parentRows.map((row) => ({ parentId: row.id })),
    skipDuplicates: true,
  });

  for (const [index, parent] of parentRows.entries()) {
    const [childrenCount, enrollments, contracts, invoiceAgg, invoiceCounts] = await Promise.all([
      prisma.child.count({ where: { parentId: parent.id } }),
      prisma.enrollmentApplication.findMany({
        where: { parentId: parent.id },
        select: { status: true, spotSecuredAt: true },
      }),
      prisma.childTuitionContract.findMany({
        where: { parentId: parent.id },
        select: { status: true },
      }),
      prisma.invoice.aggregate({
        where: { parentId: parent.id, status: { in: [InvoiceStatus.OPEN, InvoiceStatus.PAST_DUE] } },
        _sum: { amountDueCents: true },
      }),
      prisma.invoice.groupBy({
        where: { parentId: parent.id, status: { in: [InvoiceStatus.OPEN, InvoiceStatus.PAST_DUE] } },
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const openInvoiceCount = invoiceCounts.find((item) => item.status === InvoiceStatus.OPEN)?._count._all ?? 0;
    const pastDueInvoiceCount = invoiceCounts.find((item) => item.status === InvoiceStatus.PAST_DUE)?._count._all ?? 0;
    const suggestedStage = deriveSuggestedCrmStage({
      childrenCount,
      hasPendingOrRequestInfoEnrollment: enrollments.some(
        (enrollment) =>
          enrollment.status === EnrollmentStatus.PENDING ||
          enrollment.status === EnrollmentStatus.REQUEST_INFO,
      ),
      hasApprovedWithoutSecuredSpot: enrollments.some(
        (enrollment) => enrollment.status === EnrollmentStatus.APPROVED && !enrollment.spotSecuredAt,
      ),
      hasActiveContract: contracts.some((contract) => contract.status === ContractStatus.ACTIVE),
      openInvoiceCount,
      pastDueInvoiceCount,
      outstandingBalanceCents: invoiceAgg._sum.amountDueCents ?? 0,
    });

    const profile = await prisma.familyCrmProfile.update({
      where: { parentId: parent.id },
      data: {
        stage: suggestedStage,
        suggestedStage,
        ownerAdminId: crmOwnerPool[index % crmOwnerPool.length],
        isStageManuallyOverridden: false,
        nextFollowUpAt:
          suggestedStage === FamilyCrmStage.ACTIVE_FAMILY
            ? null
            : dateDaysFromNow(1 + (index % 7)),
        lastContactedAt: dateDaysFromNow(-(index % 5)),
      },
    });

    const tagIds: string[] = [];
    if (suggestedStage === FamilyCrmStage.AT_RISK_BILLING) {
      tagIds.push(defaultTags[0].id, defaultTags[1].id);
    } else if (
      suggestedStage === FamilyCrmStage.ADMISSIONS_REVIEW ||
      suggestedStage === FamilyCrmStage.APPROVED_AWAITING_SPOT
    ) {
      tagIds.push(defaultTags[2].id);
    }
    if (tagIds.length) {
      await prisma.familyCrmProfileTag.createMany({
        data: tagIds.map((tagId) => ({
          profileId: profile.id,
          tagId,
          assignedByAdminId: admissionsUser.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  for (const family of familyUsers.slice(0, 6)) {
    const profile = await prisma.familyCrmProfile.findUnique({
      where: { parentId: family.id },
      select: { id: true, stage: true, ownerAdminId: true },
    });
    if (!profile) continue;

    const firstChild = await prisma.child.findFirst({
      where: { parentId: family.id },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.familyCrmTask.upsert({
      where: { id: `crm_task_${family.id}` },
      update: {
        profileId: profile.id,
        title: 'Follow up with family intake details',
        description: 'Confirm start-date preferences and any outstanding admissions notes.',
        status: profile.stage === FamilyCrmStage.ACTIVE_FAMILY ? FamilyCrmTaskStatus.DONE : FamilyCrmTaskStatus.OPEN,
        priority:
          profile.stage === FamilyCrmStage.AT_RISK_BILLING
            ? FamilyCrmTaskPriority.URGENT
            : FamilyCrmTaskPriority.MEDIUM,
        dueAt: dateDaysFromNow(profile.stage === FamilyCrmStage.AT_RISK_BILLING ? -1 : 2),
        ownerAdminId: profile.ownerAdminId ?? admissionsUser.id,
        createdByAdminId: admissionsUser.id,
        childId: firstChild?.id ?? null,
        completedAt: profile.stage === FamilyCrmStage.ACTIVE_FAMILY ? new Date() : null,
      },
      create: {
        id: `crm_task_${family.id}`,
        profileId: profile.id,
        title: 'Follow up with family intake details',
        description: 'Confirm start-date preferences and any outstanding admissions notes.',
        status: profile.stage === FamilyCrmStage.ACTIVE_FAMILY ? FamilyCrmTaskStatus.DONE : FamilyCrmTaskStatus.OPEN,
        priority:
          profile.stage === FamilyCrmStage.AT_RISK_BILLING
            ? FamilyCrmTaskPriority.URGENT
            : FamilyCrmTaskPriority.MEDIUM,
        dueAt: dateDaysFromNow(profile.stage === FamilyCrmStage.AT_RISK_BILLING ? -1 : 2),
        ownerAdminId: profile.ownerAdminId ?? admissionsUser.id,
        createdByAdminId: admissionsUser.id,
        childId: firstChild?.id ?? null,
        completedAt: profile.stage === FamilyCrmStage.ACTIVE_FAMILY ? new Date() : null,
      },
    });

    await prisma.familyCrmNote.upsert({
      where: { id: `crm_note_${family.id}` },
      update: {
        profileId: profile.id,
        createdByAdminId: admissionsUser.id,
        body: 'Initial CRM profile seeded with admissions and billing context.',
        isPinned: profile.stage !== FamilyCrmStage.ACTIVE_FAMILY,
      },
      create: {
        id: `crm_note_${family.id}`,
        profileId: profile.id,
        createdByAdminId: admissionsUser.id,
        body: 'Initial CRM profile seeded with admissions and billing context.',
        isPinned: profile.stage !== FamilyCrmStage.ACTIVE_FAMILY,
      },
    });
  }

  await prisma.familyCrmSavedView.upsert({
    where: { id: `crm_view_${adminUser.id}_priority` },
    update: {
      adminUserId: adminUser.id,
      name: 'My Priority Families',
      isDefault: true,
      filtersJson: {
        query: '',
        stage: 'ALL',
        ownerId: adminUser.id,
        tag: 'ALL',
        taskState: 'OVERDUE',
        balanceState: 'ALL',
      },
    },
    create: {
      id: `crm_view_${adminUser.id}_priority`,
      adminUserId: adminUser.id,
      name: 'My Priority Families',
      isDefault: true,
      filtersJson: {
        query: '',
        stage: 'ALL',
        ownerId: adminUser.id,
        tag: 'ALL',
        taskState: 'OVERDUE',
        balanceState: 'ALL',
      },
    },
  });

  await prisma.familyCrmSavedView.upsert({
    where: { id: `crm_view_${admissionsUser.id}_admissions` },
    update: {
      adminUserId: admissionsUser.id,
      name: 'Admissions Follow-up',
      isDefault: true,
      filtersJson: {
        query: '',
        stage: 'ADMISSIONS_REVIEW',
        ownerId: 'ALL',
        tag: 'ALL',
        taskState: 'ALL',
        balanceState: 'ALL',
      },
    },
    create: {
      id: `crm_view_${admissionsUser.id}_admissions`,
      adminUserId: admissionsUser.id,
      name: 'Admissions Follow-up',
      isDefault: true,
      filtersJson: {
        query: '',
        stage: 'ADMISSIONS_REVIEW',
        ownerId: 'ALL',
        tag: 'ALL',
        taskState: 'ALL',
        balanceState: 'ALL',
      },
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: 'SYSTEM_REBUILD_V3_SEEDED',
        targetType: 'SYSTEM',
        targetId: 'v3',
      },
      {
        actorId: admissionsUser.id,
        action: 'ADMISSIONS_QUEUE_INITIALIZED',
        targetType: 'ENROLLMENT',
        targetId: 'seed',
      },
      {
        actorId: billingUser.id,
        action: 'BILLING_RECEIVABLES_INITIALIZED',
        targetType: 'INVOICE',
        targetId: 'seed',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete');
  console.log('Admin login:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  console.log('Parent login:', PARENT_EMAIL, '/', PARENT_PASSWORD);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

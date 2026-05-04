"use server"

import { revalidatePath } from "next/cache"

import {
  getFieldErrors,
  getMutationState,
  getStringValue,
  type MutationActionState,
} from "@/lib/action-state"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  createTeacherThreadSchema,
  sendTeacherReplySchema,
} from "@/lib/validators/teacher"

function revalidateMessagingPaths() {
  revalidatePath("/teacher")
  revalidatePath("/teacher/messages")
  revalidatePath("/parent")
  revalidatePath("/parent/messages")
  revalidatePath("/admin/communications")
}

async function getTeacherActionContext() {
  const user = await requireRole("TEACHER")
  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      classroomId: true,
      classroom: { select: { id: true, name: true } },
    },
  })
  if (!profile?.classroomId || !profile.classroom) {
    throw new Error(
      "Your account isn't assigned to a classroom yet. Ask the director to add you on the Staff page."
    )
  }
  return { user, classroom: profile.classroom }
}

async function familyIsInClassroom(familyId: string, classroomId: string) {
  const match = await prisma.child.findFirst({
    where: { familyId, classroomId },
    select: { id: true },
  })
  return Boolean(match)
}

export async function createTeacherThread(
  _previousState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  try {
    const { user, classroom } = await getTeacherActionContext()

    const parsed = createTeacherThreadSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      subject: getStringValue(formData, "subject"),
      body: getStringValue(formData, "body"),
    })

    if (!parsed.success) {
      return getMutationState({
        error: "Check the highlighted message details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    if (!(await familyIsInClassroom(parsed.data.familyId, classroom.id))) {
      return getMutationState({
        error: "That family isn't in your classroom roster.",
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
      select: {
        id: true,
        familyName: true,
        parents: {
          select: { user: { select: { name: true } } },
        },
      },
    })

    if (!family) {
      return getMutationState({ error: "Family record not found." })
    }

    const parentNames = family.parents.map((p) => p.user.name).filter(Boolean)
    const participants = Array.from(
      new Set([user.name, ...parentNames])
    ).filter(Boolean)

    const thread = await prisma.messageThread.create({
      data: {
        familyId: family.id,
        subject: parsed.data.subject,
        classroomLabel: classroom.name,
        status: "ACTIVE",
        participants,
        lastMessageAt: new Date(),
        messages: {
          create: {
            authorUserId: user.id,
            senderName: user.name,
            role: "STAFF",
            body: parsed.data.body,
          },
        },
      },
      select: { id: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "teacher.messages.thread.create",
        subjectType: "MessageThread",
        subjectId: thread.id,
        details: {
          subject: parsed.data.subject,
          familyId: family.id,
          classroomId: classroom.id,
        },
      },
    })

    revalidateMessagingPaths()

    return getMutationState({
      success: true,
      message: "Message sent to the family.",
    })
  } catch (error) {
    return getMutationState({
      error:
        error instanceof Error
          ? error.message
          : "We could not send that message right now.",
    })
  }
}

export async function sendTeacherReply(
  _previousState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  try {
    const { user, classroom } = await getTeacherActionContext()

    const parsed = sendTeacherReplySchema.safeParse({
      threadId: getStringValue(formData, "threadId"),
      body: getStringValue(formData, "body"),
    })

    if (!parsed.success) {
      return getMutationState({
        error: "Write a reply before sending it.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const thread = await prisma.messageThread.findFirst({
      where: {
        id: parsed.data.threadId,
        family: {
          children: { some: { classroomId: classroom.id } },
        },
      },
      select: { id: true, subject: true, familyId: true },
    })

    if (!thread) {
      return getMutationState({
        error: "That conversation isn't in your classroom inbox.",
      })
    }

    await prisma.$transaction([
      prisma.message.create({
        data: {
          threadId: thread.id,
          authorUserId: user.id,
          senderName: user.name,
          role: "STAFF",
          body: parsed.data.body,
        },
      }),
      prisma.messageThread.update({
        where: { id: thread.id },
        data: { status: "ACTIVE", lastMessageAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "teacher.messages.reply",
          subjectType: "MessageThread",
          subjectId: thread.id,
          details: { subject: thread.subject },
        },
      }),
    ])

    revalidateMessagingPaths()

    return getMutationState({
      success: true,
      message: "Reply sent.",
    })
  } catch (error) {
    return getMutationState({
      error:
        error instanceof Error
          ? error.message
          : "We could not send that reply right now.",
    })
  }
}

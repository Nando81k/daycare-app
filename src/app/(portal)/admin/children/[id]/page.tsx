import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Mail, Phone, ShieldAlert, User } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatBirthday, formatRelativeDateTime } from "@/lib/format"
import type { StatusBadgeVariant } from "@/types/app"

function attendanceTone(status: string): StatusBadgeVariant {
  switch (status) {
    case "PRESENT":
      return "success"
    case "ABSENT":
      return "destructive"
    case "SCHEDULED":
      return "info"
    default:
      return "secondary"
  }
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

export default async function AdminChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireRole("ADMIN")

  // Look up by id (cuid) or slug.
  const child = await prisma.child.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      classroom: true,
      family: {
        include: {
          parents: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
      emergencyContacts: { orderBy: { priority: "asc" } },
      authorizedPickups: true,
      attendanceRecords: { orderBy: { date: "desc" }, take: 5 },
    },
  })

  if (!child) notFound()

  const allergies = asStringArray(child.allergies)
  const medical = asStringArray(child.medicalNotes)
  const comfort = asStringArray(child.comfortNotes)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/children"
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to children
        </Link>
        <Link
          href={`/admin/families`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View family
        </Link>
      </div>

      <SurfaceCard className="space-y-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-base font-semibold">
              {(child.firstName.charAt(0) + child.lastName.charAt(0)).toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Child profile
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold text-slate-900">
                {child.firstName} {child.lastName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {child.ageLabel} · {child.classroom?.name ?? "No classroom"} ·
                Family {child.family.familyName}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {child.birthday && (
              <p className="text-xs text-slate-500">
                Born {formatBirthday(child.birthday)}
              </p>
            )}
            {child.teacherLabel && (
              <p className="text-xs text-slate-500">{child.teacherLabel}</p>
            )}
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SurfaceCard className="space-y-3 p-5">
          <SectionTitle icon={<ShieldAlert className="h-4 w-4" />}>
            Health & care
          </SectionTitle>
          <Group label="Allergies" items={allergies} emphasize tone="destructive" />
          <Group label="Medical notes" items={medical} />
          <Group label="Comfort notes" items={comfort} />
          {child.summary && (
            <p className="rounded-md bg-slate-50/60 p-3 text-sm leading-6 text-slate-700">
              {child.summary}
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-5">
          <SectionTitle icon={<User className="h-4 w-4" />}>
            Guardians
          </SectionTitle>
          {child.family.parents.length === 0 ? (
            <p className="text-sm text-slate-500">No guardians on file.</p>
          ) : (
            <ul className="space-y-2">
              {child.family.parents.map((parent) => (
                <li
                  key={parent.id}
                  className="rounded-lg border border-slate-100 bg-white/70 p-3"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {parent.user.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" /> {parent.user.email}
                  </p>
                  {parent.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3 w-3" /> {parent.phone}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-5">
          <SectionTitle>Emergency contacts</SectionTitle>
          {child.emergencyContacts.length === 0 ? (
            <p className="text-sm text-slate-500">
              No emergency contacts on file.
            </p>
          ) : (
            <ul className="space-y-2">
              {child.emergencyContacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white/70 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {contact.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {contact.relationship} · {contact.phone}
                    </p>
                  </div>
                  <StatusBadge
                    variant={
                      /^(1|primary)$/i.test(contact.priority) ? "info" : "secondary"
                    }
                  >
                    {contact.priority}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-5">
          <SectionTitle>Authorized pickups</SectionTitle>
          {child.authorizedPickups.length === 0 ? (
            <p className="text-sm text-slate-500">
              No additional authorized pickups on file.
            </p>
          ) : (
            <ul className="space-y-2">
              {child.authorizedPickups.map((pickup) => (
                <li
                  key={pickup.id}
                  className="rounded-lg border border-slate-100 bg-white/70 p-3"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {pickup.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {pickup.relationship} · {pickup.phone}
                  </p>
                  {pickup.note && (
                    <p className="mt-1 text-xs text-slate-500">{pickup.note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-5 lg:col-span-2">
          <SectionTitle>Recent attendance</SectionTitle>
          {child.attendanceRecords.length === 0 ? (
            <p className="text-sm text-slate-500">
              No attendance recorded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {child.attendanceRecords.map((record) => (
                <li
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white/70 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {formatRelativeDateTime(record.date)}
                    </p>
                    {record.note && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {record.note}
                      </p>
                    )}
                  </div>
                  <StatusBadge variant={attendanceTone(record.status)}>
                    {record.status.toLowerCase()}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>
    </div>
  )
}

function SectionTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {icon}
      {children}
    </h2>
  )
}

function Group({
  label,
  items,
  emphasize = false,
  tone = "secondary",
}: {
  label: string
  items: string[]
  emphasize?: boolean
  tone?: StatusBadgeVariant
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-slate-400">None recorded</p>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <StatusBadge
              key={item}
              variant={emphasize ? tone : "secondary"}
            >
              {item}
            </StatusBadge>
          ))}
        </div>
      )}
    </div>
  )
}

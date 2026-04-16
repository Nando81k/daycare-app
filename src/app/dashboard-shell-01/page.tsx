"use client"

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileCheck2,
  FileWarning,
  LayoutDashboard,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundPlus,
  Wallet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Enrollment", icon: UserRoundPlus },
  { label: "Children & Families", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Attendance", icon: Clock3 },
  { label: "Documents", icon: FileCheck2 },
  { label: "Announcements", icon: Megaphone },
]

const statCards: Array<{
  title: string
  value: string
  change: string
  tone: "sky" | "teal" | "amber" | "violet"
}> = [
  {
    title: "Children checked in",
    value: "74",
    change: "+6 from yesterday",
    tone: "sky",
  },
  {
    title: "Pending enrollments",
    value: "12",
    change: "4 need review today",
    tone: "teal",
  },
  {
    title: "Outstanding balance",
    value: "$4,280",
    change: "7 invoices due this week",
    tone: "amber",
  },
  {
    title: "Unread parent messages",
    value: "9",
    change: "3 marked urgent",
    tone: "violet",
  },
]

const enrollments = [
  {
    child: "Ava Johnson",
    program: "Preschool",
    start: "Sep 3",
    status: "Ready for review",
  },
  {
    child: "Noah Carter",
    program: "Toddler",
    start: "Aug 19",
    status: "Missing documents",
  },
  {
    child: "Mila Torres",
    program: "Infant",
    start: "Sep 10",
    status: "Application sent",
  },
  {
    child: "Elijah Smith",
    program: "Preschool",
    start: "Waitlist",
    status: "Waitlist priority",
  },
]

const classrooms = [
  {
    room: "Infant Room A",
    checkedIn: 10,
    capacity: 12,
    staff: "2 teachers",
  },
  {
    room: "Toddler Room B",
    checkedIn: 14,
    capacity: 16,
    staff: "3 teachers",
  },
  {
    room: "Preschool Room C",
    checkedIn: 20,
    capacity: 20,
    staff: "2 teachers",
  },
]

const messageQueue = [
  {
    from: "Jordan Johnson",
    subject: "Authorized pickup update",
    time: "12 min ago",
    priority: "Urgent",
  },
  {
    from: "Maya Robinson",
    subject: "Question about tuition invoice",
    time: "35 min ago",
    priority: "High",
  },
  {
    from: "Chris Walker",
    subject: "Absence notice for Friday",
    time: "1 hr ago",
    priority: "Normal",
  },
]

const billingAlerts = [
  {
    family: "Johnson Family",
    detail: "Invoice due tomorrow · $1,450",
    status: "Due soon",
  },
  {
    family: "Torres Family",
    detail: "Payment failed · retry needed",
    status: "Failed",
  },
  {
    family: "Bennett Family",
    detail: "Partial payment received · $650 outstanding",
    status: "Partial",
  },
]

const documentAlerts = [
  "3 children are missing immunization records",
  "2 handbook acknowledgements need signature",
  "1 allergy action plan expires next week",
]

const announcements = [
  {
    title: "Spring Family Day reminder",
    audience: "All families",
    status: "Scheduled",
  },
  {
    title: "Toddler room supply update",
    audience: "Toddler families",
    status: "Draft",
  },
  {
    title: "Tuition payment reminder",
    audience: "Billing",
    status: "Published",
  },
]

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.28),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(204,251,241,0.22),transparent_18%),linear-gradient(to_bottom,#f8fcff,#ffffff,#f4fbf9)] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-sm text-slate-600 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-sky-600" />
              Daycare admin operations dashboard
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Keep the center running smoothly, clearly, and confidently
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              A polished dashboard for owners and directors to manage enrollment, attendance, billing, parent communication, and daily operational priorities.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="rounded-full border-slate-200 bg-white px-5">
              <Megaphone className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
            <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
              <UserRoundPlus className="mr-2 h-4 w-4" />
              Review Enrollments
            </Button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Navigation</CardTitle>
                <CardDescription>Quick access to the main admin workflows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        item.active
                          ? "border-sky-200 bg-sky-50 shadow-sm"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          item.active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-sky-100/80 via-white to-teal-100/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today&apos;s priorities</CardTitle>
                <CardDescription>Surface high-impact actions for the director first.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Review 4 pending enrollments",
                  "Resolve 1 failed tuition payment",
                  "Send pickup reminder to toddler families",
                  "Approve 3 document submissions",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
                    <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${index < 2 ? "bg-amber-500" : "bg-teal-500"}`} />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11"
                    placeholder="Search children, families, enrollments, invoices..."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-full border-slate-200 bg-white px-5">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Today
                  </Button>
                  <Button variant="outline" className="rounded-full border-slate-200 bg-white px-5">
                    <Bell className="mr-2 h-4 w-4" />
                    Alerts
                  </Button>
                  <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
                    Export Summary
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>

            <Tabs defaultValue="operations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-sm lg:w-[520px]">
                <TabsTrigger value="operations" className="rounded-xl">Operations</TabsTrigger>
                <TabsTrigger value="families" className="rounded-xl">Families</TabsTrigger>
                <TabsTrigger value="finance" className="rounded-xl">Finance & Docs</TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="space-y-6">
                <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl">Enrollment queue</CardTitle>
                          <CardDescription>Track missing items and who is ready to be approved.</CardDescription>
                        </div>
                        <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">12 open</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {enrollments.map((item) => (
                        <div key={item.child} className="flex flex-col gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{item.child}</p>
                            <p className="mt-1 text-sm text-slate-600">{item.program} · Preferred start {item.start}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={item.status} />
                            <Button variant="outline" className="rounded-full border-slate-200 bg-white px-4">
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Classroom capacity</CardTitle>
                      <CardDescription>Watch occupancy and room pressure at a glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {classrooms.map((room) => {
                        const percentage = Math.round((room.checkedIn / room.capacity) * 100)
                        return (
                          <div key={room.room} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{room.room}</p>
                                <p className="mt-1 text-sm text-slate-600">{room.staff}</p>
                              </div>
                              <Badge className="rounded-full bg-white text-slate-700 hover:bg-white">
                                {room.checkedIn}/{room.capacity}
                              </Badge>
                            </div>
                            <Progress value={percentage} className="mt-4 h-2 bg-slate-200" />
                            <p className="mt-3 text-sm text-slate-600">{percentage}% of capacity filled today</p>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Message queue</CardTitle>
                      <CardDescription>Keep urgent parent communication from getting buried.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {messageQueue.map((item) => (
                        <div key={item.subject} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.from}</p>
                              <p className="mt-1 text-sm text-slate-600">{item.subject}</p>
                              <p className="mt-2 text-xs text-slate-500">{item.time}</p>
                            </div>
                            <PriorityBadge priority={item.priority} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-sky-100/70 via-white to-teal-100/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Director action center</CardTitle>
                      <CardDescription>Put cross-functional actions in one clean, high-visibility area.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          icon: ShieldCheck,
                          title: "Safety review",
                          body: "Confirm 2 authorized pickup changes submitted this morning.",
                        },
                        {
                          icon: Bell,
                          title: "Reminder needed",
                          body: "Send a quick note to parents about Friday early pickup procedures.",
                        },
                        {
                          icon: CheckCircle2,
                          title: "Documents approved",
                          body: "3 newly uploaded forms are ready to move into completed status.",
                        },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.title} className="flex items-start gap-4 rounded-[1.25rem] border border-white/70 bg-white/85 p-4 shadow-sm">
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="families" className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Family communication snapshot</CardTitle>
                      <CardDescription>See what families need attention and which interactions are pending.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        "5 families opened the latest tuition reminder",
                        "3 parents requested schedule changes this week",
                        "2 new leads have not been contacted yet",
                        "1 parent is waiting on a billing clarification",
                      ].map((item, index) => (
                        <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4">
                          <div className={`mt-1 h-2.5 w-2.5 rounded-full ${index < 2 ? "bg-sky-500" : "bg-teal-500"}`} />
                          <p className="text-sm leading-6 text-slate-700">{item}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Announcements</CardTitle>
                      <CardDescription>Keep families informed with a clean publishing workflow.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {announcements.map((item) => (
                        <div key={item.title} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4">
                          <div>
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-sm text-slate-600">Audience: {item.audience}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="finance" className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                  <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Billing alerts</CardTitle>
                      <CardDescription>Spot payment issues before they become collection problems.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {billingAlerts.map((item) => (
                        <div key={item.family} className="flex flex-col gap-4 rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{item.family}</p>
                            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-white via-white to-sky-100/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Document compliance</CardTitle>
                      <CardDescription>Keep health, consent, and enrollment records visible and current.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {documentAlerts.map((item, index) => (
                        <div key={item} className="flex items-start gap-3 rounded-[1.25rem] border border-white/70 bg-white/90 p-4 shadow-sm">
                          <div className={`rounded-2xl p-2 ${index === 0 ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                            {index === 0 ? <FileWarning className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}
                          </div>
                          <p className="text-sm leading-6 text-slate-700">{item}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-6 lg:grid-cols-3">
              <CompactActionCard
                icon={Wallet}
                title="Revenue pulse"
                body="Collections are 91% on track for the month, with one failed payment requiring follow-up."
              />
              <CompactActionCard
                icon={Users}
                title="Attendance trend"
                body="Preschool is at full capacity today, while infant and toddler rooms have limited flexibility."
              />
              <CompactActionCard
                icon={AlertTriangle}
                title="Risk flags"
                body="Prioritize missing health records and late billing items before the end-of-week closeout."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  change,
  tone,
}: {
  title: string
  value: string
  change: string
  tone: "sky" | "teal" | "amber" | "violet"
}) {
  const toneMap = {
    sky: "bg-sky-100 text-sky-700",
    teal: "bg-teal-100 text-teal-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  }

  return (
    <Card className="rounded-[1.5rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <CardContent className="p-6">
        <div className={`inline-flex rounded-2xl px-3 py-2 text-sm font-medium ${toneMap[tone]}`}>
          {title}
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-600">{change}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Ready for review": "bg-sky-100 text-sky-700",
    "Missing documents": "bg-amber-100 text-amber-700",
    "Application sent": "bg-teal-100 text-teal-700",
    "Waitlist priority": "bg-violet-100 text-violet-700",
    Scheduled: "bg-sky-100 text-sky-700",
    Draft: "bg-slate-100 text-slate-700",
    Published: "bg-teal-100 text-teal-700",
    "Due soon": "bg-amber-100 text-amber-700",
    Failed: "bg-rose-100 text-rose-700",
    Partial: "bg-violet-100 text-violet-700",
  }

  return (
    <Badge className={`rounded-full px-3 py-1 font-medium hover:bg-inherit ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Urgent: "bg-rose-100 text-rose-700",
    High: "bg-amber-100 text-amber-700",
    Normal: "bg-slate-100 text-slate-700",
  }

  return (
    <Badge className={`rounded-full px-3 py-1 font-medium hover:bg-inherit ${styles[priority] ?? "bg-slate-100 text-slate-700"}`}>
      {priority}
    </Badge>
  )
}

function CompactActionCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <Card className="rounded-[1.5rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">{title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
          </div>
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <button className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900">
          View details
          <ChevronRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}

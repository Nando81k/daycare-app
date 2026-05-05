import { CheckCircle2, Clock, FileText, ShieldCheck, UserRound } from "lucide-react"

const ITEMS: Array<{ icon: typeof Clock; title: string; body: string }> = [
  {
    icon: UserRound,
    title: "Profile",
    body: "A few quick details — phone, photo, emergency contact — so families know who's caring for their child.",
  },
  {
    icon: FileText,
    title: "Required documents",
    body: "Upload your background check, first-aid certification, and a copy of your government-issued ID.",
  },
  {
    icon: ShieldCheck,
    title: "Policy acknowledgements",
    body: "Read and sign the staff handbook, safeguarding policy, and code of conduct.",
  },
  {
    icon: CheckCircle2,
    title: "Classroom",
    body: "Confirm where you'll be teaching, then head into the staff portal.",
  },
]

export function StepWelcome({
  staffName,
  roleLabel,
  requiredDocCount,
}: {
  staffName: string
  roleLabel: string
  requiredDocCount: number
}) {
  const firstName = staffName.split(" ")[0] || staffName
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-navy p-6 text-white shadow-(--shadow-soft) md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">
          Welcome aboard
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-white md:text-4xl">
          Hi {firstName} — let&apos;s get you ready for your first day.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
          You&apos;ve been added to Ambassadors Care as <strong>{roleLabel}</strong>. Before
          you reach the staff portal, we&apos;ll walk through a short setup so families and
          your colleagues know who to expect, and so we have your paperwork on file.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-yellow">
          <Clock className="h-4 w-4" />
          About 10 minutes — you can pause and continue later.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-border/65 bg-card p-5"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow/20 text-navy">
              <item.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-base font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>

      {requiredDocCount > 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          You&apos;ll have <strong>{requiredDocCount}</strong> required documents to upload.
          Have them ready as PDF or photo files (up to 10 MB each).
        </p>
      ) : null}
    </div>
  )
}

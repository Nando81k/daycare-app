import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Rule = {
  label: string
  test: (password: string, confirm: string) => boolean
}

const RULES: Rule[] = [
  { label: "12+ characters", test: (p) => p.length >= 12 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
  { label: "Match", test: (p, c) => p.length > 0 && p === c },
]

const STRENGTH_LEVELS = [
  { label: "Weak", barClass: "bg-rose-500", textClass: "text-rose-600" },
  { label: "Fair", barClass: "bg-amber-500", textClass: "text-amber-600" },
  { label: "Good", barClass: "bg-emerald-500", textClass: "text-emerald-700" },
  { label: "Strong", barClass: "bg-emerald-600", textClass: "text-emerald-700" },
] as const

function scorePassword(password: string): number {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  // Map raw 0–6 score to 1–4 strength tier (any input gets at least 1 segment).
  if (score <= 2) return 1
  if (score === 3) return 2
  if (score === 4) return 3
  return 4
}

export function PasswordChecklist({
  password,
  confirmPassword,
}: {
  password: string
  confirmPassword: string
}) {
  // Stay invisible until the parent starts typing — we don't want to greet a
  // brand-new user with a wall of red rule reminders.
  if (password.length === 0 && confirmPassword.length === 0) {
    return null
  }

  const strength = scorePassword(password)
  const tier = strength > 0 ? STRENGTH_LEVELS[strength - 1] : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                tier && segment <= strength ? tier.barClass : "bg-border/60"
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "min-w-12 text-right text-[0.7rem] font-medium uppercase tracking-[0.12em] tabular-nums transition-colors",
            tier ? tier.textClass : "text-muted-foreground"
          )}
        >
          {tier?.label ?? ""}
        </span>
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[0.7rem]">
        {RULES.map((rule) => {
          const passed = rule.test(password, confirmPassword)
          return (
            <li
              key={rule.label}
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                passed ? "text-emerald-700" : "text-muted-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-3 w-3 items-center justify-center rounded-full transition-colors",
                  passed
                    ? "bg-emerald-100 text-emerald-700"
                    : "border border-border/60 bg-transparent"
                )}
              >
                {passed ? <CheckIcon className="h-2 w-2" strokeWidth={3} /> : null}
              </span>
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

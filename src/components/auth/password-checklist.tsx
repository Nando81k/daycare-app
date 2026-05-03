import { CheckIcon, CircleDashedIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Rule = {
  label: string
  test: (password: string, confirm: string) => boolean
  /** When false, render the row in a "not yet evaluated" muted style. */
  active?: (password: string, confirm: string) => boolean
}

const RULES: Rule[] = [
  {
    label: "At least 12 characters",
    test: (p) => p.length >= 12,
  },
  {
    label: "Includes an uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "Includes a lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "Includes a number",
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: "Both fields match",
    test: (p, c) => p.length > 0 && p === c,
    active: (_p, c) => c.length > 0,
  },
]

export function PasswordChecklist({
  password,
  confirmPassword,
}: {
  password: string
  confirmPassword: string
}) {
  return (
    <ul className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs">
      {RULES.map((rule) => {
        const passed = rule.test(password, confirmPassword)
        const active = rule.active ? rule.active(password, confirmPassword) : true
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 transition-colors",
              passed
                ? "text-emerald-700"
                : active
                  ? "text-foreground/80"
                  : "text-muted-foreground"
            )}
          >
            {passed ? (
              <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <CircleDashedIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
            )}
            <span>{rule.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

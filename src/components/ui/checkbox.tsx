import * as React from "react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({
  className,
  onCheckedChange,
  checked,
  defaultChecked,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      className={cn(
        "h-4 w-4 rounded border border-slate-300 bg-white text-primary shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

import { format } from "date-fns"

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateLabel(value: string | Date) {
  return format(new Date(value), "MMM d")
}

export function formatLongDate(value: string | Date) {
  return format(new Date(value), "EEEE, MMMM d")
}

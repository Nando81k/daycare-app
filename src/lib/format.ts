const TIME_ZONE = "America/New_York"

function formatDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions
) {
  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    ...options,
  }).format(date)
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amountCents / 100)
}

/** Convert a major-unit amount (e.g. 1500 naira) to minor units (kobo). */
export function toMinorUnits(amountMajor: number) {
  return Math.round(amountMajor * 100)
}

/** Convert minor units (kobo) back to a major-unit number for display math. */
export function fromMinorUnits(amountCents: number) {
  return amountCents / 100
}

export function formatMonthDay(value: Date | string) {
  return formatDate(value, { month: "short", day: "numeric" })
}

export function formatFullDate(value: Date | string) {
  return formatDate(value, { weekday: "long", month: "long", day: "numeric" })
}

export function formatBirthday(value: Date | string) {
  return formatDate(value, { month: "long", day: "numeric", year: "numeric" })
}

export function formatTime(value: Date | string) {
  return formatDate(value, { hour: "numeric", minute: "2-digit" })
}

export function formatRelativeDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  const now = new Date()

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()

  if (sameDay) {
    return `Today · ${formatTime(date)}`
  }

  if (isYesterday) {
    return `Yesterday · ${formatTime(date)}`
  }

  return `${formatMonthDay(date)} · ${formatTime(date)}`
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

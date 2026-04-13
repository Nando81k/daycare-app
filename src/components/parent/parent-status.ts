import type {
  ParentAttendanceRecordPreview,
  ParentDocumentPreview,
  ParentEventPreview,
  ParentMessageThreadPreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  StatusBadgeVariant,
} from "@/types/app"

export function getInvoiceBadgeVariant(status: "paid" | "due" | "draft"): StatusBadgeVariant {
  switch (status) {
    case "paid":
      return "success"
    case "due":
      return "warning"
    case "draft":
      return "secondary"
  }
}

export function getDocumentBadgeVariant(status: ParentDocumentPreview["status"]): StatusBadgeVariant {
  switch (status) {
    case "approved":
      return "success"
    case "required":
      return "warning"
    case "submitted":
      return "info"
    case "expired":
      return "destructive"
  }
}

export function getThreadBadgeVariant(status: ParentMessageThreadPreview["status"]): StatusBadgeVariant {
  switch (status) {
    case "response-needed":
      return "warning"
    case "closed":
      return "secondary"
    case "active":
      return "info"
  }
}

export function getEventBadgeVariant(category: ParentEventPreview["category"]): StatusBadgeVariant {
  switch (category) {
    case "classroom":
      return "info"
    case "family":
      return "success"
    case "closure":
      return "destructive"
    case "billing":
      return "warning"
  }
}

export function getAttendanceBadgeVariant(
  status: ParentAttendanceRecordPreview["status"]
): StatusBadgeVariant {
  switch (status) {
    case "present":
      return "success"
    case "scheduled":
      return "info"
    case "absent":
      return "warning"
  }
}

export function getPaymentBadgeVariant(status: ParentPaymentPreview["status"]): StatusBadgeVariant {
  switch (status) {
    case "paid":
      return "success"
    case "processing":
      return "info"
    case "failed":
      return "destructive"
  }
}

export function getAutopayBadgeVariant(
  status: ParentPaymentMethodPreview["autopayStatus"]
): StatusBadgeVariant {
  return status === "enabled" ? "success" : "secondary"
}

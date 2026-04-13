import type {
  ChildProfilePreview,
  DailyReportPreview,
  MinimalInvoicePreview,
  ParentAnnouncementPreview,
  ParentAttendanceRecordPreview,
  ParentDashboardPreview,
  ParentDocumentPreview,
  ParentEventPreview,
  ParentMessageThreadPreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  ParentSettingsPreview,
  SiteMetadata,
} from "@/types/app"

export const parentChildProfile: ChildProfilePreview = {
  id: "ellie-harper",
  name: "Ellie Harper",
  ageLabel: "3 years old",
  birthday: "January 12, 2023",
  classroom: "Sunrise Preschool",
  attendanceNote: "Checked in at 8:14 AM",
  teacher: "Ms. Elena Morales",
  summary:
    "Ellie is in a confident preschool stage and does best with calm transitions, clear expectations, and a little quiet time before group activities.",
  allergies: ["Strawberries"],
  medicalNotes: ["Mild eczema. Cream is kept in the classroom cubby if a dry patch needs attention."],
  comfortNotes: [
    "Usually settles fastest with a book or puzzle after arrival.",
    "Prefers water after rest time before rejoining outdoor play.",
  ],
  emergencyContacts: [
    {
      name: "Olivia Harper",
      relationship: "Mother",
      phone: "(617) 555-0174",
      priority: "Primary",
    },
    {
      name: "Marcus Harper",
      relationship: "Father",
      phone: "(617) 555-0188",
      priority: "Secondary",
    },
  ],
  authorizedPickups: [
    {
      id: "pickup-olivia",
      name: "Olivia Harper",
      relationship: "Mother",
      phone: "(617) 555-0174",
      note: "Primary pickup unless work travel changes the week.",
    },
    {
      id: "pickup-marcus",
      name: "Marcus Harper",
      relationship: "Father",
      phone: "(617) 555-0188",
    },
    {
      id: "pickup-nina",
      name: "Aunt Nina Chen",
      relationship: "Aunt",
      phone: "(617) 555-0161",
      note: "Approved for Friday pickups with ID on file.",
    },
  ],
}

export const parentDailyReport: DailyReportPreview = {
  dateLabel: "Thursday, April 3",
  arrivalMood: "Curious and settled after a short drop-off hug.",
  summary:
    "Ellie had a steady day with garden journaling, a long outdoor block, and a calm rest transition. She was especially proud of helping set up afternoon snack.",
  meals: [
    {
      label: "Morning snack",
      time: "9:15 AM",
      details: "Banana slices and whole-grain crackers",
      status: "eaten",
    },
    {
      label: "Lunch",
      time: "11:40 AM",
      details: "Turkey meatballs, rice, peas, and milk",
      status: "partial",
    },
    {
      label: "Afternoon snack",
      time: "3:05 PM",
      details: "Yogurt and cinnamon apples",
      status: "eaten",
    },
  ],
  rest: [
    {
      label: "Rest time",
      time: "12:38 PM",
      duration: "48 minutes",
      note: "Rested quietly, then looked through books until the room reset.",
    },
  ],
  activities: [
    {
      time: "9:45 AM",
      title: "Garden journal drawings",
      description: "Children sketched seedlings and talked about what plants need to grow.",
    },
    {
      time: "10:50 AM",
      title: "Outdoor climbing and trike loop",
      description: "Ellie spent most of the block on the climbing bridge and practiced waiting turns calmly.",
    },
    {
      time: "2:25 PM",
      title: "Small-group story retelling",
      description: "She volunteered details from the story and helped pass out felt pieces to friends.",
    },
  ],
  staffNotes: [
    "Ellie asked for a quieter transition into rest time and responded well when given two minutes with books first.",
    "Please send the green rain jacket tomorrow if possible. The class is planning a longer morning walk.",
  ],
  photos: [
    {
      id: "photo-garden-sketch",
      title: "Garden sketch table",
      caption: "Focused on drawing seed trays and naming the colors she could see in the planters.",
    },
    {
      id: "photo-balance-bridge",
      title: "Outdoor balance bridge",
      caption: "Practicing careful steps and cheering on classmates during the second outdoor block.",
    },
  ],
}

export const parentMessageThreads: ParentMessageThreadPreview[] = [
  {
    id: "thread-daily-checkin",
    subject: "Field trip waiver reminder",
    classroom: "Sunrise Preschool",
    lastMessageAt: "Today · 2:16 PM",
    preview: "Can you confirm whether Ellie will attend next Thursday’s garden trip?",
    unreadCount: 1,
    status: "response-needed",
    participants: ["Ms. Elena Morales", "Olivia Harper"],
    messages: [
      {
        id: "msg-1",
        sender: "Ms. Elena Morales",
        role: "staff",
        sentAt: "Today · 2:16 PM",
        body: "Hi Olivia, we’re finalizing next Thursday’s garden trip headcount. Can you confirm whether Ellie will attend so we can keep the class roster accurate?",
      },
      {
        id: "msg-2",
        sender: "Olivia Harper",
        role: "parent",
        sentAt: "Today · 2:28 PM",
        body: "Thanks for the reminder. We’re planning for her to attend. I’ll complete the waiver tonight.",
      },
    ],
  },
  {
    id: "thread-rest-update",
    subject: "Rest time update",
    classroom: "Sunrise Preschool",
    lastMessageAt: "Yesterday · 4:42 PM",
    preview: "Ellie settled more easily after we adjusted the transition a bit today.",
    unreadCount: 0,
    status: "active",
    participants: ["Ms. Elena Morales", "Marcus Harper", "Olivia Harper"],
    messages: [
      {
        id: "msg-3",
        sender: "Ms. Elena Morales",
        role: "staff",
        sentAt: "Yesterday · 4:42 PM",
        body: "Quick note from today: Ellie settled more easily into rest after we gave her a quieter two-minute transition with books. We’ll keep that in place this week.",
      },
      {
        id: "msg-4",
        sender: "Marcus Harper",
        role: "parent",
        sentAt: "Yesterday · 5:03 PM",
        body: "That sounds helpful. We’ve been doing something similar at home before bedtime too.",
      },
    ],
  },
  {
    id: "thread-billing",
    subject: "April tuition timing",
    classroom: "Billing",
    lastMessageAt: "Mar 28 · 10:14 AM",
    preview: "Your April invoice is ready to review in the parent portal.",
    unreadCount: 0,
    status: "closed",
    participants: ["Billing Office", "Olivia Harper"],
    messages: [
      {
        id: "msg-5",
        sender: "Billing Office",
        role: "director",
        sentAt: "Mar 28 · 10:14 AM",
        body: "Your April tuition invoice is ready in the portal. Please let us know if your billing contact should change before the due date.",
      },
    ],
  },
]

export const parentAnnouncements: ParentAnnouncementPreview[] = [
  {
    id: "ann-spring-breakfast",
    title: "Spring family breakfast reminder",
    summary:
      "Join the preschool classroom for breakfast before morning circle this Friday. Please arrive by 8:00 AM if you plan to attend.",
    body:
      "Families are welcome to stay through breakfast and the start of circle time. If a sibling will join, please let the front desk know so we can plan seating and supplies.",
    audience: "All preschool families",
    publishedAt: "2 hours ago",
  },
  {
    id: "ann-pickup-routine",
    title: "End-of-day pickup flow update",
    summary:
      "Please send any pickup changes before 2:00 PM so classrooms have time to confirm IDs and update end-of-day notes.",
    body:
      "This helps the office team communicate changes to teachers before dismissal begins. If something changes after 2:00 PM, please call the front desk directly.",
    audience: "All families",
    publishedAt: "Yesterday",
  },
]

export const parentInvoices: MinimalInvoicePreview[] = [
  {
    id: "inv-1009",
    label: "April Tuition",
    amount: "$1,520.00",
    dueDate: "Apr 10",
    status: "due",
  },
  {
    id: "inv-1008",
    label: "March Tuition",
    amount: "$1,520.00",
    dueDate: "Mar 10",
    status: "paid",
  },
  {
    id: "inv-1010",
    label: "May Tuition",
    amount: "$1,520.00",
    dueDate: "May 10",
    status: "draft",
  },
]

export const parentPaymentHistory: ParentPaymentPreview[] = [
  {
    id: "pay-201",
    label: "March Tuition",
    date: "Mar 8",
    amount: "$1,520.00",
    method: "Visa ending in 4242",
    status: "paid",
  },
  {
    id: "pay-185",
    label: "Annual registration fee",
    date: "Jan 12",
    amount: "$150.00",
    method: "Bank transfer",
    status: "paid",
  },
]

export const parentPaymentMethod: ParentPaymentMethodPreview = {
  familyId: "family-harper",
  label: "Primary payment method",
  detail: "Visa ending in 4242",
  autopayStatus: "manual",
  note: "Autopay can be turned on once live billing tools are connected in a later phase.",
  stripeConfigured: false,
}

export const parentDocuments: ParentDocumentPreview[] = [
  {
    id: "doc-waiver",
    title: "Garden field trip waiver",
    category: "Permission",
    status: "required",
    dueDate: "Apr 7",
    lastUpdated: "Today",
    note: "Needed before next Thursday’s classroom garden trip.",
  },
  {
    id: "doc-med",
    title: "Medication authorization",
    category: "Health",
    status: "approved",
    lastUpdated: "Mar 18",
    note: "Current through the spring term.",
  },
  {
    id: "doc-contact",
    title: "Emergency contact sheet",
    category: "Family information",
    status: "submitted",
    lastUpdated: "Mar 25",
    note: "Pending review after the new pickup contact was added.",
  },
  {
    id: "doc-allergy",
    title: "Allergy action plan",
    category: "Health",
    status: "approved",
    lastUpdated: "Feb 2",
    note: "Shared with classroom and kitchen staff.",
  },
]

export const parentEvents: ParentEventPreview[] = [
  {
    id: "evt-breakfast",
    title: "Spring family breakfast",
    dateLabel: "Apr 11",
    timeLabel: "8:00 AM",
    startsAtIso: "2026-04-11T12:00:00.000Z",
    timeKind: "timed",
    category: "family",
    description: "Families are invited to join the preschool room for breakfast before morning circle.",
  },
  {
    id: "evt-garden",
    title: "Garden walk and planting day",
    dateLabel: "Apr 18",
    timeLabel: "9:30 AM",
    startsAtIso: "2026-04-18T13:30:00.000Z",
    timeKind: "timed",
    category: "classroom",
    description: "Children will visit the neighborhood garden for planting and journal sketches.",
    classroomLabel: "Sunrise Preschool",
  },
  {
    id: "evt-close",
    title: "Professional development closure",
    dateLabel: "Apr 26",
    timeLabel: "All day",
    startsAtIso: "2026-04-26T12:00:00.000Z",
    timeKind: "all-day",
    category: "closure",
    description: "School closed for staff development and classroom prep.",
  },
  {
    id: "billing:inv-1009",
    title: "April tuition due",
    dateLabel: "Apr 10",
    timeLabel: "By 1:00 PM",
    startsAtIso: "2026-04-10T17:00:00.000Z",
    timeKind: "deadline",
    category: "billing",
    description: "Generated from the current family invoice and shown automatically as a due-date reminder.",
  },
]

export const parentAttendanceHistory: ParentAttendanceRecordPreview[] = [
  {
    dateLabel: "Apr 3",
    checkIn: "8:14 AM",
    checkOut: "4:53 PM",
    status: "present",
    note: "Full day in Sunrise Preschool.",
  },
  {
    dateLabel: "Apr 2",
    checkIn: "8:06 AM",
    checkOut: "4:47 PM",
    status: "present",
    note: "Rested quietly after lunch.",
  },
  {
    dateLabel: "Apr 1",
    checkIn: "8:22 AM",
    checkOut: "4:38 PM",
    status: "present",
    note: "Outdoor play shortened for rain.",
  },
  {
    dateLabel: "Mar 31",
    status: "scheduled",
    note: "Planned family day.",
  },
  {
    dateLabel: "Mar 28",
    checkIn: "8:11 AM",
    checkOut: "4:41 PM",
    status: "present",
    note: "Classroom baking activity in the afternoon.",
  },
]

export const parentSettings: ParentSettingsPreview = {
  accountEmail: "olivia@harperfamily.com",
  phone: "(617) 555-0174",
  billingContact: "Olivia Harper",
  pickupPolicy:
    "Changes to pickup contacts should be communicated before 2:00 PM whenever possible so the classroom team can confirm ID and end-of-day notes.",
  notificationPreferences: [
    {
      id: "daily-summary",
      label: "Daily summary",
      description: "Receive Ellie’s end-of-day summary with meals, rest, activities, and staff notes.",
      enabled: true,
    },
    {
      id: "message-alerts",
      label: "Message alerts",
      description: "Get notified when the classroom or office sends a new message that needs review.",
      enabled: true,
    },
    {
      id: "billing-reminders",
      label: "Billing reminders",
      description: "Receive due-date reminders for invoices and payment-related notices.",
      enabled: true,
    },
    {
      id: "event-reminders",
      label: "Event reminders",
      description: "Receive school and classroom event reminders the day before an event.",
      enabled: false,
    },
  ],
}

export const parentDashboardPreview: ParentDashboardPreview = {
  child: parentChildProfile,
  dailyReport: parentDailyReport,
  reminders: [
    {
      label: "Field trip waiver",
      value: "Due Monday",
      tone: "warning",
    },
    {
      label: "April tuition",
      value: "$1,520 due Apr 10",
      tone: "warning",
    },
    {
      label: "Classroom message",
      value: "1 response requested",
      tone: "info",
    },
  ],
  invoice: parentInvoices[0],
  documents: parentDocuments.slice(0, 3),
  threads: parentMessageThreads.slice(0, 2),
  upcomingEvents: parentEvents.slice(0, 3),
  domains: [
    {
      key: "child-day",
      label: "Child Day",
      title: "Today's classroom update is ready for review.",
      description:
        "Daily reports, meals, rest, activities, and photos are written by the school and updated here as the classroom day takes shape.",
      ownerLabel: "School-owned update",
      recentLabel: parentDailyReport.dateLabel,
      actionLabel: "Open child day",
      actionHref: "/parent/child/ellie-harper",
      statusLabel: "Updated",
      statusTone: "success",
      stats: [
        { label: "Meals", value: "3" },
        { label: "Rest", value: "48 min" },
        { label: "Activities", value: "3" },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      title: "One classroom conversation still needs a reply.",
      description:
        "Direct threads and school updates live in the same communication flow so nothing gets lost between messages and announcements.",
      ownerLabel: "Shared thread ownership",
      recentLabel: "1 unread update",
      actionLabel: "Open messages",
      actionHref: "/parent/messages",
      statusLabel: "Response requested",
      statusTone: "info",
      stats: [
        { label: "Threads", value: "2" },
        { label: "Unread", value: "1" },
      ],
    },
    {
      key: "documents",
      label: "Documents",
      title: "One required form still needs family action.",
      description:
        "Document requests start with the school, uploads happen on the family side, and review status stays visible in the same workflow.",
      ownerLabel: "Family upload, school review",
      recentLabel: "1 required now",
      actionLabel: "Open documents",
      actionHref: "/parent/forms",
      statusLabel: "Action needed",
      statusTone: "warning",
      stats: [
        { label: "Required", value: "1" },
        { label: "Pending review", value: "1" },
      ],
    },
    {
      key: "billing",
      label: "Billing",
      title: "Tuition is due soon and the payment method is already on file.",
      description:
        "Families see the same due-state language the school uses for follow-up, so payment status stays easy to understand on both sides.",
      ownerLabel: "Shared billing status",
      recentLabel: "$1,520 due Apr 10",
      actionLabel: "Open billing",
      actionHref: "/parent/billing",
      statusLabel: "Due soon",
      statusTone: "warning",
      stats: [
        { label: "Current invoice", value: "$1,520" },
        { label: "Autopay", value: "Manual" },
      ],
    },
    {
      key: "calendar",
      label: "Calendar",
      title: "The next family date is already on the schedule.",
      description:
        "School events, classroom dates, and billing reminders all show up in one calendar so families can plan without checking multiple pages.",
      ownerLabel: "School publishes dates",
      recentLabel: "Next event: Preschool family breakfast",
      actionLabel: "Open calendar",
      actionHref: "/parent/calendar",
      statusLabel: "Coming up",
      statusTone: "info",
      stats: [
        { label: "Upcoming", value: "3" },
        { label: "Billing reminders", value: "1" },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      title: "Family preferences stay separate from school policy.",
      description:
        "Parents manage contact details and notification choices here, while school-owned policy stays visible and consistent across the portal.",
      ownerLabel: "Family-owned preferences",
      recentLabel: "3 notification preferences set",
      actionLabel: "Open settings",
      actionHref: "/parent/settings",
      statusLabel: "Up to date",
      statusTone: "secondary",
      stats: [
        { label: "Billing contact", value: "Olivia Harper" },
        { label: "Notifications on", value: "2" },
      ],
    },
  ],
}

export const parentOverviewPageContent = {
  metadata: {
    title: "Parent Portal",
    description:
      "A calm parent dashboard for daily updates, messages, billing reminders, forms, and upcoming school events.",
    pathname: "/parent",
  } satisfies SiteMetadata,
  eyebrow: "Today at a glance",
  title: "Your child’s day, family tasks, and school updates in one place.",
  description:
    "See how your child is doing today, what needs family follow-up, and which school updates matter next without digging through multiple pages.",
}

export const parentChildPageContent = {
  metadata: {
    title: "Child Profile",
    description:
      "Child details, classroom information, emergency contacts, allergies, and authorized pickup contacts.",
    pathname: "/parent/child/ellie-harper",
  } satisfies SiteMetadata,
  eyebrow: "Child profile",
  title: "Child details and family information",
  description:
    "Care notes, contacts, allergy information, and pickup permissions are grouped clearly so families can review the essentials quickly.",
}

export const parentMessagesPageContent = {
  metadata: {
    title: "Messages",
    description:
      "Classroom and office communication with clear unread states and conversation history for enrolled families.",
    pathname: "/parent/messages",
  } satisfies SiteMetadata,
  eyebrow: "Messages and updates",
  title: "Direct conversations and school updates, together.",
  description:
    "Threads, teacher replies, and school-wide announcements stay in one communication workspace so nothing important gets buried.",
}

export const parentBillingPageContent = {
  metadata: {
    title: "Billing",
    description:
      "Billing overview for balance due, invoices, payment history, and billing contact information.",
    pathname: "/parent/billing",
  } satisfies SiteMetadata,
  eyebrow: "Billing",
  title: "Clear billing visibility without unnecessary stress.",
  description:
    "Families should be able to see what is due, what has already been paid, and who to contact without navigating a dense financial dashboard.",
}

export const parentFormsPageContent = {
  metadata: {
    title: "Forms & Documents",
    description:
      "Document tracking for permission slips, health forms, emergency contacts, and other enrollment paperwork.",
    pathname: "/parent/forms",
  } satisfies SiteMetadata,
  eyebrow: "Forms and documents",
  title: "School paperwork grouped by what needs attention first.",
  description:
    "Required forms, approved documents, and items still under review are separated clearly so families can act without guessing.",
}

export const parentCalendarPageContent = {
  metadata: {
    title: "Calendar",
    description:
      "Upcoming school events, classroom activities, closures, and billing dates for enrolled families.",
    pathname: "/parent/calendar",
  } satisfies SiteMetadata,
  eyebrow: "Calendar",
  title: "Upcoming events, closures, and important family dates.",
  description:
    "The calendar view keeps school-wide events and classroom-specific moments in one schedule so parents can plan ahead with less friction.",
}

export const parentAttendancePageContent = {
  metadata: {
    title: "Attendance",
    description:
      "Attendance history with check-in, check-out, and scheduled absence notes for the current child.",
    pathname: "/parent/attendance",
  } satisfies SiteMetadata,
  eyebrow: "Attendance",
  title: "Attendance history that stays simple and legible.",
  description:
    "Check-in times, end-of-day pickup, and planned absences are shown with enough context to be useful without turning into an operations screen.",
}

export const parentSettingsPageContent = {
  metadata: {
    title: "Settings",
    description:
      "Parent contact preferences, billing contact details, pickup guidance, and account notification settings.",
    pathname: "/parent/settings",
  } satisfies SiteMetadata,
  eyebrow: "Settings",
  title: "Family preferences and account details in one place.",
  description:
    "Notification choices, contact information, and pickup guidance are grouped clearly so the page feels practical instead of overly technical.",
}

export const parentAnnouncementsPageContent = {
  metadata: {
    title: "Announcements",
    description:
      "School-wide and classroom announcements including policy updates, event reminders, and important notices.",
    pathname: "/parent/announcements",
  } satisfies SiteMetadata,
  eyebrow: "Announcements",
  title: "Updates, reminders, and notices from the school.",
  description:
    "Announcements are shown newest-first so parents can scan for anything that needs attention without digging through email.",
}

export function getParentChildById(id: string) {
  return parentChildProfile.id === id ? parentChildProfile : null
}

export function getParentChildStaticParams() {
  return [{ id: parentChildProfile.id }]
}

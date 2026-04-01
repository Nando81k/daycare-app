import type {
  ActivityNote,
  CalendarEvent,
  ChildProfile,
  DashboardStat,
  DayEvent,
  DocumentItem,
  Invoice,
  MealLog,
  MessageThread,
  NapLog,
  PickupContact,
} from "@/lib/types"

export const childProfile: ChildProfile = {
  name: "Maya Johnson",
  age: "3 years, 2 months",
  classroom: "Preschool Studio",
  teachers: ["Ms. Elena", "Mr. Sam"],
  allergies: ["Strawberries"],
  checkInAt: "8:12 AM",
  pickupWindow: "4:30 - 5:15 PM",
  comfortItems: ["Favorite blanket", "Water bottle"],
}

export const parentStats: DashboardStat[] = [
  {
    label: "Naps today",
    value: "1",
    trend: "On routine",
    detail: "58 minutes between lunch and story circle.",
  },
  {
    label: "Meals completed",
    value: "2/3",
    trend: "Ate well",
    detail: "Breakfast and lunch finished with one refill.",
  },
  {
    label: "Unread messages",
    value: "3",
    trend: "New notes",
    detail: "Teacher update, billing reminder, spring event RSVP.",
  },
  {
    label: "Forms due",
    value: "1",
    trend: "Action needed",
    detail: "Medication authorization renews this Friday.",
  },
]

export const dayTimeline: DayEvent[] = [
  {
    time: "8:12 AM",
    title: "Smooth check-in",
    detail: "Maya arrived cheerful and headed straight for the light table.",
    type: "care",
  },
  {
    time: "9:05 AM",
    title: "Morning atelier",
    detail: "Painted a spring garden scene and named all the colors she used.",
    type: "activity",
  },
  {
    time: "10:15 AM",
    title: "Snack",
    detail: "Yogurt, granola, and banana slices. Drank all water offered.",
    type: "meal",
  },
  {
    time: "12:35 PM",
    title: "Rest time",
    detail: "Fell asleep independently after one story and soft music.",
    type: "nap",
  },
  {
    time: "2:10 PM",
    title: "Outdoor play",
    detail: "Built a chalk road with two classmates and practiced taking turns.",
    type: "activity",
  },
]

export const mealLogs: MealLog[] = [
  {
    meal: "Breakfast",
    time: "8:35 AM",
    ate: "100%",
    note: "Oatmeal, pears, and milk.",
  },
  {
    meal: "Lunch",
    time: "11:40 AM",
    ate: "90%",
    note: "Turkey meatballs, rice pilaf, cucumbers, and peaches.",
  },
  {
    meal: "Snack",
    time: "3:15 PM",
    ate: "Offered",
    note: "Cheddar crackers and apple slices planned for afternoon pickup window.",
  },
]

export const napLogs: NapLog[] = [
  {
    start: "12:35 PM",
    end: "1:33 PM",
    duration: "58 min",
    note: "Rested well and woke up calm.",
  },
]

export const activityNotes: ActivityNote[] = [
  {
    title: "Story dictation",
    domain: "Language",
    detail: "Narrated a three-part story about planting flowers with a friend.",
  },
  {
    title: "Pattern trays",
    domain: "Math thinking",
    detail: "Built repeating bead patterns without prompts.",
  },
  {
    title: "Garden helpers",
    domain: "Social-emotional",
    detail: "Invited a new classmate into play and explained the rules clearly.",
  },
]

export const parentThreads: MessageThread[] = [
  {
    name: "Ms. Elena",
    role: "Lead teacher",
    preview: "Maya asked to save her painting for pickup. It is hanging to dry.",
    time: "12 min ago",
    unread: 1,
    messages: [
      {
        sender: "Ms. Elena",
        role: "Lead teacher",
        time: "1:48 PM",
        body: "Maya had a peaceful rest and joined outdoor play smiling.",
      },
      {
        sender: "You",
        role: "Parent",
        time: "1:55 PM",
        body: "Thank you. We may be closer to 5:10 today.",
        own: true,
      },
      {
        sender: "Ms. Elena",
        role: "Lead teacher",
        time: "1:58 PM",
        body: "Noted. We will have her things ready at the front cubby.",
      },
    ],
  },
  {
    name: "Family billing",
    role: "Accounts",
    preview: "Your April statement is ready and autopay is scheduled for Monday.",
    time: "1 hr ago",
    unread: 1,
    messages: [
      {
        sender: "Family billing",
        role: "Accounts",
        time: "11:10 AM",
        body: "Your April statement is ready. No action is needed if autopay remains on file.",
      },
    ],
  },
  {
    name: "Front office",
    role: "Administration",
    preview: "Please confirm pickup contacts before Friday’s field trip.",
    time: "Yesterday",
    unread: 1,
    messages: [
      {
        sender: "Front office",
        role: "Administration",
        time: "Yesterday",
        body: "Please review pickup contacts and emergency phone numbers before Friday.",
      },
    ],
  },
]

export const parentInvoices: Invoice[] = [
  {
    id: "INV-2408",
    dueDate: "2026-04-05",
    amount: 565,
    status: "processing",
    method: "Autopay ending in 4421",
  },
  {
    id: "INV-2396",
    dueDate: "2026-03-05",
    amount: 565,
    status: "paid",
    method: "Autopay ending in 4421",
  },
  {
    id: "INV-2382",
    dueDate: "2026-02-05",
    amount: 545,
    status: "paid",
    method: "Bank transfer",
  },
]

export const parentDocuments: DocumentItem[] = [
  {
    title: "Medication authorization",
    category: "Health",
    updatedAt: "2026-04-04",
    status: "action-needed",
  },
  {
    title: "Emergency contact form",
    category: "Enrollment",
    updatedAt: "2026-03-22",
    status: "complete",
  },
  {
    title: "Spring photo release",
    category: "Permissions",
    updatedAt: "2026-04-12",
    status: "upcoming",
  },
]

export const pickupContacts: PickupContact[] = [
  {
    name: "Jordan Johnson",
    relationship: "Parent",
    phone: "(555) 214-0182",
    status: "primary",
    note: "Default pickup contact.",
  },
  {
    name: "Leah Johnson",
    relationship: "Parent",
    phone: "(555) 214-0183",
    status: "approved",
    note: "Authorized for regular pickup.",
  },
  {
    name: "Nadia Brooks",
    relationship: "Aunt",
    phone: "(555) 442-0188",
    status: "approved",
    note: "May pick up on Thursdays.",
  },
]

export const parentEvents: CalendarEvent[] = [
  {
    title: "Spring garden day",
    date: "2026-04-10",
    time: "4:30 PM",
    audience: "Families",
    location: "Main courtyard",
  },
  {
    title: "Development check-in",
    date: "2026-04-15",
    time: "3:45 PM",
    audience: "Maya’s family",
    location: "Preschool studio",
  },
  {
    title: "Pajama story morning",
    date: "2026-04-22",
    time: "8:15 AM",
    audience: "Classroom event",
    location: "Reading loft",
  },
]

export const careChart = [
  { day: "Mon", naps: 1.1, meals: 2.8, activities: 4 },
  { day: "Tue", naps: 1, meals: 2.9, activities: 5 },
  { day: "Wed", naps: 1.2, meals: 3, activities: 4.5 },
  { day: "Thu", naps: 0.9, meals: 2.7, activities: 4.8 },
  { day: "Fri", naps: 1.1, meals: 3, activities: 5.2 },
]

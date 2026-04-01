export type Program = {
  id: string
  name: string
  ages: string
  schedule: string
  ratio: string
  summary: string
  highlight: string
  highlights: string[]
}

export type TuitionTier = {
  name: string
  weeklyRate: number
  schedule: string
  deposit: string
  featured?: boolean
  description: string
  includes: string[]
}

export type FAQItem = {
  question: string
  answer: string
}

export type TourSlot = {
  date: string
  time: string
  host: string
  seatsLeft: number
}

export type ChildProfile = {
  name: string
  age: string
  classroom: string
  teachers: string[]
  allergies: string[]
  checkInAt: string
  pickupWindow: string
  comfortItems: string[]
}

export type DashboardStat = {
  label: string
  value: string
  trend: string
  detail: string
}

export type DayEvent = {
  time: string
  title: string
  detail: string
  type: "meal" | "nap" | "activity" | "care"
}

export type MealLog = {
  meal: string
  time: string
  ate: string
  note: string
}

export type NapLog = {
  start: string
  end: string
  duration: string
  note: string
}

export type ActivityNote = {
  title: string
  domain: string
  detail: string
}

export type ChatMessage = {
  sender: string
  role: string
  time: string
  body: string
  own?: boolean
}

export type MessageThread = {
  name: string
  role: string
  preview: string
  time: string
  unread: number
  messages: ChatMessage[]
}

export type Invoice = {
  id: string
  dueDate: string
  amount: number
  status: "paid" | "due" | "processing"
  method: string
}

export type DocumentItem = {
  title: string
  category: string
  updatedAt: string
  status: "complete" | "action-needed" | "upcoming"
}

export type PickupContact = {
  name: string
  relationship: string
  phone: string
  status: "primary" | "approved" | "restricted"
  note: string
}

export type CalendarEvent = {
  title: string
  date: string
  time: string
  audience: string
  location: string
}

export type EnrollmentLead = {
  family: string
  child: string
  program: string
  tourDate: string
  stage: string
  priority: string
}

export type ClassroomSummary = {
  name: string
  ageGroup: string
  occupancy: string
  ratio: string
  staffLead: string
  highlight: string
}

export type StaffMember = {
  name: string
  role: string
  shift: string
  status: string
  certifications: string[]
  note: string
}

export type AttendanceMetric = {
  day: string
  present: number
  absent: number
  waitlist: number
}

export type BillingRecord = {
  family: string
  amount: number
  method: string
  status: string
  dueDate: string
}

export type Announcement = {
  title: string
  audience: string
  detail: string
  publishedAt: string
}

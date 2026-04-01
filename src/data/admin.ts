import type {
  Announcement,
  AttendanceMetric,
  BillingRecord,
  ClassroomSummary,
  DashboardStat,
  EnrollmentLead,
  StaffMember,
} from "@/lib/types"

export const adminStats: DashboardStat[] = [
  {
    label: "Children on site",
    value: "41",
    trend: "+2 from yesterday",
    detail: "Attendance is pacing above weekly average.",
  },
  {
    label: "Open waitlist leads",
    value: "12",
    trend: "4 tours this week",
    detail: "Infant and toddler rooms are the highest demand.",
  },
  {
    label: "Staff coverage",
    value: "98%",
    trend: "On track",
    detail: "Only one float reassignment needed this morning.",
  },
  {
    label: "Payments in process",
    value: "$7.8K",
    trend: "Due Monday",
    detail: "Autopay batch for monthly tuition closes tonight.",
  },
]

export const announcements: Announcement[] = [
  {
    title: "Storm drill scheduled for Thursday",
    audience: "All classrooms",
    detail: "Please confirm teacher radios are charged and attendance binders are current.",
    publishedAt: "Today",
  },
  {
    title: "Infant classroom tour request surge",
    audience: "Leadership",
    detail: "Twelve new inquiries came in this week. Consider opening an extra Thursday tour slot.",
    publishedAt: "Yesterday",
  },
  {
    title: "Kitchen vendor update",
    audience: "Operations",
    detail: "Friday lunch menu will swap rice bowls for pasta due to a supplier delay.",
    publishedAt: "Yesterday",
  },
]

export const attendanceTrend: AttendanceMetric[] = [
  { day: "Mon", present: 39, absent: 4, waitlist: 9 },
  { day: "Tue", present: 42, absent: 2, waitlist: 10 },
  { day: "Wed", present: 40, absent: 3, waitlist: 11 },
  { day: "Thu", present: 41, absent: 2, waitlist: 12 },
  { day: "Fri", present: 38, absent: 5, waitlist: 12 },
]

export const enrollmentLeads: EnrollmentLead[] = [
  {
    family: "Parker family",
    child: "June, 8 months",
    program: "Infants",
    tourDate: "Apr 7 · 9:15 AM",
    stage: "Tour confirmed",
    priority: "High",
  },
  {
    family: "Nguyen family",
    child: "Theo, 20 months",
    program: "Toddlers",
    tourDate: "Apr 9 · 5:30 PM",
    stage: "Waitlist review",
    priority: "Medium",
  },
  {
    family: "Santos family",
    child: "Lia, 3 years",
    program: "Preschool",
    tourDate: "Apr 14 · 10:00 AM",
    stage: "Application in progress",
    priority: "Low",
  },
  {
    family: "Bennett family",
    child: "Cal, 4 years",
    program: "Pre-K",
    tourDate: "Apr 16 · 3:00 PM",
    stage: "Offer drafted",
    priority: "High",
  },
]

export const classroomSummaries: ClassroomSummary[] = [
  {
    name: "Infant Nest",
    ageGroup: "6 weeks - 12 months",
    occupancy: "8 / 8",
    ratio: "1:4",
    staffLead: "Ari Kim",
    highlight: "All bottles and sleep logs updated by noon.",
  },
  {
    name: "Toddler Grove",
    ageGroup: "12 - 24 months",
    occupancy: "10 / 12",
    ratio: "1:5",
    staffLead: "Noah Patel",
    highlight: "Extra outdoor block scheduled for the afternoon.",
  },
  {
    name: "Preschool Studio",
    ageGroup: "2 - 4 years",
    occupancy: "13 / 14",
    ratio: "1:7",
    staffLead: "Elena Park",
    highlight: "Project work display ready for family pickup.",
  },
  {
    name: "Pre-K Atelier",
    ageGroup: "4 - 5 years",
    occupancy: "10 / 12",
    ratio: "1:8",
    staffLead: "Jordan Hayes",
    highlight: "Kindergarten readiness conferences open next week.",
  },
]

export const staffRoster: StaffMember[] = [
  {
    name: "Ari Kim",
    role: "Infant lead",
    shift: "7:00 AM - 3:30 PM",
    status: "On site",
    certifications: ["Infant CPR", "Safe sleep"],
    note: "Leading new-family orientation this afternoon.",
  },
  {
    name: "Noah Patel",
    role: "Toddler lead",
    shift: "8:00 AM - 4:30 PM",
    status: "On site",
    certifications: ["CPR", "Behavior guidance"],
    note: "Covering opening circle for Toddler Grove.",
  },
  {
    name: "Leah Owens",
    role: "Float teacher",
    shift: "9:00 AM - 5:30 PM",
    status: "Reassigned",
    certifications: ["CPR", "Medication"],
    note: "Supporting Preschool Studio after lunch.",
  },
  {
    name: "Mina Thompson",
    role: "Operations manager",
    shift: "8:30 AM - 5:00 PM",
    status: "In meetings",
    certifications: ["Licensing compliance"],
    note: "Reviewing April payroll and family statements.",
  },
]

export const billingRecords: BillingRecord[] = [
  {
    family: "Johnson family",
    amount: 565,
    method: "Autopay",
    status: "Processing",
    dueDate: "Apr 5",
  },
  {
    family: "Parker family",
    amount: 435,
    method: "Credit card",
    status: "Paid",
    dueDate: "Apr 5",
  },
  {
    family: "Nguyen family",
    amount: 640,
    method: "ACH",
    status: "Due",
    dueDate: "Apr 5",
  },
  {
    family: "Bennett family",
    amount: 565,
    method: "Autopay",
    status: "Paid",
    dueDate: "Apr 1",
  },
]

export const paymentTrend = [
  { week: "W1", collected: 7200, outstanding: 1100 },
  { week: "W2", collected: 7600, outstanding: 950 },
  { week: "W3", collected: 7450, outstanding: 1200 },
  { week: "W4", collected: 7800, outstanding: 840 },
]

export const childrenRoster = [
  {
    name: "Maya Johnson",
    classroom: "Preschool Studio",
    family: "Johnson family",
    attendance: "Present",
    pickup: "Jordan Johnson",
  },
  {
    name: "Theo Nguyen",
    classroom: "Toddler Grove",
    family: "Nguyen family",
    attendance: "Present",
    pickup: "Lina Nguyen",
  },
  {
    name: "June Parker",
    classroom: "Infant Nest",
    family: "Parker family",
    attendance: "Absent",
    pickup: "Sam Parker",
  },
  {
    name: "Cal Bennett",
    classroom: "Pre-K Atelier",
    family: "Bennett family",
    attendance: "Present",
    pickup: "Mara Bennett",
  },
]

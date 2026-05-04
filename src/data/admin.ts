import type {
  AdminAnnouncementPreview,
  AdminBillingReminderPreview,
  AdminCalendarEventPreview,
  AdminChildHubRecord,
  AdminChildRecordPreview,
  FamilyHubRecord,
  AdminDashboardPreview,
  AdminMetricPreview,
  AdminSettingsSectionPreview,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  DocumentQueuePreview,
  EnrollmentLeadPreview,
  FamilyBalancePreview,
  FamilyDirectoryPreview,
  ReportBarPreview,
  SiteMetadata,
  StaffProfilePreview,
  WaitlistEntryPreview,
} from "@/types/app"

export const adminMetrics: AdminMetricPreview[] = [
  {
    label: "Open leads",
    value: "14",
    detail: "New family inquiries that still need follow-up.",
  },
  {
    label: "Today's attendance",
    value: "41 / 45",
    detail: "Children checked in across all classrooms before lunch count.",
  },
  {
    label: "Balance due",
    value: "₦7,640",
    detail: "Outstanding family balances due before the next billing cycle closes.",
  },
  {
    label: "Draft or scheduled announcements",
    value: "4",
    detail: "Family communications queued for review or scheduled delivery.",
  },
]

export const adminEnrollmentLeads: EnrollmentLeadPreview[] = [
  {
    id: "lead-101",
    familyName: "Ramirez Family",
    childName: "Noah Ramirez",
    childAgeLabel: "Toddler",
    requestedStart: "May 2026",
    programInterest: "Toddler program",
    source: "Contact form",
    submittedAt: "Apr 2",
    stage: "contacted",
    priority: "high",
    assignedTo: "Sofia Chen",
    note: "Parents asked about early drop-off options and upcoming toddler openings.",
  },
  {
    id: "lead-102",
    familyName: "Bennett Family",
    childName: "Lena Bennett",
    childAgeLabel: "Infant",
    requestedStart: "June 2026",
    programInterest: "Infant care",
    source: "Website contact form",
    submittedAt: "Apr 1",
    stage: "contacted",
    priority: "normal",
    assignedTo: "Sofia Chen",
    note: "Looking for a first childcare placement and wants a smaller classroom feel.",
  },
  {
    id: "lead-103",
    familyName: "Khan Family",
    childName: "Amira Khan",
    childAgeLabel: "Preschool",
    requestedStart: "June 2026",
    programInterest: "Preschool program",
    source: "Waitlist form",
    submittedAt: "Mar 31",
    stage: "contacted",
    priority: "normal",
    assignedTo: "Mina Patel",
    note: "Family asked about kindergarten readiness support.",
  },
  {
    id: "lead-104",
    familyName: "Owens Family",
    childName: "Miles Owens",
    childAgeLabel: "Toddler",
    requestedStart: "August 2026",
    programInterest: "Toddler program",
    source: "Community referral",
    submittedAt: "Mar 29",
    stage: "application-sent",
    priority: "normal",
    assignedTo: "Mina Patel",
    note: "Sibling may enroll next year. Family is reviewing tuition and calendar fit.",
  },
]

export const adminWaitlistEntries: WaitlistEntryPreview[] = [
  {
    id: "wait-201",
    familyName: "Khan Family",
    childName: "Amira Khan",
    ageLabel: "4 years old",
    scheduleNeed: "Full time",
    requestedStart: "June 2026",
    priority: "high",
    status: "review",
    assignedTo: "Mina Patel",
    note: "Likely preschool opening after end-of-term move-out.",
  },
  {
    id: "wait-202",
    familyName: "Lee Family",
    childName: "Isaac Lee",
    ageLabel: "18 months",
    scheduleNeed: "3 days per week",
    requestedStart: "September 2026",
    priority: "medium",
    status: "review",
    assignedTo: "Sofia Chen",
    note: "Parents considering the toddler room once the summer schedule is posted.",
  },
  {
    id: "wait-203",
    familyName: "Santos Family",
    childName: "Eva Santos",
    ageLabel: "8 months",
    scheduleNeed: "Full time",
    requestedStart: "July 2026",
    priority: "high",
    status: "offer-ready",
    assignedTo: "Mina Patel",
    note: "Infant room has a likely opening; family needs final decision call this week.",
  },
  {
    id: "wait-204",
    familyName: "Greene Family",
    childName: "Nora Greene",
    ageLabel: "2 years old",
    scheduleNeed: "Morning schedule",
    requestedStart: "January 2027",
    priority: "low",
    status: "long-range",
    assignedTo: "Front Office",
    note: "Planning ahead while family relocates in late fall.",
  },
]

export const adminChildren: AdminChildRecordPreview[] = [
  {
    id: "child-301",
    slug: "ellie-harper",
    name: "Ellie Harper",
    ageLabel: "3 years",
    classroom: "Sunrise Preschool",
    familyName: "Harper Family",
    attendanceStatus: "present",
    checkInTime: "08:12",
    checkOutTime: undefined,
    attendanceNote: "Settled into art table quickly after check-in.",
    allergies: ["Strawberries"],
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 2,
  },
  {
    id: "child-302",
    slug: "theo-martinez",
    name: "Theo Martinez",
    ageLabel: "19 months",
    classroom: "Meadow Toddlers",
    familyName: "Martinez Family",
    attendanceStatus: "present",
    checkInTime: "08:46",
    checkOutTime: undefined,
    attendanceNote: "Dropped off after breakfast and joined circle time smoothly.",
    allergies: [],
    balanceStatus: "current",
    documentsStatus: "complete",
    latestPhotoCount: 1,
  },
  {
    id: "child-303",
    slug: "ava-sullivan",
    name: "Ava Sullivan",
    ageLabel: "8 months",
    classroom: "Willow Infants",
    familyName: "Sullivan Family",
    attendanceStatus: "absent",
    checkInTime: undefined,
    checkOutTime: undefined,
    attendanceNote: "Planned pediatrician appointment shared with the front desk.",
    allergies: ["Dairy"],
    balanceStatus: "current",
    documentsStatus: "complete",
    latestPhotoCount: 0,
  },
  {
    id: "child-304",
    slug: "mason-brooks",
    name: "Mason Brooks",
    ageLabel: "4 years",
    classroom: "Sunrise Preschool",
    familyName: "Brooks Family",
    attendanceStatus: "scheduled",
    checkInTime: undefined,
    checkOutTime: undefined,
    attendanceNote: "Expected after dentist appointment if family returns before lunch.",
    allergies: [],
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 0,
  },
  {
    id: "child-305",
    slug: "lily-brooks",
    name: "Lily Brooks",
    ageLabel: "2 years",
    classroom: "Meadow Toddlers",
    familyName: "Brooks Family",
    attendanceStatus: "present",
    checkInTime: "08:30",
    checkOutTime: undefined,
    attendanceNote: "Transitioned well to play area after drop-off.",
    allergies: [],
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 1,
  },
]

export const adminFamilies: FamilyDirectoryPreview[] = [
  {
    id: "fam-401",
    familyName: "Harper Family",
    guardians: ["Olivia Harper", "Marcus Harper"],
    children: ["Ellie Harper"],
    primaryEmail: "olivia@harperfamily.com",
    balanceStatus: "due",
    documentsDue: 1,
    enrollmentStage: "Enrolled",
  },
  {
    id: "fam-402",
    familyName: "Martinez Family",
    guardians: ["Lucia Martinez", "Rafael Martinez"],
    children: ["Theo Martinez"],
    primaryEmail: "lucia@martinezfamily.com",
    balanceStatus: "current",
    documentsDue: 0,
    enrollmentStage: "Enrolled",
  },
  {
    id: "fam-403",
    familyName: "Sullivan Family",
    guardians: ["Grace Sullivan"],
    children: ["Ava Sullivan"],
    primaryEmail: "grace@sullivanfamily.com",
    balanceStatus: "current",
    documentsDue: 0,
    enrollmentStage: "Enrolled",
  },
  {
    id: "fam-404",
    familyName: "Khan Family",
    guardians: ["Amina Khan", "Farid Khan"],
    children: ["Amira Khan"],
    primaryEmail: "amina@khanfamily.com",
    balanceStatus: "current",
    documentsDue: 0,
    enrollmentStage: "Waitlist review",
  },
  {
    id: "fam-405",
    familyName: "Brooks Family",
    guardians: ["Jessica Brooks", "Daniel Brooks"],
    children: ["Mason Brooks", "Lily Brooks"],
    primaryEmail: "jessica@brooksfamily.com",
    balanceStatus: "due",
    documentsDue: 1,
    enrollmentStage: "Enrolled",
  },
]

export const adminClassrooms: ClassroomSummaryPreview[] = [
  {
    id: "room-501",
    name: "Willow Infants",
    ageGroup: "6 weeks - 15 months",
    leadTeacher: "Dana Lewis",
    enrolled: 8,
    capacity: 8,
    ratio: "1:4 coverage on site",
    nextEvent: "Bottle schedule review at 2:30 PM",
    note: "Full room. One likely summer transition to toddlers.",
  },
  {
    id: "room-502",
    name: "Meadow Toddlers",
    ageGroup: "15 months - 3 years",
    leadTeacher: "Aria Flores",
    enrolled: 12,
    capacity: 14,
    ratio: "1:6 coverage on site",
    nextEvent: "Outdoor sensory setup tomorrow",
    note: "Two part-time inquiries could fit after September schedule reset.",
  },
  {
    id: "room-503",
    name: "Sunrise Preschool",
    ageGroup: "3 - 5 years",
    leadTeacher: "Elena Morales",
    enrolled: 15,
    capacity: 16,
    ratio: "1:8 coverage on site",
    nextEvent: "Family breakfast Friday",
    note: "One likely June opening tied to kindergarten transition.",
  },
]

export const adminChildrenHub: AdminChildHubRecord[] = [
  {
    id: "child-301",
    slug: "ellie-harper",
    firstName: "Ellie",
    lastName: "Harper",
    name: "Ellie Harper",
    ageLabel: "3 years",
    birthday: "2022-01-15",
    classroom: "Sunrise Preschool",
    classroomId: "room-503",
    familyName: "Harper Family",
    familyId: "fam-401",
    attendanceStatus: "present",
    checkInTime: "08:12",
    checkOutTime: undefined,
    attendanceNote: "Brought sunscreen and change of clothes for water play.",
    allergies: ["Strawberries"],
    medicalNotes: "Carries an EpiPen in her cubby for berry allergies.",
    comfortNotes: "Likes to hold a small blanket during rest time.",
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 2,
    latestDailyReport: {
      dateLabel: "Thursday, April 3",
      isToday: false,
      arrivalMood: "Curious and settled after a short drop-off hug.",
      summary:
        "Ellie had a steady day with garden journaling, a long outdoor block, and a calm rest transition.",
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
      ],
      staffNotes: [
        "Please send the green rain jacket tomorrow if possible.",
      ],
    },
    siblings: [],
    emergencyContacts: [],
    authorizedPickups: [],
    recentAttendance: [],
  },
  {
    id: "child-302",
    slug: "theo-martinez",
    firstName: "Theo",
    lastName: "Martinez",
    name: "Theo Martinez",
    ageLabel: "19 months",
    birthday: "2023-08-20",
    classroom: "Meadow Toddlers",
    classroomId: "room-502",
    familyName: "Martinez Family",
    familyId: "fam-402",
    attendanceStatus: "present",
    checkInTime: "08:46",
    checkOutTime: undefined,
    attendanceNote: "Napped in the car — may not need morning rest.",
    allergies: [],
    medicalNotes: "",
    comfortNotes: "Prefers soft music during nap transition.",
    balanceStatus: "current",
    documentsStatus: "complete",
    latestPhotoCount: 1,
    latestDailyReport: {
      dateLabel: "Wednesday, April 2",
      isToday: false,
      arrivalMood: "Needed a slower handoff, then joined circle time smoothly.",
      summary: "Theo had a warm toddler day with music, sensory bins, and a short outdoor loop after snack.",
      meals: [
        {
          label: "Lunch",
          time: "11:25 AM",
          details: "Mac and cheese, peas, and pears",
          status: "eaten",
        },
      ],
      rest: [
        {
          label: "Nap",
          time: "12:10 PM",
          duration: "1 hour 12 minutes",
          note: "Fell asleep with soft music after a few extra minutes of rocking.",
        },
      ],
      activities: [
        {
          time: "10:05 AM",
          title: "Water sensory table",
          description: "Practiced scooping and pouring alongside two classmates.",
        },
      ],
      staffNotes: [
        "Family mentioned an earlier car nap at drop-off.",
      ],
    },
    siblings: [],
    emergencyContacts: [],
    authorizedPickups: [],
    recentAttendance: [],
  },
  {
    id: "child-303",
    slug: "ava-sullivan",
    firstName: "Ava",
    lastName: "Sullivan",
    name: "Ava Sullivan",
    ageLabel: "8 months",
    birthday: "2024-07-10",
    classroom: "Willow Infants",
    classroomId: "room-501",
    familyName: "Sullivan Family",
    familyId: "fam-403",
    attendanceStatus: "absent",
    checkInTime: undefined,
    checkOutTime: undefined,
    attendanceNote: "Parent notified — staying home with mild cold.",
    allergies: ["Dairy"],
    medicalNotes: "Sensitive stomach; dairy-free formula only.",
    comfortNotes: "Settles with pacifier and white noise.",
    balanceStatus: "current",
    documentsStatus: "complete",
    latestPhotoCount: 0,
    latestDailyReport: null,
    siblings: [],
    emergencyContacts: [],
    authorizedPickups: [],
    recentAttendance: [],
  },
  {
    id: "child-304",
    slug: "mason-brooks",
    firstName: "Mason",
    lastName: "Brooks",
    name: "Mason Brooks",
    ageLabel: "4 years",
    birthday: "2021-03-05",
    classroom: "Sunrise Preschool",
    classroomId: "room-503",
    familyName: "Brooks Family",
    familyId: "fam-405",
    attendanceStatus: "scheduled",
    checkInTime: undefined,
    checkOutTime: undefined,
    attendanceNote: "Expected after dentist appointment if family returns before lunch.",
    allergies: [],
    medicalNotes: "",
    comfortNotes: "Enjoys building blocks during free play.",
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 0,
    latestDailyReport: {
      dateLabel: "Tuesday, April 1",
      isToday: false,
      arrivalMood: "Arrived after a dental check and needed a few quiet minutes.",
      summary: "Mason rejoined the class for lunch and spent most of the afternoon in building play.",
      meals: [
        {
          label: "Lunch",
          time: "12:20 PM",
          details: "Bean quesadilla and melon",
          status: "partial",
        },
      ],
      rest: [],
      activities: [
        {
          time: "2:00 PM",
          title: "Building center",
          description: "Worked on a block garage and invited a friend to add ramps.",
        },
      ],
      staffNotes: [
        "Still slightly tender after the appointment, but mood improved after lunch.",
      ],
    },
    siblings: [
      { id: "child-305", name: "Lily Brooks", ageLabel: "2 years", classroom: "Meadow Toddlers" },
    ],
    emergencyContacts: [],
    authorizedPickups: [],
    recentAttendance: [],
  },
  {
    id: "child-305",
    slug: "lily-brooks",
    firstName: "Lily",
    lastName: "Brooks",
    name: "Lily Brooks",
    ageLabel: "2 years",
    birthday: "2023-02-18",
    classroom: "Meadow Toddlers",
    classroomId: "room-502",
    familyName: "Brooks Family",
    familyId: "fam-405",
    attendanceStatus: "present",
    checkInTime: "08:30",
    checkOutTime: undefined,
    attendanceNote: "Transitioned well to play area after drop-off.",
    allergies: [],
    medicalNotes: "",
    comfortNotes: "Likes to sit near her teacher during circle time.",
    balanceStatus: "due",
    documentsStatus: "pending",
    latestPhotoCount: 1,
    latestDailyReport: {
      dateLabel: "Thursday, April 3",
      isToday: false,
      arrivalMood: "Cheerful and ready for songs right after check-in.",
      summary: "Lily had a busy toddler day with finger painting, snack, and a calm rest transition.",
      meals: [
        {
          label: "Morning snack",
          time: "9:05 AM",
          details: "Applesauce and oat bites",
          status: "eaten",
        },
      ],
      rest: [
        {
          label: "Nap",
          time: "12:15 PM",
          duration: "55 minutes",
          note: "Needed extra back pats, then rested soundly.",
        },
      ],
      activities: [
        {
          time: "10:10 AM",
          title: "Finger painting",
          description: "Focused on mixing colors and naming the ones she saw.",
        },
      ],
      staffNotes: [
        "Please send another change of socks for outdoor water play days.",
      ],
    },
    siblings: [
      { id: "child-304", name: "Mason Brooks", ageLabel: "4 years", classroom: "Sunrise Preschool" },
    ],
    emergencyContacts: [],
    authorizedPickups: [],
    recentAttendance: [],
  },
]

export const adminAttendanceBoard: ClassroomAttendancePreview[] = [
  {
    classroom: "Willow Infants",
    expected: 8,
    present: 7,
    absent: 1,
    late: 0,
    note: "One planned pediatrician appointment.",
  },
  {
    classroom: "Meadow Toddlers",
    expected: 14,
    present: 13,
    absent: 1,
    late: 1,
    note: "One family running late after transit delay.",
  },
  {
    classroom: "Sunrise Preschool",
    expected: 23,
    present: 21,
    absent: 2,
    late: 0,
    note: "Two scheduled family days.",
  },
]

export const adminBalances: FamilyBalancePreview[] = [
  {
    id: "bal-601",
    familyName: "Harper Family",
    totalDue: "₦1,520",
    dueDate: "Apr 10",
    invoiceCount: 1,
    method: "Manual card payment",
    status: "due",
  },
  {
    id: "bal-602",
    familyName: "Brooks Family",
    totalDue: "₦2,170",
    dueDate: "Apr 7",
    invoiceCount: 2,
    method: "ACH on file",
    status: "overdue",
  },
  {
    id: "bal-603",
    familyName: "Martinez Family",
    totalDue: "₦0",
    dueDate: "—",
    invoiceCount: 0,
    method: "ACH on file",
    status: "current",
  },
]

export const adminFamilyHub: FamilyHubRecord[] = adminFamilies.map((family) => ({
  ...family,
  childRecords: adminChildrenHub.filter((c) => c.familyId === family.id),
  balance: adminBalances.find((b) => b.familyName === family.familyName) ?? null,
  notes: [],
}))

export const adminStaffProfiles: StaffProfilePreview[] = [
  {
    id: "staff-701",
    name: "Elena Morales",
    role: "Lead Teacher",
    classroom: "Sunrise Preschool",
    certification: "ECE Lead · CPR current",
    status: "scheduled",
    note: "Leads preschool family breakfast prep this week.",
  },
  {
    id: "staff-702",
    name: "Dana Lewis",
    role: "Lead Teacher",
    classroom: "Willow Infants",
    certification: "Infant/Toddler · CPR current",
    status: "scheduled",
    note: "Updated bottle routine notes for two infant families.",
  },
  {
    id: "staff-703",
    name: "Jamie Ortiz",
    role: "Float Teacher",
    classroom: "Cross-room coverage",
    certification: "ECE Assistant · CPR current",
    status: "coverage-needed",
    note: "Needed to cover toddler lunch block Friday afternoon.",
  },
  {
    id: "staff-704",
    name: "Monique Howard",
    role: "Assistant Teacher",
    classroom: "Meadow Toddlers",
    certification: "ECE Assistant · CPR current",
    status: "out",
    note: "Out sick today. Substitute requested for tomorrow morning.",
  },
]

export const adminDocuments: DocumentQueuePreview[] = [
  {
    id: "doc-801",
    title: "Field trip waiver",
    familyId: "fam-401",
    familyName: "Harper Family",
    childId: "child-301",
    childName: "Ellie Harper",
    dueDate: "Apr 7",
    status: "required",
    owner: "Preschool",
    note: "Needed before garden trip roster is finalized.",
  },
  {
    id: "doc-802",
    title: "Emergency contact update",
    familyId: "fam-404",
    familyName: "Brooks Family",
    childId: "child-304",
    childName: "Mason Brooks",
    dueDate: "Apr 5",
    status: "submitted",
    owner: "Front office",
    note: "New pickup contact awaiting final review.",
  },
  {
    id: "doc-803",
    title: "Allergy action plan",
    familyId: "fam-405",
    familyName: "Sullivan Family",
    childName: "Ava Sullivan",
    dueDate: "—",
    status: "approved",
    owner: "Infant room",
    note: "Current plan confirmed with kitchen staff.",
  },
  {
    id: "doc-804",
    title: "Medication authorization",
    familyId: "fam-406",
    familyName: "Reed Family",
    childName: "Jonah Reed",
    dueDate: "Mar 22",
    status: "expired",
    owner: "Front office",
    note: "Renewal reminder already sent to family.",
  },
]

export const adminAnnouncements: AdminAnnouncementPreview[] = [
  {
    id: "ann-901",
    title: "Spring family breakfast reminder",
    audience: "All families",
    publishStatus: "scheduled",
    scheduledFor: "Apr 8 · 6:00 PM",
    scheduledForValue: "2026-04-08T18:00",
    summary: "Reminder with parking notes, breakfast timing, and classroom check-in details.",
    body: "We are looking forward to seeing families on Friday morning. Please use the side entrance after 8:15, allow a few extra minutes for parking, and head directly to your child’s classroom for breakfast check-in.",
  },
  {
    id: "ann-902",
    title: "Infant room supply note",
    audience: "Infant families",
    publishStatus: "draft",
    scheduledFor: "Not scheduled",
    scheduledForValue: undefined,
    summary: "Request for labeled extra outfits and updated comfort items before the weather shift.",
    body: "As the weather changes, please refresh your child’s spare clothing and any comfort items that stay in the classroom so staff can keep infants comfortable through the spring transition.",
  },
  {
    id: "ann-903",
    title: "Professional development closure follow-up",
    audience: "All families",
    publishStatus: "published",
    scheduledFor: "Apr 1 · 4:30 PM",
    scheduledForValue: "2026-04-01T16:30",
    summary: "Closure reminder and thank-you note with upcoming classroom prep highlights.",
    body: "Thank you for planning around our professional development day. Staff used the closure to refresh classroom setups, update materials, and prepare for the next family event cycle.",
  },
]

export const adminCalendarEvents: AdminCalendarEventPreview[] = [
  {
    id: "cal-1001",
    title: "Spring family breakfast",
    description:
      "Families are invited to join their classroom for breakfast before morning circle and the day’s regular transition.",
    category: "family",
    targetScope: "school",
    targetLabel: "All families",
    dateLabel: "Apr 11",
    timeLabel: "8:00 AM",
    timeKind: "timed",
    startsAtValue: "2026-04-11T08:00",
    eventDateValue: "2026-04-11",
  },
  {
    id: "cal-1002",
    title: "Garden walk and planting day",
    description:
      "Sunrise Preschool children will visit the neighborhood garden for planting, observation, and journal sketches.",
    category: "classroom",
    targetScope: "classroom",
    targetLabel: "Sunrise Preschool",
    classroomId: "room-503",
    classroomLabel: "Sunrise Preschool",
    dateLabel: "Apr 18",
    timeLabel: "9:30 AM",
    timeKind: "timed",
    startsAtValue: "2026-04-18T09:30",
    eventDateValue: "2026-04-18",
  },
  {
    id: "cal-1003",
    title: "Professional development closure",
    description:
      "School closed for staff development and classroom reset work before the next family event cycle.",
    category: "closure",
    targetScope: "school",
    targetLabel: "All families",
    dateLabel: "Apr 26",
    timeLabel: "All day",
    timeKind: "all-day",
    eventDateValue: "2026-04-26",
  },
]

export const adminBillingReminders: AdminBillingReminderPreview[] = [
  {
    id: "billing:inv-1009",
    familyName: "Harper Family",
    label: "April Tuition",
    amount: "₦1,520",
    dueDate: "Apr 10",
    timeLabel: "By 1:00 PM",
    status: "due",
    description:
      "Generated from the current open invoice and shown automatically on the Harper family calendar.",
  },
  {
    id: "billing:inv-1014",
    familyName: "Brooks Family",
    label: "April Tuition",
    amount: "₦2,170",
    dueDate: "Apr 7",
    timeLabel: "By 1:00 PM",
    status: "overdue",
    description:
      "Generated from the outstanding Brooks family balance and visible automatically to that family.",
  },
]

export const adminReportBars = {
  attendance: [
    { label: "Willow Infants", value: 7, total: 8, note: "88% present today" },
    { label: "Meadow Toddlers", value: 13, total: 14, note: "93% present today" },
    { label: "Sunrise Preschool", value: 21, total: 23, note: "91% present today" },
  ] satisfies ReportBarPreview[],
  revenue: [
    { label: "Collected", value: 18420, total: 26060, note: "Current month receipts posted" },
    { label: "Due soon", value: 7640, total: 26060, note: "Balances due within the next week" },
    { label: "Overdue", value: 0, total: 26060, note: "Most families are current or within due window" },
  ] satisfies ReportBarPreview[],
  enrollment: [
    { label: "Contacted", value: 9, total: 14, note: "New leads in initial follow-up" },
    { label: "Application sent", value: 2, total: 14, note: "Closer to placement decision" },
  ] satisfies ReportBarPreview[],
}

export const adminSettingsSections: AdminSettingsSectionPreview[] = [
  {
    id: "school-defaults",
    sectionKey: "school-defaults",
    title: "School defaults",
    description: "Operational settings that shape enrollment and family communication.",
    items: [
      { id: "setting-1", label: "Business hours", value: "7:30 AM - 5:45 PM" },
      { id: "setting-2", label: "Waitlist follow-up cadence", value: "Within 2 business days", note: "Long-range families reviewed monthly." },
    ],
  },
  {
    id: "billing-rules",
    sectionKey: "billing-rules",
    title: "Billing rules",
    description: "Parent-facing payment expectations that should remain easy to explain.",
    items: [
      { id: "setting-4", label: "Monthly tuition due", value: "10th of each month" },
      { id: "setting-5", label: "Late reminder sequence", value: "3, 7, and 14 days after due date" },
    ],
  },
  {
    id: "notification-settings",
    sectionKey: "notification-settings",
    title: "Notification settings",
    description: "How the school currently frames family communication priorities.",
    items: [
      { id: "setting-7", label: "Urgent alerts", value: "Email and call" },
      { id: "setting-8", label: "General announcements", value: "Email digest and portal notice" },
      { id: "setting-9", label: "Classroom updates", value: "Parent portal daily summary" },
    ],
  },
]

export const adminDashboardPreview: AdminDashboardPreview = {
  metrics: adminMetrics,
  leads: adminEnrollmentLeads.slice(0, 3),
  attendance: {
    present: 41,
    absent: 4,
    ratio: "91% present",
  },
  balances: adminBalances,
  announcements: adminAnnouncements,
  domains: [
    {
      key: "child-day",
      label: "Child Day",
      title: "Parent-facing daily updates still need classroom coverage.",
      description:
        "Daily reports, attendance context, and photo updates are the school side of the child-day experience parents see first.",
      ownerLabel: "School owns the update",
      recentLabel: "3 child reports updated today",
      actionLabel: "Open child day",
      actionHref: "/admin/families",
      statusLabel: "Needs coverage",
      statusTone: "warning",
      stats: [
        { label: "Reports live", value: "3" },
        { label: "Children present", value: "41" },
        { label: "Photos added", value: "4" },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      title: "Family threads and school updates belong in one queue.",
      description:
        "Direct replies and school-wide updates should share the same communication language so families never feel split across channels.",
      ownerLabel: "Shared conversation ownership",
      recentLabel: "4 open threads · 2 broadcasts queued",
      actionLabel: "Open messages",
      actionHref: "/admin/communications",
      statusLabel: "Open items",
      statusTone: "info",
      stats: [
        { label: "Open threads", value: "4" },
        { label: "Drafts", value: "2" },
      ],
    },
    {
      key: "documents",
      label: "Documents",
      title: "Document requests, submissions, and approvals need one shared queue.",
      description:
        "The school requests and reviews documents while families upload them, so the queue has to reflect both sides of the workflow clearly.",
      ownerLabel: "Family upload, school review",
      recentLabel: "5 items still need review",
      actionLabel: "Open documents",
      actionHref: "/admin/documents",
      statusLabel: "Action needed",
      statusTone: "warning",
      stats: [
        { label: "Required", value: "2" },
        { label: "Submitted", value: "3" },
      ],
    },
    {
      key: "billing",
      label: "Billing",
      title: "Collections follow-up should match the billing state families see.",
      description:
        "Due balances and invoice drafting need to use the same billing language that parents see in their portal.",
      ownerLabel: "School follow-up",
      recentLabel: "₦3,690 across 2 families needs action",
      actionLabel: "Open billing",
      actionHref: "/admin/billing",
      statusLabel: "Due and overdue",
      statusTone: "warning",
      stats: [
        { label: "Due", value: "1" },
        { label: "Overdue", value: "1" },
      ],
    },
    {
      key: "calendar",
      label: "Calendar",
      title: "Calendar publishing controls what parents can plan around next.",
      description:
        "Manual events and derived billing reminders should read like one schedule, even though the source of each item is different on the admin side.",
      ownerLabel: "School publishes dates",
      recentLabel: "3 manual events · 2 billing reminders",
      actionLabel: "Open calendar",
      actionHref: "/admin/calendar",
      statusLabel: "Live immediately",
      statusTone: "success",
      stats: [
        { label: "School-wide", value: "2" },
        { label: "Classroom-targeted", value: "1" },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      title: "School policy should stay in sync with the parent-facing product.",
      description:
        "Billing rules, notification defaults, and family-facing policy language should stay connected instead of living in a technical admin silo.",
      ownerLabel: "School-owned policy",
      recentLabel: "3 policy groups live",
      actionLabel: "Open settings",
      actionHref: "/admin/settings",
      statusLabel: "Live editing",
      statusTone: "secondary",
      stats: [
        { label: "Policy groups", value: "3" },
        { label: "Invites pending", value: "1" },
      ],
    },
  ],
}

export const adminOverviewPageContent = {
  metadata: {
    title: "Admin Portal",
    description:
      "Operational overview for enrollment, attendance, billing, documents, announcements, and current school priorities.",
    pathname: "/admin",
  } satisfies SiteMetadata,
  eyebrow: "Center dashboard",
  title: "What needs attention today across children, families, and classrooms.",
  description:
    "Track attendance, messages, balances, forms, classroom coverage, and family follow-up from one operational dashboard that stays calm under pressure.",
}

export const adminEnrollmentPageContent = {
  metadata: {
    title: "Enrollment",
    description:
      "Lead review and family follow-up with clear stage visibility, ownership, and next-step notes.",
    pathname: "/admin/enrollment",
  } satisfies SiteMetadata,
  eyebrow: "Enrollment",
  title: "Lead review and family follow-up",
  description:
    "New family interest should move through a clear pipeline so next steps are visible and no inquiry is lost in the shuffle.",
}

export const adminWaitlistPageContent = {
  metadata: {
    title: "Waitlist",
    description:
      "Waitlist management for placement timing, schedule needs, and family follow-up priorities.",
    pathname: "/admin/waitlist",
  } satisfies SiteMetadata,
  eyebrow: "Waitlist",
  title: "Placement timing and follow-up priorities",
  description:
    "The waitlist view helps the team compare requested start dates, schedule needs, and likely openings without turning the page into a spreadsheet dump.",
}

export const adminFamiliesPageContent = {
  metadata: {
    title: "Families",
    description:
      "Family directory for contacts, billing state, document follow-up, and enrollment context.",
    pathname: "/admin/families",
  } satisfies SiteMetadata,
  eyebrow: "Families",
  title: "Household context and follow-up in one view",
  description:
    "Directors and admins need a quick way to see who the family is, where they are in the process, and whether any paperwork or balances still need attention.",
}

export const adminFamilyHubPageContent = {
  metadata: {
    title: "Families",
    description:
      "Unified family hub with children, billing, and enrollment context in one view.",
    pathname: "/admin/families",
  } satisfies SiteMetadata,
  eyebrow: "Families",
  title: "Family directory",
  description: "Households, billing, and enrollment — all in one place.",
}

export const adminClassroomsPageContent = {
  metadata: {
    title: "Classrooms",
    description:
      "Classroom capacity, staffing, ratio context, and near-term room notes for admin oversight.",
    pathname: "/admin/classrooms",
  } satisfies SiteMetadata,
  eyebrow: "Classrooms",
  title: "Capacity, ratio, and room-level planning",
  description:
    "Room summaries should make staffing, capacity, and likely openings visible without forcing admins to jump between multiple screens.",
}

export const adminAttendancePageContent = {
  metadata: {
    title: "Attendance",
    description:
      "Daily attendance overview with classroom counts, late arrivals, and board-style operational context.",
    pathname: "/admin/attendance",
  } satisfies SiteMetadata,
  eyebrow: "Attendance",
  title: "Daily attendance and classroom coverage",
  description:
    "Attendance needs more density than the parent view, but it should still stay legible and quick to act on during the day.",
}

export const adminBillingPageContent = {
  metadata: {
    title: "Billing",
    description:
      "Invoice batches, family balances, and current collections context for the admin team.",
    pathname: "/admin/billing",
  } satisfies SiteMetadata,
  eyebrow: "Billing",
  title: "Collections and invoice visibility",
  description:
    "The billing view should make what is due, what is overdue, and which families need follow-up obvious without adding stress-inducing noise.",
}

export const adminStaffPageContent = {
  metadata: {
    title: "Staff",
    description:
      "Staff directory with classroom assignments, certification visibility, and coverage needs.",
    pathname: "/admin/staff",
  } satisfies SiteMetadata,
  eyebrow: "Staff",
  title: "Staffing coverage and classroom assignments",
  description:
    "Role clarity and coverage notes should be visible at a glance so the team can respond quickly when schedules shift.",
}

export const adminDocumentsPageContent = {
  metadata: {
    title: "Documents",
    description:
      "Family paperwork and document queue with due states, owners, and review context.",
    pathname: "/admin/documents",
  } satisfies SiteMetadata,
  eyebrow: "Documents",
  title: "Paperwork queues and due-state follow-up",
  description:
    "Document management belongs in its own organized view so families needing paperwork follow-up are easy to identify.",
}

export const adminAnnouncementsPageContent = {
  metadata: {
    title: "Announcements",
    description:
      "Drafts, scheduled updates, and published family communications grouped by audience and status.",
    pathname: "/admin/announcements",
  } satisfies SiteMetadata,
  eyebrow: "Announcements",
  title: "Family communication planning and publishing",
  description:
    "Announcements should be easy to scan by audience, schedule, and publishing state so the team can keep communications consistent.",
}

export const adminMessagesPageContent = {
  metadata: {
    title: "Messages",
    description:
      "Threaded conversations with families organized by classroom, response status, and recency.",
    pathname: "/admin/messages",
  } satisfies SiteMetadata,
  eyebrow: "Messages",
  title: "Family conversations grouped by thread status",
  description:
    "Open threads that need a reply surface first so nothing falls through the cracks.",
}

export const adminCalendarPageContent = {
  metadata: {
    title: "Calendar",
    description:
      "Manual parent-facing events, classroom-targeted dates, and system-generated billing reminders.",
    pathname: "/admin/calendar",
  } satisfies SiteMetadata,
  eyebrow: "Calendar management",
  title: "Family calendar events and reminders",
  description:
    "Admins can publish school-wide or classroom-targeted events here, while billing reminders stay system-generated from the invoice queue.",
}

export const adminReportsPageContent = {
  metadata: {
    title: "Reports",
    description:
      "Operational metrics and chart summaries for attendance, enrollment movement, and billing context.",
    pathname: "/admin/reports",
  } satisfies SiteMetadata,
  eyebrow: "Reports",
  title: "Metrics and chart summaries that earn their space",
  description:
    "Charts only belong here when they improve understanding. The reports page focuses on trend visibility, not decorative dashboard widgets.",
}

export const adminSettingsPageContent = {
  metadata: {
    title: "Settings",
    description:
      "School defaults, billing rules, and notification policies grouped for admin review.",
    pathname: "/admin/settings",
  } satisfies SiteMetadata,
  eyebrow: "Settings",
  title: "Operational defaults and policy visibility",
  description:
    "Settings stay grouped and explanatory so the page feels like part of the product, not an isolated technical admin panel.",
}

export const adminRoomsPageContent = {
  metadata: {
    title: "Rooms & Operations",
    description:
      "Classroom rosters, daily attendance, and staff assignments in one unified view.",
    pathname: "/admin/rooms",
  } satisfies SiteMetadata,
  eyebrow: "Rooms",
  title: "Classrooms, attendance, and staffing at a glance",
  description:
    "The rooms hub brings classroom rosters, daily attendance tracking, and staff assignments together so operational decisions stay connected to real capacity.",
}

export const adminCommunicationsPageContent = {
  metadata: {
    title: "Messages",
    description:
      "Parent messages and school-wide announcements in one place for consistent family communication.",
    pathname: "/admin/messages",
  } satisfies SiteMetadata,
  eyebrow: "Messages and announcements",
  title: "Family conversations and school updates in one workspace",
  description:
    "All family communication lives here — direct messages for individual follow-up and announcements for school-wide updates — so nothing slips between channels.",
}

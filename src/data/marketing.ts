import type { FAQItem, Program, TourSlot, TuitionTier } from "@/lib/types"

export const heroMetrics = [
  {
    value: "1:4",
    label: "Infant ratio planning",
  },
  {
    value: "7:00 AM",
    label: "Flexible early drop-off",
  },
  {
    value: "Daily",
    label: "Real-time parent updates",
  },
]

export const trustStats = [
  {
    value: "48",
    label: "families enrolled",
    detail: "A boutique center intentionally sized for strong relationships.",
  },
  {
    value: "4.9/5",
    label: "parent satisfaction",
    detail: "Driven by clarity, warmth, and dependable daily communication.",
  },
  {
    value: "6",
    label: "classroom touchpoints",
    detail: "Meals, naps, activities, notes, forms, and billing in one portal.",
  },
]

export const programs: Program[] = [
  {
    id: "infant",
    name: "Infants",
    ages: "6 weeks - 12 months",
    schedule: "Full-day and 3-day care",
    ratio: "1 teacher for every 4 infants",
    summary:
      "A gentle rhythm focused on secure attachment, sleep support, and sensory-rich moments.",
    highlight: "Flexible bottle and nap tracking with family notes built in.",
    highlights: [
      "Individual feeding and rest plans",
      "Soft sensory play and language exposure",
      "Daily care notes shared with families",
    ],
  },
  {
    id: "toddler",
    name: "Toddlers",
    ages: "12 - 24 months",
    schedule: "Full-day and school-year options",
    ratio: "1 teacher for every 6 toddlers",
    summary:
      "Confident exploration, routine, and communication skills anchored by responsive caregivers.",
    highlight: "Toileting readiness, language bursts, and movement-rich play.",
    highlights: [
      "Predictable transitions and visual routines",
      "Music, story, and gross motor play",
      "Warm guidance for independence",
    ],
  },
  {
    id: "preschool",
    name: "Preschool",
    ages: "2 - 4 years",
    schedule: "Full-day, half-day, and enrichment afternoons",
    ratio: "1 teacher for every 8 children",
    summary:
      "A curious, play-based studio for social-emotional growth, early literacy, and discovery.",
    highlight: "Project work, outdoor learning, and parent updates that feel useful.",
    highlights: [
      "Emergent curriculum and play invitations",
      "Small-group literacy and numeracy moments",
      "Outdoor exploration every day",
    ],
  },
  {
    id: "pre-k",
    name: "Pre-K",
    ages: "4 - 5 years",
    schedule: "School day and extended day",
    ratio: "1 teacher for every 10 children",
    summary:
      "A confident bridge into kindergarten with structure, joy, and practical family communication.",
    highlight: "School-readiness goals paired with calm, organized parent handoff.",
    highlights: [
      "Kindergarten readiness benchmarks",
      "Collaborative problem-solving and self-help skills",
      "Portfolio updates and conference-ready notes",
    ],
  },
]

export const tuitionTiers: TuitionTier[] = [
  {
    name: "Foundations",
    weeklyRate: 435,
    schedule: "3 days per week",
    deposit: "Two-week tuition deposit",
    description: "Ideal for families easing into center-based care.",
    includes: [
      "Daily parent portal updates",
      "Morning snack and afternoon snack",
      "Seasonal family events",
    ],
  },
  {
    name: "Signature Care",
    weeklyRate: 565,
    schedule: "5 full days per week",
    deposit: "Two-week tuition deposit",
    featured: true,
    description: "Our most popular option for consistent, full-week routines.",
    includes: [
      "Daily parent portal updates",
      "Meals and snacks",
      "Conferences, milestone notes, and enrichment labs",
    ],
  },
  {
    name: "Extended Day",
    weeklyRate: 640,
    schedule: "5 days with early drop-off and late pickup",
    deposit: "Two-week tuition deposit",
    description: "For families who need a little more room around the school day.",
    includes: [
      "All Signature Care features",
      "Early drop-off starting at 7:00 AM",
      "Late pickup until 6:00 PM",
    ],
  },
]

export const familyFaqs: FAQItem[] = [
  {
    question: "How often do parents receive updates during the day?",
    answer:
      "Families receive real-time meal, nap, activity, and note updates, plus a clear end-of-day snapshot in the parent portal.",
  },
  {
    question: "Can we tour before joining the waitlist?",
    answer:
      "Yes. Tours are the first step. We walk through classrooms, routines, safety procedures, and the parent portal experience before any enrollment decision.",
  },
  {
    question: "What is included in tuition?",
    answer:
      "Tuition includes classroom care, meals and snacks on full-day schedules, family communication, developmental notes, and regular community events.",
  },
  {
    question: "How do authorized pickups work?",
    answer:
      "Families manage approved pickup contacts inside the parent portal. Staff see the latest approved list and any notes at dismissal.",
  },
]

export const aboutValues = [
  {
    title: "Calm by design",
    description:
      "Spaces, schedules, and communication are built to lower stress for children, caregivers, and parents.",
  },
  {
    title: "Trust through detail",
    description:
      "We share the practical moments families actually ask about: sleep, meals, comfort, transitions, and follow-up.",
  },
  {
    title: "Partnership with parents",
    description:
      "The portal and classroom routines are designed to keep caregivers and families aligned without adding noise.",
  },
]

export const leadershipNotes = [
  {
    name: "Elena Park",
    title: "Center director",
    bio: "Former infant-toddler specialist focused on family communication and calm classroom systems.",
  },
  {
    name: "Jordan Hayes",
    title: "Program coordinator",
    bio: "Leads curriculum planning, family onboarding, and cross-classroom consistency.",
  },
  {
    name: "Mina Thompson",
    title: "Operations manager",
    bio: "Keeps enrollment, billing, staffing, and daily logistics organized for families and staff.",
  },
]

export const tourSlots: TourSlot[] = [
  {
    date: "2026-04-07",
    time: "9:15 AM",
    host: "Elena Park",
    seatsLeft: 3,
  },
  {
    date: "2026-04-09",
    time: "5:30 PM",
    host: "Jordan Hayes",
    seatsLeft: 2,
  },
  {
    date: "2026-04-14",
    time: "10:00 AM",
    host: "Mina Thompson",
    seatsLeft: 4,
  },
]

export const visitChecklist = [
  "Walk through infant, toddler, and preschool classrooms",
  "Review daily routines, health practices, and pickup flow",
  "See the parent portal and billing experience in context",
  "Ask about availability, waitlist timing, and family fit",
]

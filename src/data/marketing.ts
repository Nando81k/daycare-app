import { brandConfig } from "@/config/brand"
import type {
  ContactMethod,
  FaqGroup,
  GalleryMoment,
  MarketingMediaAsset,
  ProgramDetail,
  ProgramSummary,
  SiteMetadata,
  Testimonial,
  TrustPoint,
  TuitionTier,
  ValuePillar,
} from "@/types/app"

export const ageRangeOptions = [
  "Infant (6 weeks - 15 months)",
  "Toddler (15 months - 3 years)",
  "Preschool (3 - 5 years)",
  "Expecting / planning ahead",
]

export const programInterestOptions = [
  "Infant care",
  "Toddler program",
  "Preschool program",
  "Not sure yet",
]

export const startTimeframeOptions = [
  "As soon as possible",
  "Within 1-3 months",
  "Within 3-6 months",
  "Planning for a future school year",
]

export const scheduleNeedOptions = [
  "Full time",
  "3 days per week",
  "Morning preschool schedule",
  "Still deciding",
]

export const referralSourceOptions = [
  "Friend or family referral",
  "Online search",
  "Community event",
  "Pediatrician or local partner",
  "Social media",
]

export const contactTopicOptions = [
  "Programs and availability",
  "Enrollment help",
  "Tuition and enrollment",
  "Parent portal support",
  "General question",
]

export const marketingMedia = {
  programsInfants: {
    src: "/marketing/ball-pit-joy.jpg",
    alt: "Two young children laugh and play together in a soft indoor ball pit.",
    objectPosition: "center 40%",
    caption: "Attachment, routine, and soft transitions for the youngest children.",
  },
  programsToddlers: {
    src: "/marketing/uniforms-playtime.jpg",
    alt: "Toddlers in matching uniforms play and explore in a bright classroom.",
    objectPosition: "center 40%",
    caption: "Language, movement, and confident exploration inside a steady rhythm.",
  },
  programsPreschool: {
    src: "/marketing/girl-raising-hand.jpg",
    alt: "A young girl smiles and raises her hand in a bright preschool classroom.",
    objectPosition: "center 40%",
    caption: "Projects, storytelling, and collaborative learning that still feels calm.",
  },
  aboutStory: {
    src: "/marketing/painting-trio.jpg",
    alt: "A teacher works with two young children at a painting and drawing table.",
    objectPosition: "center 40%",
    caption: "Rooms should feel settled, relational, and easy for families to trust.",
  },
  tuitionStory: {
    src: "/marketing/letter-card-laptop.jpg",
    alt: "A young girl studies an alphabet card on the floor of a warm reading corner.",
    objectPosition: "center 40%",
    caption: "Transparent pricing works best when it is tied to a real care environment.",
  },
  formStory: {
    src: "/marketing/portrait-with-books.jpg",
    alt: "A young girl rests her chin on a stack of schoolbooks against an orange wall.",
    objectPosition: "center 40%",
    caption: "The first next step should feel clear, calm, and well supported.",
  },
  contactStory: {
    src: "/marketing/green-craft.jpg",
    alt: "A teacher kneels beside a young child working on a green craft project.",
    objectPosition: "center 40%",
    caption: "Families often need one clear point of contact, not a maze of forms.",
  },
} satisfies Record<string, MarketingMediaAsset>

export const programDetails: ProgramDetail[] = [
  {
    id: "infants",
    name: "Infants",
    ageRange: "6 weeks - 15 months",
    schedule: "Calm, responsive care with personalized rhythms",
    summary: "Low-ratio care focused on attachment, routines, and gentle developmental support.",
    overview:
      "Infant care centers on secure attachment, responsive routines, and close communication with families. Feeding, rest, and soothing rhythms are recorded with enough detail to feel reassuring, not overwhelming.",
    learningFocus:
      "Early sensory exploration, language-rich caregiving, and physical comfort guide the day while each child moves at their own pace.",
    dailyRhythm: [
      "Individualized feeding, rest, and comfort notes throughout the day",
      "Floor time, songs, books, and sensory play in short, calm cycles",
      "Predictable handoffs so parents know how the day felt, not just what happened",
    ],
    careHighlights: [
      "Low ratios and consistent caregivers",
      "Daily parent updates with routines, naps, and gentle milestones",
      "Quiet transitions designed around infant cues rather than a rigid class clock",
    ],
    environmentNote:
      "Rooms are soft, orderly, and grounded in natural textures so the environment feels settled rather than overstimulating.",
    featuredMoments: ["morning welcome", "bottle and cuddle rhythms", "gentle outdoor air when weather allows"],
  },
  {
    id: "toddlers",
    name: "Toddlers",
    ageRange: "15 months - 3 years",
    schedule: "Language, movement, and steady transitions",
    summary: "Warm guidance and purposeful play for children learning independence and confidence.",
    overview:
      "Toddler classrooms balance exploration with consistency. Children are encouraged to move, speak, try, and reset inside a structure that keeps the day steady and clear.",
    learningFocus:
      "Language development, early problem solving, self-help routines, and social-emotional coaching are woven into play, meals, and transitions.",
    dailyRhythm: [
      "Open-ended invitations for sensory play, music, and movement",
      "Teacher-guided transitions that keep the room calm and predictable",
      "Rest, meals, and toileting support handled with respect and consistency",
    ],
    careHighlights: [
      "Clear routines for children who are building confidence",
      "Staff language that supports feelings, boundaries, and independence",
      "Frequent communication around naps, meals, and notable moments",
    ],
    environmentNote:
      "The room is designed for active bodies without feeling chaotic, with clear zones for movement, messy play, quiet books, and rest.",
    featuredMoments: ["small-group art", "outdoor gross motor play", "storybook reset after lunch"],
  },
  {
    id: "preschool",
    name: "Preschool",
    ageRange: "3 - 5 years",
    schedule: "Project-led days with readiness built into play",
    summary: "Curious, creative classrooms that build social confidence and school-readiness foundations.",
    overview:
      "Preschool days combine project work, storytelling, outdoor play, and classroom routines that help children become confident, capable participants in a group setting.",
    learningFocus:
      "Pre-literacy, early math thinking, collaborative play, and self-expression are built into meaningful classroom experiences instead of isolated drills.",
    dailyRhythm: [
      "Morning meeting, project invitations, and child-led discovery",
      "Shared routines that build confidence with transitions and classroom jobs",
      "Afternoon reflection with art, books, and family-ready updates",
    ],
    careHighlights: [
      "Purposeful preparation for kindergarten without pushing academics too early",
      "Teacher observations shared in a parent-friendly voice",
      "A calm schedule that leaves room for curiosity and social growth",
    ],
    environmentNote:
      "Classrooms feel bright, orderly, and expressive, with materials children can return to independently and spaces that support both focus and collaboration.",
    featuredMoments: ["project tables", "garden exploration", "peer problem solving"],
  },
]

export const programSummaries: ProgramSummary[] = programDetails.map(
  ({ id, name, ageRange, schedule, summary }) => ({
    id,
    name,
    ageRange,
    schedule,
    summary,
  })
)

export const valuePillars: ValuePillar[] = [
  {
    title: "Children feel known",
    description:
      "Care starts with noticing temperament, rhythms, and comfort needs so each child can settle in with confidence.",
    points: [
      "Warm handoffs at drop-off and pickup",
      "Teachers communicate in a clear, human voice",
      "Routines support regulation instead of rushing children through the day",
    ],
  },
  {
    title: "Families stay grounded",
    description:
      "Families should not have to guess what the next step is. Clear language matters as much as warm care.",
    points: [
      "Direct parent account setup without a long intake funnel",
      "Enrollment, waitlist, and payment steps explained in plain language",
      "Receipts and approval status kept visible in one small portal",
    ],
  },
  {
    title: "Operations stay clear",
    description:
      "Behind the scenes, the system supports clear enrollment review and payment follow-through without a bloated admin surface.",
    points: [
      "Submitted enrollments and payment state are reviewed in one place",
      "Parent-facing steps match the admin workflow instead of drifting apart",
      "Design choices favor clarity over visual noise or extra process",
    ],
  },
]

export const trustPoints: TrustPoint[] = [
  {
    title: "Safety is visible, not buried",
    description: "Families should understand how care is run before they ever submit a form.",
    detail:
      "Licensing readiness, secure pickup routines, medication and allergy notes, and classroom communication standards are framed clearly across the site.",
  },
  {
    title: "Communication stays measured",
    description: "Parents want confidence, not a flood of notifications.",
    detail:
      "Enrollment, payment, and follow-up messages stay calm, specific, and easy to act on.",
  },
  {
    title: "Routines support real family life",
    description: "A premium daycare experience should make daily logistics feel easier.",
    detail:
      "Programs, tuition, waitlist expectations, and next steps are explained directly so families can decide without guessing.",
  },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      "The first thing we noticed was how calm the classrooms felt. We were never left wondering how our daughter was doing or who to talk to.",
    parentName: "Maya and Jordan P.",
    childStage: "Toddler family",
    tenure: "Family since 2024",
  },
  {
    quote:
      "The updates are thoughtful without being overwhelming. We get the information we need, and it always feels like the staff really know our son.",
    parentName: "Claire T.",
    childStage: "Infant family",
    tenure: "Family since 2025",
  },
  {
    quote:
      "Tuition, paperwork, and communication were handled clearly from the start. That level of organization built a lot of trust for us.",
    parentName: "Rafael and Nina K.",
    childStage: "Preschool family",
    tenure: "Family since 2023",
  },
]

export const galleryMoments: GalleryMoment[] = [
  {
    title: "Soft starts in the infant room",
    description:
      "Morning care begins with quiet greetings, personal routines, and spaces that help babies settle in gradually.",
    timeframe: "8:00 AM",
  },
  {
    title: "Purposeful movement for toddlers",
    description:
      "The middle of the day makes room for music, sensory play, outdoor time, and transitions that do not feel abrupt.",
    timeframe: "10:30 AM",
  },
  {
    title: "Project work in preschool",
    description:
      "Children rotate between storytelling, materials-based exploration, and small-group collaboration with teachers nearby.",
    timeframe: "1:15 PM",
  },
]

export const tuitionTiers: TuitionTier[] = [
  {
    name: "Full-Time Care",
    cadence: "5 days per week",
    amount: "₦2,280 / month",
    blurb: "Best for families who need consistency, early drop-off flexibility, and stable weekly routines.",
    includes: [
      "Daily care, meals, and classroom materials",
      "Parent communication and daily reporting",
      "Family conferences and developmental check-ins",
    ],
    note: "Limited early drop-off spaces are prioritized for full-time families.",
  },
  {
    name: "Part-Time Care",
    cadence: "3 days per week",
    amount: "₦1,520 / month",
    blurb: "Flexible weekly care for families balancing home days, work shifts, or part-time schedules.",
    includes: [
      "Consistent classroom placement on scheduled days",
      "Daily updates and parent communication",
      "Program materials and meals during attendance days",
    ],
    note: "Schedules are fixed by semester to preserve classroom continuity.",
  },
  {
    name: "Preschool Enrichment",
    cadence: "Morning schedule",
    amount: "₦980 / month",
    blurb: "A lighter schedule with project time, social routines, and thoughtful transition support.",
    includes: [
      "Morning preschool curriculum and project work",
      "Outdoor play and classroom materials",
      "Communication on classroom rhythms and milestones",
    ],
    note: "Families may request priority placement into a longer preschool schedule when availability opens.",
  },
]

export const faqGroups: FaqGroup[] = [
  {
    id: "programs",
    title: "Programs and classroom experience",
    description: "The questions families ask when they are deciding whether the day-to-day environment feels right.",
    items: [
      {
        question: "How are classrooms grouped?",
        answer:
          "Children are grouped by developmental stage so routines, materials, and teacher support match the needs of the room rather than forcing one pace across the whole school.",
      },
      {
        question: "What does a typical day look like?",
        answer:
          "Each classroom follows a predictable rhythm for arrival, meals, rest, outdoor time, play, and guided activities. The structure is consistent, but teachers still respond to each group and child.",
      },
      {
        question: "How do you prepare preschoolers for kindergarten?",
        answer:
          "We build readiness through routines, language, projects, early math thinking, and social confidence. We do not push a drill-based classroom model too early.",
      },
    ],
  },
  {
    id: "enrollment",
    title: "Enrollment and next steps",
    description: "What to expect before joining the school community.",
    items: [
      {
        question: "How does enrollment work right now?",
        answer:
          "Parents can create an account directly, complete the enrollment form, and move into payment without needing a separate intake step first.",
      },
      {
        question: "Can we join the waitlist before creating an account?",
        answer:
          "Yes. Families can join the waitlist first if their timing is still moving or they are comparing options before starting enrollment.",
      },
      {
        question: "Do you require an enrollment fee?",
        answer:
          "Final fee structures, deposits, and placement details are confirmed during enrollment review. The site shows sample tuition and a simpler digital workflow, not a final contract.",
      },
    ],
  },
  {
    id: "daily-care",
    title: "Daily care and communication",
    description: "How information is shared once a child is enrolled.",
    items: [
      {
        question: "What kind of updates do parents receive?",
        answer:
          "Families receive concise updates on meals, naps or rest, activities, and care notes, along with any notable highlights or follow-up items from the classroom team.",
      },
      {
        question: "How are allergies and medical notes handled?",
        answer:
          "Medical information, allergies, and pickup permissions are documented clearly and reviewed as part of the enrollment process so staff have dependable, current information.",
      },
      {
        question: "Will parents be able to message staff online?",
        answer:
          "Not in the current simplified portal. Right now parent accounts focus on enrollment progress, payment status, and receipt history.",
      },
    ],
  },
  {
    id: "tuition",
    title: "Tuition and scheduling",
    description: "The practical questions that help families plan.",
    items: [
      {
        question: "Is tuition shown clearly?",
        answer:
          "Yes. We believe families should understand schedule options and pricing context before they book time or fill out longer forms.",
      },
      {
        question: "Do you offer part-time schedules?",
        answer:
          "Yes. Availability depends on classroom balance, but we support full-time, select part-time schedules, and a lighter preschool-enrichment option.",
      },
      {
        question: "When should we ask about start dates?",
        answer:
          "The earlier the better. Waitlist and enrollment details both include start timing so we can set expectations early and follow up with the right next step.",
      },
    ],
  },
]

export const faqPreview = faqGroups.flatMap((group) => group.items).slice(0, 3)

export const contactMethods: ContactMethod[] = [
  {
    label: "Call the school",
    value: brandConfig.phone,
    href: `tel:${brandConfig.phone}`,
    description: "Best for quick availability questions or same-week enrollment follow-up.",
  },
  {
    label: "Email the team",
    value: brandConfig.supportEmail,
    href: `mailto:${brandConfig.supportEmail}`,
    description: "Use email for program questions, enrollment follow-up, or document-related requests.",
  },
  {
    label: "Visit us",
    value: brandConfig.address,
    href: "https://maps.google.com/?q=194+Harbor+Lane+Brookline+MA+02445",
    description: "Located in a quiet Brookline neighborhood with easy arrival and pickup flow.",
  },
]

export const homePageContent = {
  metadata: {
    title: "Home",
    description:
      "A simple Ambassadors Care experience for parent signup, enrollment, payments, and lightweight admin review.",
    pathname: "/",
  } satisfies SiteMetadata,
  eyebrow: "Ambassadors Care",
  title: "Enrollment and payments, without the oversized portal.",
  description:
    "Ambassadors Care gives parents a direct path: create an account, complete enrollment, pay online, and track approval. Admins can review submissions, confirm payment, and approve families in one lightweight workflow.",
  reassuranceStats: [
    { label: "Parent setup", value: "sign up and go straight to enrollment" },
    { label: "Enrollment status", value: "track submitted vs approved" },
    { label: "Payments", value: "see status and receipts in one place" },
  ],
  highlights: [
    {
      title: "Create a parent account",
      description: "Parents can sign up directly and move straight into the enrollment form.",
      href: "/signup/parent",
      label: "Create account",
    },
    {
      title: "Submit enrollment details",
      description: "The portal keeps the enrollment step focused instead of burying it inside a larger dashboard.",
      href: "/login/parent",
      label: "View parent portal",
    },
    {
      title: "Pay and keep receipts",
      description: "Payment status, balances, and receipt history stay visible after sign-in.",
      href: "/login/parent",
      label: "See payment flow",
    },
  ],
  workflowSteps: [
    {
      title: "Create an account",
      description: "Parents sign up once and land directly in the enrollment flow.",
    },
    {
      title: "Complete enrollment",
      description: "Child and family details are submitted through one focused form.",
    },
    {
      title: "Handle payment online",
      description: "Families can review payment status, pay, and come back for receipt history later.",
    },
    {
      title: "Admin review stays simple",
      description: "Admins confirm payment, review the submission, and approve manually without a heavier ops dashboard.",
    },
  ],
  rolePanels: [
    {
      eyebrow: "Parent portal",
      title: "A smaller family account focused on the real tasks.",
      description:
        "Parents only see the steps they need right now: enrollment status, payment status, and receipt history.",
      points: [
        "Direct sign up and login",
        "Enrollment status at a glance",
        "Payment status and receipt history",
      ],
      href: "/login/parent",
      label: "Parent login",
    },
    {
      eyebrow: "Admin review",
      title: "A lightweight approval workflow for staff.",
      description:
        "Admins can review submitted enrollments, see whether a family has paid, and mark enrollment approved manually.",
      points: [
        "Submitted enrollments in one place",
        "Payment visibility alongside each family",
        "Manual approval without extra modules",
      ],
      href: "/login/admin",
      label: "Admin login",
    },
  ],
  faqItems: [
    {
      question: "What can parents do today?",
      answer:
        "Create an account, complete enrollment, pay online, and check receipt or approval status from the parent portal.",
    },
    {
      question: "What can admins do today?",
      answer:
        "Review submitted enrollments, confirm whether payment has been made, and approve enrollment manually.",
    },
    {
      question: "If we are not ready to enroll, what should we do?",
      answer:
        "Use the waitlist or contact form first. Those are the calmer public entry points for families who are still comparing timing or program fit.",
    },
  ],
  heroTrustPoints: [
    "Families should see the real next step immediately instead of landing in a generic marketing funnel.",
    "The public site, parent portal, and admin review flow are designed around the same smaller product promise.",
    "Clarity matters most when a family is deciding whether to create an account, submit enrollment, or pay.",
  ],
  overviewBlurb:
    "The public site is designed to answer the questions families actually have right now: how to start, what the parent portal does, what happens after payment, and how the admin side reviews enrollment.",
}

export const programsPageContent = {
  metadata: {
    title: "Programs",
    description:
      "Explore infant, toddler, and preschool programs built around warm routines, clear communication, and child-led development.",
    pathname: "/programs",
  } satisfies SiteMetadata,
  eyebrow: "Programs",
  title: "Programs that match each stage without losing the calm feel families need.",
  description:
    "Every classroom has its own rhythm, but the through-line stays the same: secure relationships, predictable routines, and communication that gives parents real confidence.",
  dailyRhythmHighlights: [
    "Predictable arrival, meal, rest, and outdoor windows",
    "Age-appropriate materials that support curiosity without overstimulation",
    "Teacher updates shaped for parents, not internal jargon",
  ],
}

export const aboutPageContent = {
  metadata: {
    title: "About",
    description:
      "Learn about the caregiving philosophy, communication standards, and lighter enrollment experience behind Ambassadors Care.",
    pathname: "/about",
  } satisfies SiteMetadata,
  eyebrow: "About Ambassadors Care",
  title: "A daycare experience designed to feel steady, personal, and deeply trustworthy.",
  description:
    "Families should feel the values of a school in the smallest details: how the room is set up, how transitions are handled, how notes are written, and how clearly next steps are explained.",
}

export const tuitionPageContent = {
  metadata: {
    title: "Tuition",
    description:
      "Transparent sample tuition tiers with schedule context, what is included, and clear next-step guidance for families.",
    pathname: "/tuition",
  } satisfies SiteMetadata,
  eyebrow: "Transparent tuition",
  title: "Pricing explained with context, not pressure.",
  description:
    "Families should be able to understand schedule options, monthly tuition, and what is included before starting enrollment. The goal is clarity, not a hard sell.",
  policies: [
    "Sample pricing is shown for planning and early conversations.",
    "Availability and final placement depend on classroom openings and schedule fit.",
    "Contacting the school or joining the waitlist is the fastest way to get program-specific guidance.",
  ],
}

export const faqPageContent = {
  metadata: {
    title: "FAQ",
    description:
      "Answers to common parent questions about programs, enrollment, daily care, tuition, and family communication.",
    pathname: "/faq",
  } satisfies SiteMetadata,
  eyebrow: "Frequently asked questions",
  title: "Clear answers for the practical questions families ask most.",
  description:
    "We organize questions by what parents are actually deciding: how the classroom feels, how enrollment works, how daily care is communicated, and what tuition means in practice.",
}

export const contactPageContent = {
  metadata: {
    title: "Contact",
    description:
      "Get in touch with Ambassadors Care for program questions, enrollment follow-up, waitlist planning, or general support.",
    pathname: "/contact",
  } satisfies SiteMetadata,
  eyebrow: "Contact",
  title: "Talk with a team that keeps the process clear and calm.",
  description:
    "Whether you are exploring programs, comparing schedules, or following up on enrollment, we want the next step to feel simple and well supported.",
  hours: [
    "Monday-Friday: 7:30 AM - 5:45 PM",
    "Enrollment and waitlist follow-up handled during school hours",
    "Responses sent within one business day for general inquiries",
  ],
}

export const waitlistPageContent = {
  metadata: {
    title: "Join the Waitlist",
    description:
      "Join the daycare waitlist with your child details, schedule needs, and expected start timing so follow-up can stay organized and realistic.",
    pathname: "/waitlist",
  } satisfies SiteMetadata,
  eyebrow: "Join the waitlist",
  title: "Share your timing and program needs so we can follow up with clarity.",
  description:
    "The waitlist form helps us understand age range, schedule needs, and likely start timing. It also gives families a lower-friction path when they are planning ahead.",
  expectations: [
    "Joining the waitlist does not guarantee placement, but it helps us plan follow-up responsibly.",
    "Families who share strong timing or classroom-fit details receive more contextual enrollment guidance.",
    "You can still submit the waitlist form even if you are earlier in your search.",
  ],
}

export const loginPageContent = {
  parent: {
    metadata: {
      title: "Parent Login",
      description:
        "Secure parent access for enrollment status, payments, and receipt history.",
      pathname: "/login/parent",
    } satisfies SiteMetadata,
    eyebrow: "Parent portal access",
    title: "A smaller parent portal, focused on enrollment and payment.",
    description:
      "Parents use this space to finish enrollment, review payment status, and keep receipt history in one simple account.",
    highlights: [
      "Create an account or sign in, then submit the enrollment form without a giant dashboard",
      "See whether enrollment is in progress, submitted, or approved",
      "Review payment status and receipt history without digging through extra screens",
    ],
  },
  admin: {
    metadata: {
      title: "Admin Login",
      description:
        "Secure admin access for lightweight enrollment review and manual approval.",
      pathname: "/login/admin",
    } satisfies SiteMetadata,
    eyebrow: "Admin portal access",
    title: "A lightweight admin portal for enrollment review.",
    description:
      "Admins use this space to review submitted enrollments, confirm payment status, and approve families manually.",
    highlights: [
      "See each submitted enrollment alongside whether a parent has paid",
      "Approve enrollment manually without a larger operations dashboard",
      "Keep the admin side small and operational instead of feature-heavy",
    ],
  },
}

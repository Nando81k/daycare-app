export type CustomerMediaOrientation = 'portrait' | 'landscape';
export type CustomerMediaIntent =
  | 'hero'
  | 'teacher-child'
  | 'individual-learning'
  | 'classroom-collaboration'
  | 'safety-guidance'
  | 'guided-problem-solving';

export interface CustomerMediaAsset {
  id: string;
  src: string;
  alt: string;
  orientation: CustomerMediaOrientation;
  intent: CustomerMediaIntent;
  focalPoint: string;
}

export const CUSTOMER_MEDIA_ASSETS = {
  teacherGuidancePrimary: {
    id: 'teacherGuidancePrimary',
    src: '/images/classroom/teacher-child-writing-1.webp',
    alt: 'Teacher guiding a young child while writing in a classroom workbook.',
    orientation: 'portrait',
    intent: 'teacher-child',
    focalPoint: 'center 44%',
  },
  teacherGuidanceSecondary: {
    id: 'teacherGuidanceSecondary',
    src: '/images/classroom/teacher-child-writing-2.webp',
    alt: 'Caregiver and child smiling during one-on-one writing activity.',
    orientation: 'portrait',
    intent: 'teacher-child',
    focalPoint: 'center 42%',
  },
  childWritingPortrait: {
    id: 'childWritingPortrait',
    src: '/images/classroom/child-writing-portrait.webp',
    alt: 'Young child focused on writing in a notebook inside a bright classroom.',
    orientation: 'portrait',
    intent: 'individual-learning',
    focalPoint: 'center 40%',
  },
  childReadingPortrait: {
    id: 'childReadingPortrait',
    src: '/images/classroom/girl-reading-portrait.webp',
    alt: 'Young girl smiling while reading in class.',
    orientation: 'portrait',
    intent: 'individual-learning',
    focalPoint: 'center 38%',
  },
  classroomCollaboration: {
    id: 'classroomCollaboration',
    src: '/images/classroom/classroom-group-play.webp',
    alt: 'Children playing and learning together in a classroom setting.',
    orientation: 'landscape',
    intent: 'classroom-collaboration',
    focalPoint: 'center 42%',
  },
  classroomSafetyLesson: {
    id: 'classroomSafetyLesson',
    src: '/images/classroom/classroom-safety-lesson.webp',
    alt: 'Teacher reviewing safety rules with preschool children wearing high-visibility vests.',
    orientation: 'portrait',
    intent: 'safety-guidance',
    focalPoint: 'center 42%',
  },
  teacherPuzzleActivity: {
    id: 'teacherPuzzleActivity',
    src: '/images/classroom/teacher-puzzle-activity.webp',
    alt: 'Teacher helping two young children with puzzle and writing activities in a classroom.',
    orientation: 'portrait',
    intent: 'guided-problem-solving',
    focalPoint: 'center 44%',
  },
} as const satisfies Record<string, CustomerMediaAsset>;

export type CustomerMediaAssetKey = keyof typeof CUSTOMER_MEDIA_ASSETS;

export interface CustomerMediaSlot {
  asset: CustomerMediaAssetKey;
  caption: string;
  usage: 'hero' | 'support' | 'gallery' | 'auth' | 'band';
  sizes: string;
  priority?: boolean;
}

export const CUSTOMER_MEDIA_SLOTS = {
  homeHero: {
    asset: 'teacherGuidancePrimary',
    caption: 'Teacher-led learning moments with warmth and structure.',
    usage: 'hero',
    sizes: '(max-width: 1024px) 100vw, 48vw',
    priority: true,
  },
  homeSupport: {
    asset: 'classroomCollaboration',
    caption: 'Group activities that build confidence, social skills, and curiosity.',
    usage: 'support',
    sizes: '(max-width: 1024px) 100vw, 44vw',
  },
  homeFeatureA: {
    asset: 'teacherGuidanceSecondary',
    caption: 'Guided writing and early literacy support.',
    usage: 'gallery',
    sizes: '(max-width: 1024px) 100vw, 33vw',
  },
  homeFeatureB: {
    asset: 'childWritingPortrait',
    caption: 'Focused independent work in a calm classroom environment.',
    usage: 'gallery',
    sizes: '(max-width: 1024px) 100vw, 33vw',
  },
  homeFeatureC: {
    asset: 'childReadingPortrait',
    caption: 'Positive learning experiences designed for confidence.',
    usage: 'gallery',
    sizes: '(max-width: 1024px) 100vw, 33vw',
  },
  homeSupportBand: {
    asset: 'classroomSafetyLesson',
    caption: 'Educators reinforce safety expectations through age-appropriate coaching and repetition.',
    usage: 'band',
    sizes: '100vw',
  },
  homeSupportDetail: {
    asset: 'teacherPuzzleActivity',
    caption: 'Small-group guidance builds communication, attention span, and early problem-solving skills.',
    usage: 'support',
    sizes: '(max-width: 1024px) 100vw, 46vw',
  },
  aboutHero: {
    asset: 'teacherGuidanceSecondary',
    caption: 'Purposeful care rooted in trust, routine, and communication.',
    usage: 'hero',
    sizes: '(max-width: 1024px) 100vw, 46vw',
  },
  programsHero: {
    asset: 'classroomCollaboration',
    caption: 'Age-based classrooms with intentional daily rhythm.',
    usage: 'hero',
    sizes: '100vw',
  },
  safetyHero: {
    asset: 'childWritingPortrait',
    caption: 'Consistent supervision and child-first care standards.',
    usage: 'hero',
    sizes: '100vw',
  },
  galleryLead: {
    asset: 'classroomCollaboration',
    caption: 'Classroom collaboration and joyful play.',
    usage: 'hero',
    sizes: '100vw',
    priority: true,
  },
  contactHero: {
    asset: 'teacherGuidancePrimary',
    caption: 'Talk with admissions and get clear next steps for enrollment.',
    usage: 'hero',
    sizes: '(max-width: 1024px) 100vw, 44vw',
  },
  faqHero: {
    asset: 'childReadingPortrait',
    caption: 'Quick answers for enrollment, programs, and family onboarding.',
    usage: 'hero',
    sizes: '100vw',
  },
  loginPanel: {
    asset: 'teacherGuidancePrimary',
    caption: 'Secure family access to admissions and billing updates.',
    usage: 'auth',
    sizes: '(max-width: 1024px) 100vw, 42vw',
  },
  registerPanel: {
    asset: 'teacherGuidanceSecondary',
    caption: 'Start enrollment with a guided and transparent process.',
    usage: 'auth',
    sizes: '(max-width: 1024px) 100vw, 42vw',
  },
} as const satisfies Record<string, CustomerMediaSlot>;

export function resolveCustomerMediaSlot(slot: keyof typeof CUSTOMER_MEDIA_SLOTS) {
  const config = CUSTOMER_MEDIA_SLOTS[slot];
  const media = CUSTOMER_MEDIA_ASSETS[config.asset];
  return {
    ...config,
    media,
  };
}

export const CUSTOMER_MEDIA_GALLERY_ORDER: CustomerMediaAssetKey[] = [
  'classroomCollaboration',
  'classroomSafetyLesson',
  'teacherGuidancePrimary',
  'teacherGuidanceSecondary',
  'teacherPuzzleActivity',
  'childWritingPortrait',
  'childReadingPortrait',
];

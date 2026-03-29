import type { LucideIcon } from 'lucide-react';
import { BookOpenCheck, HeartHandshake, MessageSquare, ShieldCheck, Sparkles, Wallet } from 'lucide-react';

export interface PublicNavItem {
  href: string;
  label: string;
}

export interface FeatureHighlight {
  title: string;
  summary: string;
  detail?: string;
  icon?: LucideIcon;
}

export interface TrustPill {
  title: string;
}

export interface TestimonialItem {
  quote: string;
  parentName: string;
  childContext: string;
}

export interface StaffProfileItem {
  name: string;
  role: string;
  focus: string;
  bio: string;
}

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/safety', label: 'Safety' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export const HOME_FEATURES: FeatureHighlight[] = [
  {
    title: 'Curriculum with real structure',
    summary: 'Age-based plans blend early literacy, numeracy, movement, and guided play in a balanced daily rhythm.',
    detail: 'Families understand what children are learning each week and how classrooms support development goals.',
    icon: BookOpenCheck,
  },
  {
    title: 'Warm supervision standards',
    summary: 'Children move through the day with close supervision, predictable transitions, and documented handoff procedures.',
    detail: 'Pickup authorization, emergency details, and classroom transitions are consistently reinforced by staff.',
    icon: ShieldCheck,
  },
  {
    title: 'Clear family communication',
    summary: 'Parents receive practical updates during admissions, onboarding, and routine family support touchpoints.',
    detail: 'You always know your status, required actions, and who to contact when questions come up.',
    icon: MessageSquare,
  },
  {
    title: 'Straightforward tuition guidance',
    summary: 'Billing expectations are explained early so families can plan with confidence before first-day onboarding.',
    detail: 'Payment steps and due-date expectations stay visible throughout enrollment and active attendance.',
    icon: Wallet,
  },
];

export const HOME_TRUST_PILLS: TrustPill[] = [
  { title: 'Ages 6 weeks to 5 years' },
  { title: 'Mon-Fri full-day schedule' },
  { title: 'Structured admissions process' },
  { title: 'Parent-first communication' },
];

export const HOME_TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'From the first call, everything felt organized and caring. We always knew what was needed next, and our child settled in quickly.',
    parentName: 'Aisha O.',
    childContext: 'Parent of Preschool Classroom child',
  },
  {
    quote:
      'The teachers are warm, and the routines are clear. We feel confident each morning because communication is consistent and practical.',
    parentName: 'Daniel E.',
    childContext: 'Parent of Toddler Classroom child',
  },
  {
    quote:
      'Admissions and onboarding were straightforward. The team explained everything clearly, and billing expectations were transparent from day one.',
    parentName: 'Mariam A.',
    childContext: 'Parent of Pre-K Classroom child',
  },
];

export const HOME_STAFF: StaffProfileItem[] = [
  {
    name: 'Grace Omoregie',
    role: 'Lead Early Learning Educator',
    focus: 'Literacy foundations and confidence-building classroom routines',
    bio: 'Grace leads guided reading and writing practice with calm, patient instruction tailored to each age band.',
  },
  {
    name: 'Chidinma I.',
    role: 'Family and Admissions Coordinator',
    focus: 'Enrollment clarity and parent onboarding support',
    bio: 'Chidinma supports families from first inquiry through placement confirmation and first-day readiness planning.',
  },
  {
    name: 'Samuel A.',
    role: 'Classroom Operations Supervisor',
    focus: 'Safety consistency, transitions, and daily supervision standards',
    bio: 'Samuel oversees classroom flow and helps teams keep procedures dependable, safe, and child-centered each day.',
  },
];

export const PROGRAM_SNAPSHOT: FeatureHighlight[] = [
  {
    title: 'Infant Care · 6 weeks - 12 months',
    summary: 'Attachment-focused care, sensory exploration, feeding consistency, and supervised rest routines.',
  },
  {
    title: 'Toddler Care · 12 months - 3 years',
    summary: 'Language growth, social learning, and guided discovery through predictable daily structure.',
  },
  {
    title: 'Preschool · 3 - 4 years',
    summary: 'Early literacy, numeracy, and collaborative classroom activities that build independence.',
  },
  {
    title: 'Pre-K · 4 - 5 years',
    summary: 'Kindergarten-readiness routines with stronger focus, confidence, and classroom responsibility.',
  },
];

export const SAFETY_STANDARDS: FeatureHighlight[] = [
  {
    title: 'Daily wellness and hygiene routines',
    summary: 'Arrival checks, sanitation cycles, and classroom cleanliness standards are applied consistently.',
    icon: ShieldCheck,
  },
  {
    title: 'Controlled handoff procedures',
    summary: 'Authorized pickup lists and departure verification keep family transitions clear and secure.',
    icon: HeartHandshake,
  },
  {
    title: 'Emergency readiness protocols',
    summary: 'Emergency contacts, response steps, and escalation paths are documented and reviewed regularly.',
    icon: Sparkles,
  },
];

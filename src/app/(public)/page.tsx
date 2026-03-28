import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, FileText, MessageSquare, ShieldCheck, Wallet } from 'lucide-react';
import { BRAND } from '@/lib/branding';
import { Button, Section } from '@/components/ui';
import { CinematicReveal, CinematicStagger, HoverLift, ParallaxBlock } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

const CAPABILITIES = [
  {
    title: 'Curriculum support by age band',
    summary:
      'Infant, toddler, preschool, and pre-k classrooms follow structured daily plans that blend literacy, numeracy, music, movement, and guided play.',
    detail:
      'Families receive clear expectations for what children are practicing each week, including classroom goals and social development focus.',
    icon: FileText,
  },
  {
    title: 'Supervision with clear standards',
    summary:
      'Children move through the day with close educator supervision, predictable routines, and documented transitions between learning, meals, rest, and play.',
    detail:
      'Pickup authorization, classroom handoffs, and safety expectations are kept explicit so parents know how supervision is handled in practice.',
    icon: ShieldCheck,
  },
  {
    title: 'Parent communication you can rely on',
    summary:
      'Admissions and family support communication stays consistent from first inquiry through placement confirmation and first-week onboarding.',
    detail:
      'Parents know where their enrollment stands, what action is needed next, and who to contact whenever they need clarification.',
    icon: MessageSquare,
  },
  {
    title: 'Billing clarity from the start',
    summary:
      'Tuition conversations are handled early, with straightforward guidance on due dates, payment flow, and account requirements.',
    detail:
      'We avoid billing surprises by confirming family responsibilities before start day and keeping payment expectations visible.',
    icon: Wallet,
  },
] as const;

const JOURNEY = [
  {
    title: 'Step 1: Program fit and admissions check',
    youProvide:
      'Child date of birth, preferred start period, weekly attendance pattern, and any early health or allergy notes that could affect placement.',
    parentAction: 'Submit your inquiry details and confirm preferred contact method for admissions follow-up.',
    outcome:
      'Our team confirms age-group fit, explains current availability, and sends a practical checklist for the next step.',
  },
  {
    title: 'Step 2: Enrollment profile and required records',
    youProvide:
      'Emergency contacts, authorized pickup list, medical/allergy information, and any required child documents requested during onboarding.',
    parentAction:
      'Complete the enrollment profile accurately and review policy acknowledgements before final submission.',
    outcome:
      'Your file moves into admissions review with clear visibility into what has been received and what is still pending.',
  },
  {
    title: 'Step 3: Placement confirmation and first-day prep',
    youProvide:
      'Final schedule confirmation and any classroom readiness details for your child, such as comfort items or transition notes.',
    parentAction: 'Confirm offer details and follow the pre-start instructions shared by admissions.',
    outcome:
      'You receive first-day guidance, orientation expectations, and a direct point of contact for opening-week questions.',
  },
] as const;

const HERO = resolveCustomerMediaSlot('homeHero');
const SUPPORT = resolveCustomerMediaSlot('homeSupport');
const FEATURE_A = resolveCustomerMediaSlot('homeFeatureA');
const FEATURE_B = resolveCustomerMediaSlot('homeFeatureB');
const FEATURE_C = resolveCustomerMediaSlot('homeFeatureC');
const SUPPORT_BAND = resolveCustomerMediaSlot('homeSupportBand');
const SUPPORT_DETAIL = resolveCustomerMediaSlot('homeSupportDetail');

const HIGHLIGHTS = [
  {
    slot: FEATURE_A,
    title: 'Guided literacy and writing support',
    description:
      'One-on-one educator guidance helps children connect sounds, letters, and early writing habits while building confidence.',
  },
  {
    slot: FEATURE_B,
    title: 'Independent focus in calm classrooms',
    description:
      'Children practice attention, task completion, and self-expression through structured independent work with teacher check-ins.',
  },
  {
    slot: FEATURE_C,
    title: 'Positive reading and language exposure',
    description:
      'Daily reading moments strengthen vocabulary, listening, and early comprehension in ways children enjoy and repeat.',
  },
  {
    slot: SUPPORT,
    title: 'Collaborative play with close supervision',
    description:
      'Group activities reinforce turn-taking, communication, and social learning while educators actively monitor interaction quality.',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Section className="product-stage relative !py-0">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBlock className="absolute inset-0" distance={90}>
            <Image
              src={HERO.media.src}
              alt={HERO.media.alt}
              fill
              priority
              className="object-cover scale-[1.06]"
              style={{ objectPosition: HERO.media.focalPoint }}
              sizes="100vw"
            />
          </ParallaxBlock>
          <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(3,16,34,0.92)_0%,rgba(5,24,50,0.82)_38%,rgba(8,40,78,0.74)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[90svh] items-end">
          <div className="w-full px-4 pb-10 pt-24 sm:px-6 xl:px-8">
            <div className="mx-auto max-w-[1320px]">
              <CinematicReveal>
                <p className="product-eyebrow text-primary-100">{BRAND.name}</p>
                <h1 className="mt-3 max-w-[14ch] font-display text-[clamp(2.2rem,6.8vw,5.2rem)] leading-[1.04] text-white">
                  Professional childcare, with clarity at every step.
                </h1>
                <p className="mt-4 max-w-[64ch] text-lg leading-relaxed text-[#f0f7ff] sm:text-xl">
                  Ages 6 weeks to 5 years. Structured learning, trusted supervision, and consistent parent communication from
                  first inquiry to first day.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link href="/register">
                    <Button size="lg" className="px-8 sm:px-9" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Start Enrollment
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="border-white/45 bg-white/8 px-8 text-white hover:bg-white/20 sm:px-9">
                      Talk to Admissions
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 text-base">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/16 px-3 py-1.5 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" /> Ages 6 weeks to 5 years
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/16 px-3 py-1.5 text-sm font-semibold text-white">
                    <Clock3 className="h-4 w-4" /> Open {BRAND.hours}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/16 px-3 py-1.5 text-sm font-semibold text-white">
                    <MessageSquare className="h-4 w-4" /> Parent updates at every admission stage
                  </span>
                </div>
              </CinematicReveal>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12 md:py-14">
        <div className="page-wrap">
          <CinematicReveal>
            <div className="mx-auto max-w-4xl">
              <p className="kicker">Why Families Choose Us</p>
              <h2 className="mt-2">A child-first program with operational clarity for parents.</h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-600">
                Families trust us because we pair classroom quality with predictable processes. You get clear expectations
                about care, communication, supervision, and billing before your child starts.
              </p>
            </div>
          </CinematicReveal>

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:[grid-auto-rows:1fr]">
            <CinematicReveal>
              <HoverLift className="product-card flex h-full flex-col justify-between" as="section">
                <p className="text-base font-semibold text-ink-900">What this means in day-to-day family experience</p>
                <ul className="mt-3 space-y-2 text-base leading-relaxed text-ink-600">
                  <li>1. Classroom expectations are explained before your child starts, not after.</li>
                  <li>2. Admissions checklists define exactly what records and details are required.</li>
                  <li>3. Safety and pickup policies are reviewed with families to avoid confusion at handoff times.</li>
                  <li>4. Communication and billing updates stay visible so parents can plan confidently.</li>
                </ul>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Structured by age band
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Daily supervised routines
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Practical parent updates
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Clear tuition expectations
                  </div>
                </div>
              </HoverLift>
            </CinematicReveal>

            <CinematicReveal delay={0.08}>
              <HoverLift className="product-card flex h-full flex-col p-2.5" as="section">
                <ParallaxBlock className="public-image-frame aspect-[16/11]" distance={32}>
                  <Image
                    src={SUPPORT_DETAIL.media.src}
                    alt={SUPPORT_DETAIL.media.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: SUPPORT_DETAIL.media.focalPoint }}
                    sizes={SUPPORT_DETAIL.sizes}
                  />
                  <div className="public-image-overlay" />
                </ParallaxBlock>
                <p className="mt-3 text-base leading-relaxed text-ink-600">{SUPPORT_DETAIL.caption}</p>
              </HoverLift>
            </CinematicReveal>
          </div>

          <CinematicStagger className="mt-4 grid gap-4 md:grid-cols-2 md:[grid-auto-rows:1fr]">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <HoverLift key={item.title} as="article" className="product-card flex h-full flex-col" data-stagger-item>
                  <p className="inline-flex items-center gap-2 text-lg font-semibold text-ink-900">
                    <Icon className="h-4 w-4 text-primary-700" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">{item.summary}</p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">{item.detail}</p>
                </HoverLift>
              );
            })}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="py-12 md:py-14">
        <div className="page-wrap">
          <CinematicReveal>
            <div className="max-w-[58rem] text-left">
              <p className="kicker">Enrollment Journey</p>
              <h2 className="mt-2 max-w-[24ch]">A practical process with clear parent actions at each step.</h2>
              <p className="mt-3 max-w-[64ch] text-base leading-relaxed text-ink-600 md:text-lg">
                Every step includes required inputs, next actions, and a defined outcome so families can move from inquiry
                to confirmed start date without uncertainty.
              </p>
            </div>
          </CinematicReveal>

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:[grid-auto-rows:1fr]">
            <CinematicReveal>
              <HoverLift className="product-card flex h-full flex-col justify-between" as="section">
                <div>
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-ink-900">
                    <CalendarClock className="h-4 w-4 text-primary-700" />
                    Admissions flow at a glance
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">
                    Parents always know what information is needed, who owns the next action, and how each step closes before
                    placement is finalized.
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">
                    After submission, families receive acknowledgement, checklist review, and clear guidance on any missing
                    records. Our team confirms age-group fit, preferred start timing, and readiness details before approval.
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">
                    You can expect straightforward updates throughout review, including when decisions are made, what follow-up
                    is required, and how first-day onboarding will be coordinated.
                  </p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Clear required records
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Defined parent actions
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Status visibility
                  </div>
                  <div className="rounded-field border border-primary-100 bg-bg-soft px-3 py-2 text-sm font-semibold text-ink-800">
                    Start-day readiness
                  </div>
                </div>
              </HoverLift>
            </CinematicReveal>

            <CinematicReveal delay={0.08}>
              <HoverLift className="product-card flex h-full flex-col p-2.5" as="section">
                <ParallaxBlock className="public-image-frame aspect-[16/11]" distance={30}>
                  <Image
                    src={SUPPORT.media.src}
                    alt={SUPPORT.media.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: SUPPORT.media.focalPoint }}
                    sizes={SUPPORT.sizes}
                  />
                  <div className="public-image-overlay" />
                </ParallaxBlock>
                <p className="mt-3 text-base leading-relaxed text-ink-600">{SUPPORT.caption}</p>
              </HoverLift>
            </CinematicReveal>
          </div>

          <CinematicStagger className="mt-4 grid gap-4 lg:grid-cols-3 lg:[grid-auto-rows:1fr]">
            {JOURNEY.map((step) => (
              <HoverLift key={step.title} className="product-card flex h-full flex-col" as="article" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-base font-semibold text-ink-900">
                  <CalendarClock className="h-4 w-4 text-primary-700" />
                  {step.title}
                </p>
                <p className="mt-2 text-base leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-800">You provide:</span> {step.youProvide}
                </p>
                <p className="mt-1.5 text-base leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-800">Parent action:</span> {step.parentAction}
                </p>
                <p className="mt-1.5 text-base leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-800">Result:</span> {step.outcome}
                </p>
              </HoverLift>
            ))}
          </CinematicStagger>

          <CinematicReveal delay={0.06}>
            <HoverLift className="product-card mt-4" as="section">
              <p className="inline-flex items-center gap-2 text-base font-semibold text-ink-900">
                <ShieldCheck className="h-4 w-4 text-primary-700" />
                Preparation and safety details before start day
              </p>
              <ul className="mt-2 grid gap-2 text-base leading-relaxed text-ink-600 md:grid-cols-2">
                <li>1. Confirm allergies, medications, and health notes that affect classroom planning.</li>
                <li>2. Submit authorized pickup names and phone numbers for all approved caregivers.</li>
                <li>3. Provide at least two reliable emergency contacts with up-to-date information.</li>
                <li>4. Review classroom readiness guidance, including daily essentials and transition support.</li>
              </ul>
            </HoverLift>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="bg-[linear-gradient(160deg,#04182f_0%,#07294d_54%,#093a70_100%)] py-12 md:py-14">
        <div className="page-wrap grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:[grid-auto-rows:1fr]">
          <CinematicReveal>
            <HoverLift
              as="section"
              className="flex h-full flex-col justify-between rounded-[0.35rem] border border-white/20 bg-[#031225]/88 p-5"
            >
              <div>
                <p className="kicker text-[#cde4ff]">Safe Daily Routines</p>
                <h2 className="mt-2 max-w-[24ch] text-white">Children learn safety habits through guided classroom practice.</h2>
                <p className="mt-3 text-base leading-relaxed text-[#e8f4ff] md:text-lg">
                  We introduce classroom safety expectations through repetition, modeling, and supervised group activities so
                  children understand boundaries, follow instructions, and feel secure in shared spaces.
                </p>
                <p className="mt-2 text-base leading-relaxed text-[#d8ebff]">
                  {SUPPORT_BAND.caption}
                </p>
              </div>

              <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-[#e8f4ff] sm:grid-cols-2">
                <li className="rounded-field border border-white/18 bg-white/6 px-3 py-2">Consistent supervised transitions</li>
                <li className="rounded-field border border-white/18 bg-white/6 px-3 py-2">Daily reinforcement of safety cues</li>
                <li className="rounded-field border border-white/18 bg-white/6 px-3 py-2">Classroom boundaries explained clearly</li>
                <li className="rounded-field border border-white/18 bg-white/6 px-3 py-2">Confidence through predictable routines</li>
              </ul>
            </HoverLift>
          </CinematicReveal>

          <CinematicReveal delay={0.08}>
            <HoverLift as="section" className="h-full rounded-[0.35rem] border border-white/20 bg-white/6 p-2.5">
              <div className="public-image-frame aspect-[16/10] h-full min-h-[22rem]">
                <Image
                  src={SUPPORT_BAND.media.src}
                  alt={SUPPORT_BAND.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT_BAND.media.focalPoint }}
                  sizes={SUPPORT_BAND.sizes}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,53,0.08)_0%,rgba(4,24,53,0.36)_100%)]" />
              </div>
            </HoverLift>
          </CinematicReveal>
        </div>
      </Section>

      <Section className="border-y border-primary-100/70 bg-white/80 py-12">
        <div className="page-wrap">
          <CinematicReveal>
            <p className="kicker">Classroom Highlights</p>
            <h2 className="mt-2 max-w-[24ch]">Detailed learning moments that show how children grow with us.</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-600 md:text-lg">
              These classroom snapshots reflect our learning style, social development priorities, and hands-on educator support
              throughout the day.
            </p>
          </CinematicReveal>

          <CinematicStagger className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HIGHLIGHTS.map((item) => (
              <HoverLift key={item.title} as="article" className="product-card p-2.5" data-stagger-item>
                <ParallaxBlock className="public-image-frame aspect-[4/3]" distance={24}>
                  <Image
                    src={item.slot.media.src}
                    alt={item.slot.media.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: item.slot.media.focalPoint }}
                    sizes={item.slot.sizes}
                  />
                  <div className="public-image-overlay" />
                </ParallaxBlock>
                <p className="mt-3 text-base font-semibold text-ink-900">{item.title}</p>
                <p className="mt-1.5 text-base leading-relaxed text-ink-600">{item.description}</p>
              </HoverLift>
            ))}
          </CinematicStagger>
        </div>
      </Section>

      <Section className="relative overflow-hidden border-t border-primary-100/80 bg-[linear-gradient(160deg,#04182f_0%,#07294d_54%,#093a70_100%)] py-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(74,145,237,0.25),transparent_40%),radial-gradient(circle_at_84%_88%,rgba(16,77,149,0.42),transparent_52%)]" />
        <div className="page-wrap relative z-10 grid lg:grid-cols-[1.12fr_0.88fr]">
          <CinematicReveal className="border-b border-white/14 py-10 lg:border-b-0 lg:border-r lg:border-white/14 lg:py-14 lg:pr-10">
            <p className="kicker text-[#d7eaff]">Ready to begin?</p>
            <h2 className="mt-3 max-w-[18ch] text-[clamp(2.05rem,4.5vw,3.35rem)] leading-[1.07] text-white">
              Start enrollment with {BRAND.name}.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#e6f2ff] md:text-xl">
              Submit your children&apos;s enrollment details once, and admissions will guide you through review, missing-record
              checks, and first-day readiness with clear status updates.
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <div className="rounded-[0.26rem] border border-white/20 bg-white/10 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#cbe3ff]">Step 1</p>
                <p className="mt-1 text-base font-semibold text-white">Share child details</p>
                <p className="mt-1 text-sm leading-relaxed text-[#dcecff]">
                  Add name, birth date, preferred start date, and program selection.
                </p>
              </div>
              <div className="rounded-[0.26rem] border border-white/20 bg-white/10 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#cbe3ff]">Step 2</p>
                <p className="mt-1 text-base font-semibold text-white">Admissions review</p>
                <p className="mt-1 text-sm leading-relaxed text-[#dcecff]">
                  We verify records, confirm availability, and request any missing information.
                </p>
              </div>
              <div className="rounded-[0.26rem] border border-white/20 bg-white/10 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#cbe3ff]">Step 3</p>
                <p className="mt-1 text-base font-semibold text-white">Prepare first day</p>
                <p className="mt-1 text-sm leading-relaxed text-[#dcecff]">
                  Receive placement guidance, onboarding steps, and your start timeline.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-9 sm:px-11">
                  Start Enrollment
                </Button>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-1.5 text-base font-semibold text-white/95 hover:text-white">
                Contact admissions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#cfe4ff]">
              Ages 6 weeks to 5 years. Open {BRAND.hours}.
            </p>
          </CinematicReveal>

          <CinematicReveal delay={0.1} className="py-8 lg:py-10 lg:pl-10">
            <HoverLift as="section" className="rounded-[0.3rem] border border-white/20 bg-[#031225]/68 p-3 sm:p-4">
              <ParallaxBlock className="public-image-frame aspect-[16/11]" distance={26}>
                <Image
                  src={SUPPORT.media.src}
                  alt={SUPPORT.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: SUPPORT.media.focalPoint }}
                  sizes={SUPPORT.sizes}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,13,27,0.08)_0%,rgba(2,13,27,0.4)_100%)]" />
              </ParallaxBlock>

              <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[0.2rem] border border-white/20 bg-white/8 px-3 py-2 text-sm font-semibold text-[#e6f3ff]">
                  Transparent admissions updates
                </div>
                <div className="rounded-[0.2rem] border border-white/20 bg-white/8 px-3 py-2 text-sm font-semibold text-[#e6f3ff]">
                  Multi-child enrollment support
                </div>
                <div className="rounded-[0.2rem] border border-white/20 bg-white/8 px-3 py-2 text-sm font-semibold text-[#e6f3ff]">
                  Safety and contact readiness review
                </div>
                <div className="rounded-[0.2rem] border border-white/20 bg-white/8 px-3 py-2 text-sm font-semibold text-[#e6f3ff]">
                  Tuition setup guidance after approval
                </div>
              </div>
            </HoverLift>
          </CinematicReveal>
        </div>
      </Section>
    </>
  );
}

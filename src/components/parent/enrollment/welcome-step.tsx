"use client"

import { motion } from "motion/react"
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const highlights = [
  {
    icon: Clock3,
    title: "10-minute application",
    text: "A simple guided flow with progress saved automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Secure submission",
    text: "Your family information stays protected throughout the process.",
  },
  {
    icon: BadgeCheck,
    title: "Easy to complete",
    text: "Clear steps, friendly language, and a full review before submit.",
  },
]

const checklist = [
  "Birth certificate or proof of age",
  "Up-to-date immunization records",
  "Two forms of guardian ID",
  "Emergency contact information",
  "Physician / pediatrician info",
  "Signed enrollment agreement",
]

export type WelcomeStepProps = {
  onBegin: () => void
}

export function WelcomeStep({ onBegin }: WelcomeStepProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full"
      >
        <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-teal-200/45 blur-3xl" />
        <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />

        <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400" />

          <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.35 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
              >
                <Sparkles className="h-4 w-4" />
                New family enrollment
              </motion.div>

              <div className="mb-8 max-w-2xl">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-teal-100 shadow-inner ring-1 ring-teal-100">
                  <Sparkles className="h-8 w-8 text-sky-500" />
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Enroll your child with confidence
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                  A guided, parent-friendly application that keeps things simple,
                  saves your progress, and lets you review everything before you
                  submit.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.06, duration: 0.35 }}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  className="h-14 rounded-full bg-slate-900 px-7 text-base font-medium shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.01] hover:bg-slate-800"
                  onClick={onBegin}
                  type="button"
                >
                  Begin enrollment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">
                      About 10 minutes to complete
                    </div>
                    <div>Your progress is saved automatically</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-slate-50/80 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                    Before you start
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    What you&apos;ll need
                  </h2>
                </div>
                <div className="rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-medium text-teal-700 shadow-sm">
                  {checklist.length} items
                </div>
              </div>

              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                    className="flex items-start gap-3 rounded-2xl border border-white bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <span className="text-[15px] leading-7 text-slate-700">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    Parent details
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    Contact info, emergency contacts, and guardian verification.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    Health records
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    Immunizations, physician details, and any required medical
                    notes.
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-xl shadow-slate-900/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Helpful tip</div>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Have your documents ready before you begin to make the
                      process feel quick and seamless.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

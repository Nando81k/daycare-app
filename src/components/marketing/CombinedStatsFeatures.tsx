"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/shared/animated-number"
import Image from "next/image"
import type { ReactNode } from "react"

export interface Stat {
  value: number
  label: string
  suffix?: string
}

export interface Feature {
  icon?: React.ComponentType<{ className?: string }>
  imageSrc?: string
  imageAlt?: string
  title: string
  body: string
}

export function CombinedStatsFeatures({
  stats,
  features,
  className = "",
}: {
  stats: Stat[]
  features: Feature[]
  className?: string
}) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-2 md:px-8 py-8 md:py-16 scroll-mt-24 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
        {/* Stats - flat, left-aligned, minimal */}
        <div className="w-full md:w-1/5 flex flex-row md:flex-col gap-8 md:gap-10 justify-center md:justify-start items-center md:items-start">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center md:items-start">
              <span className="text-3xl md:text-4xl font-extrabold text-sky-700">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-1 text-sm md:text-base text-slate-700 font-medium text-center md:text-left">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        {/* Features - flat grid, no cards, no containers */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex flex-col items-center text-center">
                {feature.imageSrc ? (
                  <div className="relative w-full max-w-[420px] h-48 md:h-56 mb-6 rounded-2xl overflow-hidden">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt || feature.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority={idx === 0}
                    />
                  </div>
                ) : Icon ? (
                  <div className="mb-5 inline-flex rounded-2xl bg-sky-100 p-4 text-sky-700">
                    <Icon className="h-8 w-8" />
                  </div>
                ) : null}
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 mt-1">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 max-w-md mx-auto">{feature.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

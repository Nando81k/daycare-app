"use client"

import type { ReactNode } from "react"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
}: {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

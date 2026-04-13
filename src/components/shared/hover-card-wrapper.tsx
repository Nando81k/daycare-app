"use client"

import type { ReactNode } from "react"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type HoverCardWrapperProps = {
  children: ReactNode
  className?: string
  lift?: number
}

export function HoverCardWrapper({ children, className, lift = 3 }: HoverCardWrapperProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{ y: -lift, boxShadow: "0 6px 20px oklch(0% 0 0 / .08)" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}

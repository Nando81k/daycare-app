"use client"

import type { ComponentProps, ReactNode } from "react"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimateInProps = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
} & Omit<ComponentProps<typeof motion.div>, "initial" | "whileInView" | "viewport" | "transition">

const axis: Record<NonNullable<AnimateInProps["direction"]>, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 16,
  ...rest
}: AnimateInProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = axis[direction]

  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        x: (offset.x ?? 0) * distance,
        y: (offset.y ?? 0) * distance,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

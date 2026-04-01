"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type MotionFadeInProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  amount?: number
  once?: boolean
}

export function MotionFadeIn({
  children,
  className,
  delay = 0,
  duration = 0.45,
  y = 16,
  amount = 0.2,
  once = true,
}: MotionFadeInProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

type MotionStaggerProps = {
  children: React.ReactNode
  className?: string
  baseDelay?: number
  step?: number
  duration?: number
  y?: number
  amount?: number
  once?: boolean
}

export function MotionStagger({
  children,
  className,
  baseDelay = 0,
  step = 0.06,
  duration = 0.42,
  y = 14,
  amount = 0.2,
  once = true,
}: MotionStaggerProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={cn(className)}>
      {childrenArray.map((child, index) => (
        <MotionFadeIn
          key={index}
          delay={baseDelay + index * step}
          duration={duration}
          y={y}
          amount={amount}
          once={once}
        >
          {child}
        </MotionFadeIn>
      ))}
    </div>
  )
}

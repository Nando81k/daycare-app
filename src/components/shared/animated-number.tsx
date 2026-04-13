"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { useInView, useReducedMotion, useSpring, useTransform } from "motion/react"

type AnimatedNumberProps = {
  value: number
  prefix?: string
  suffix?: string
  /** Decimal places to display */
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-5%" })
  const shouldReduceMotion = useReducedMotion()

  const spring = useSpring(0, { damping: 24, stiffness: 180 })
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)

  const reducedMotionText = useMemo(
    () => `${prefix}${value.toFixed(decimals)}${suffix}`,
    [prefix, value, decimals, suffix]
  )

  const [text, setText] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`)

  useEffect(() => {
    if (!isInView) return
    if (shouldReduceMotion) return
    spring.set(value)
  }, [isInView, value, shouldReduceMotion, spring])

  useEffect(() => {
    if (shouldReduceMotion) return
    const unsub = display.on("change", (v) => setText(v))
    return unsub
  }, [display, shouldReduceMotion])

  return (
    <span ref={ref} className={className}>
      {shouldReduceMotion ? reducedMotionText : text}
    </span>
  )
}

"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

interface FAQAnimationWrapperProps {
  children: React.ReactNode
}

export function FAQAnimationWrapper({ children }: FAQAnimationWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      ref={containerRef}
      className="mx-auto mt-14 w-full max-w-3xl"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      aria-label="FAQ questions and answers"
    >
      {children}
    </motion.div>
  )
}

interface FAQItemWrapperProps {
  children: React.ReactNode
  isLast?: boolean
}

export function FAQItemWrapper({ children, isLast }: FAQItemWrapperProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45 },
    },
  }

  return (
    <motion.div variants={itemVariants} className={isLast ? "" : "border-border border-b"}>
      {children}
    </motion.div>
  )
}

"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { AppLogo } from "@/components/layout/app-logo"
import { cn } from "@/lib/utils"

function FooterHref({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  )
}

interface FooterWrapperProps {
  children: ReactNode
}

export function FooterWrapper({ children }: FooterWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      ref={containerRef}
      className="shell-container py-12 md:py-14"
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={shouldReduceMotion ? undefined : isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedMainContentProps {
  children: ReactNode
}

export function AnimatedMainContent({ children }: AnimatedMainContentProps) {
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      variants={contentVariants}
      className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedBrandSectionProps {
  children: ReactNode
}

export function AnimatedBrandSection({ children }: AnimatedBrandSectionProps) {
  const brandVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      variants={brandVariants}
      className="flex w-full max-w-sm flex-col items-start gap-2"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedLogoProps {
  className?: string
}

export function AnimatedLogo({ className }: AnimatedLogoProps) {
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  } as const

  return (
    <motion.div
      variants={logoVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
      className={className}
    >
      <AppLogo compact />
    </motion.div>
  )
}

interface AnimatedTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedText({ children, className }: AnimatedTextProps) {
  const textVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  } as const

  return (
    <motion.div variants={textVariants} className={className}>
      {children}
    </motion.div>
  )
}

interface AnimatedButtonProps {
  href: string
  children: ReactNode
  className?: string
}

export function AnimatedButton({
  href,
  children,
  className,
}: AnimatedButtonProps) {
  const buttonVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  } as const

  return (
    <motion.div
      variants={buttonVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
    >
      <FooterHref href={href} className={className}>
        {children}
      </FooterHref>
    </motion.div>
  )
}

interface AnimatedLinksGridProps {
  children: ReactNode
}

export function AnimatedLinksGrid({ children }: AnimatedLinksGridProps) {
  const gridVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      variants={gridVariants}
      className="grid w-full grid-cols-2 gap-8 md:grid-cols-4 lg:max-w-3xl"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedLinkSectionProps {
  children: ReactNode
  title: string
}

export function AnimatedLinkSection({
  children,
  title,
}: AnimatedLinkSectionProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
  } as const

  return (
    <motion.nav variants={sectionVariants} aria-label={title}>
      {children}
    </motion.nav>
  )
}

interface AnimatedLinkProps {
  href: string
  children: ReactNode
}

export function AnimatedLink({ href, children }: AnimatedLinkProps) {
  const linkVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  } as const

  return (
    <motion.li variants={linkVariants}>
      <motion.div whileHover={{ x: 3, transition: { duration: 0.18 } }}>
        <FooterHref
          href={href}
          className="transition-colors duration-200 hover:text-foreground"
        >
          {children}
        </FooterHref>
      </motion.div>
    </motion.li>
  )
}

interface AnimatedBottomSectionProps {
  children: ReactNode
}

export function AnimatedBottomSection({
  children,
}: AnimatedBottomSectionProps) {
  const bottomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      variants={bottomVariants}
      className="mt-12 flex flex-col gap-4 border-t border-border/55 pt-6 md:flex-row md:items-center md:justify-between"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedSocialLinksProps {
  children: ReactNode
}

export function AnimatedSocialLinks({ children }: AnimatedSocialLinksProps) {
  const socialVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  } as const

  return (
    <motion.div
      variants={socialVariants}
      className="flex items-center gap-4"
      role="list"
      aria-label="Footer quick links"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedSocialIconProps {
  href: string
  children: ReactNode
  ariaLabel: string
}

export function AnimatedSocialIcon({
  href,
  children,
  ariaLabel,
}: AnimatedSocialIconProps) {
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  } as const

  return (
    <motion.div variants={iconVariants} role="listitem">
      <motion.div whileHover={{ scale: 1.08, transition: { duration: 0.18 } }}>
        <FooterHref
          href={href}
          ariaLabel={ariaLabel}
          className={cn(
            "flex size-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground"
          )}
        >
          {children}
        </FooterHref>
      </motion.div>
    </motion.div>
  )
}

"use client"

import Link from "next/link"
import * as React from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { MenuIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type NavItem = {
  name: string
  link: string
}

type NavbarProps = {
  children: React.ReactNode
  className?: string
}

type NavBodyProps = {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

type NavItemsProps = {
  items: NavItem[]
  className?: string
  currentPath?: string
  isCurrentLink?: (currentPath: string, link: string) => boolean
  onItemClick?: () => void
}

type MobileNavProps = {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

type MobileNavHeaderProps = {
  children: React.ReactNode
  className?: string
}

type MobileNavMenuProps = {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

function defaultIsCurrentLink(currentPath: string, link: string) {
  if (link === "/") {
    return currentPath === "/"
  }

  return currentPath === link || currentPath.startsWith(`${link}/`)
}

export function Navbar({ children, className }: NavbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [visible, setVisible] = React.useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 56)
  })

  return (
    <motion.div ref={ref} className={cn("fixed inset-x-0 top-4 z-50 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child
      )}
    </motion.div>
  )
}

export function NavBody({ children, className, visible }: NavBodyProps) {
  return (
    <motion.div
      animate={{
        width: visible ? "78%" : "100%",
        y: visible ? 8 : 0,
        boxShadow: visible
          ? "0 20px 45px -30px rgba(31,64,62,0.45)"
          : "0 12px 28px -24px rgba(31,64,62,0.28)",
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 36,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl items-center justify-between rounded-full border border-border/70 bg-background/88 px-4 py-2 backdrop-blur-md lg:flex",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function NavItems({
  items,
  className,
  currentPath,
  isCurrentLink = defaultIsCurrentLink,
  onItemClick,
}: NavItemsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 items-center justify-center gap-1 text-sm font-medium lg:flex",
        className
      )}
    >
      {items.map((item, idx) => {
        const active = currentPath ? isCurrentLink(currentPath, item.link) : false

        return (
          <Link
            key={`link-${item.link}`}
            href={item.link}
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "relative rounded-full px-4 py-2 text-foreground/70 transition-colors duration-200 hover:text-foreground",
              active && "text-foreground"
            )}
          >
            {!active && hovered === idx && (
              <motion.div
                layoutId="resizable-navbar-hover"
                className="absolute inset-0 rounded-full bg-muted"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            {active && <span className="absolute inset-0 rounded-full border border-border/70 bg-background shadow-[0_10px_24px_-18px_rgba(31,64,62,0.45)]" />}
            <span className="relative z-20">{item.name}</span>
          </Link>
        )
      })}
    </motion.div>
  )
}

export function MobileNav({ children, className, visible }: MobileNavProps) {
  return (
    <motion.div
      animate={{
        width: visible ? "92%" : "100%",
        y: visible ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 36,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col rounded-full border border-border/70 bg-background/92 px-3 py-2 shadow-[0_14px_32px_-26px_rgba(31,64,62,0.34)] backdrop-blur-md lg:hidden",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {children}
    </div>
  )
}

export function MobileNavMenu({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "absolute inset-x-0 top-[4.2rem] z-50 flex w-full flex-col gap-3 rounded-2xl border border-border/70 bg-background px-4 py-4 shadow-[0_22px_42px_-30px_rgba(31,64,62,0.42)]",
            className
          )}
          onClick={onClose}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-foreground transition-colors hover:bg-muted"
    >
      {isOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
    </button>
  )
}

export function NavbarLogo({ children = "Brand" }: { children?: React.ReactNode }) {
  return <span className="text-sm font-medium text-foreground">{children}</span>
}

export function NavbarButton({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string
  as?: React.ElementType
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary"
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200"
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "border border-border/70 bg-background text-foreground hover:bg-muted",
  }

  return (
    <Tag href={href || undefined} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </Tag>
  )
}

"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type ExpandableCardProps = {
  title: string
  description: string
  alt?: string
  src?: string
  media?: React.ReactNode
  className?: string
  classNameExpanded?: string
  children: React.ReactNode
}

function PlaceholderMedia() {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] border border-border/60 bg-[linear-gradient(180deg,rgba(234,243,241,0.9),rgba(248,244,238,0.88))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(124,168,164,0.18),transparent_32%)]" />
      <div className="absolute inset-x-5 top-5 h-14 rounded-[1rem] border border-white/80 bg-background/74" />
      <div className="absolute bottom-5 left-5 right-14 h-20 rounded-[1.2rem] border border-border/40 bg-background/80" />
      <div className="absolute bottom-8 right-5 size-14 rounded-[1.15rem] border border-border/40 bg-secondary/70" />
    </div>
  )
}

export function ExpandableCard({
  title,
  description,
  alt,
  src,
  media,
  className,
  classNameExpanded,
  children,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const id = React.useId()

  React.useEffect(() => {
    if (!active) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [active])

  function renderMedia() {
    if (media) {
      return media
    }

    if (src) {
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? title}
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </>
      )
    }

    return <PlaceholderMedia />
  }

  function openCard() {
    setActive(true)
  }

  function closeCard() {
    setActive(false)
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <>
            <motion.button
              type="button"
              aria-label={`Close ${title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeCard}
              className="fixed inset-0 z-40 bg-background/72 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
              <motion.div
                layoutId={`expandable-card-${id}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`expandable-card-title-${id}`}
                className="relative flex h-[min(92vh,840px)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-[0_40px_120px_-70px_rgba(31,64,62,0.5)]"
              >
                <div className="grid min-h-0 flex-1 lg:grid-cols-[1.02fr_0.98fr]">
                  <motion.div
                    layoutId={`expandable-card-media-${id}`}
                    className="min-h-[16rem] overflow-hidden border-b border-border/60 bg-card/80 lg:min-h-0 lg:border-b-0 lg:border-r"
                  >
                    <div className="h-full w-full [&>*]:h-full [&>*]:w-full [&>*]:aspect-auto">
                      {renderMedia()}
                    </div>
                  </motion.div>

                  <div className="flex min-h-0 flex-col">
                    <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
                      <div className="min-w-0">
                        <motion.div layoutId={`expandable-card-description-${id}`}>
                          <Badge variant="secondary" className="rounded-full">
                            {description}
                          </Badge>
                        </motion.div>
                        <motion.h3
                          id={`expandable-card-title-${id}`}
                          layoutId={`expandable-card-title-${id}`}
                          className="mt-4 max-w-[14ch] font-heading text-4xl tracking-tight text-foreground sm:text-[2.7rem]"
                        >
                          {title}
                        </motion.h3>
                      </div>

                      <motion.button
                        type="button"
                        aria-label={`Close ${title}`}
                        layoutId={`expandable-card-button-${id}`}
                        onClick={closeCard}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/84 text-foreground transition-colors hover:bg-card"
                      >
                        <motion.div
                          animate={{ rotate: active ? 45 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <PlusIcon className="size-4" />
                        </motion.div>
                      </motion.button>
                    </div>

                    <Separator />

                    <div className="min-h-0 flex-1 overflow-auto px-6 py-6 sm:px-8 sm:py-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className={cn(
                          "flex flex-col gap-5 text-base leading-8 text-muted-foreground [&_h4]:font-heading [&_h4]:text-2xl [&_h4]:tracking-tight [&_h4]:text-foreground [&_p]:text-pretty",
                          classNameExpanded
                        )}
                      >
                        {children}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <motion.article
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={active}
        aria-controls={`expandable-card-title-${id}`}
        layoutId={`expandable-card-${id}`}
        onClick={openCard}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openCard()
          }
        }}
        className={cn(
          "group/card flex cursor-pointer flex-col gap-3 rounded-[1.55rem] border border-border/60 bg-background/88 p-3 shadow-[0_20px_50px_-42px_rgba(31,64,62,0.32)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_64px_-44px_rgba(31,64,62,0.38)]",
          className
        )}
      >
        <motion.div
          layoutId={`expandable-card-media-${id}`}
          className="overflow-hidden rounded-[1.2rem] border border-border/60 bg-card/72"
        >
          <div className="aspect-[16/10] h-full w-full [&>*]:h-full [&>*]:w-full [&>*]:aspect-auto">
            {renderMedia()}
          </div>
        </motion.div>

        <div className="flex items-start justify-between gap-3 px-1 pb-1 pt-2">
          <div className="min-w-0">
            <motion.div layoutId={`expandable-card-description-${id}`}>
              <Badge variant="secondary" className="rounded-full">
                {description}
              </Badge>
            </motion.div>
            <motion.h3
              layoutId={`expandable-card-title-${id}`}
              className="mt-3 text-lg font-semibold tracking-tight text-foreground"
            >
              {title}
            </motion.h3>
          </div>

          <motion.div
            layoutId={`expandable-card-button-${id}`}
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/84 text-foreground transition-colors group-hover/card:bg-card"
          >
            <motion.div
              animate={{ rotate: active ? 45 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <PlusIcon className="size-4" />
            </motion.div>
          </motion.div>
        </div>
      </motion.article>
    </>
  )
}

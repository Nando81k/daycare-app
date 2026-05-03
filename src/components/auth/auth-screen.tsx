import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { brandConfig } from "@/config/brand"
import { cn } from "@/lib/utils"

type AuthScreenProps = {
  imageSrc: string
  imageAlt: string
  imageCaption: string
  imageBadge: string
  imagePosition?: "left" | "right"
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  /**
   * Override the vertical padding on the inner content wrapper. Defaults to
   * `py-16`; pass e.g. `py-8` to compress dense forms (signup) so they fit
   * on a 1366×768 laptop without scroll.
   */
  contentClassName?: string
}

export function AuthScreen({
  imageSrc,
  imageAlt,
  imageCaption,
  imageBadge,
  imagePosition = "left",
  eyebrow,
  title,
  description,
  children,
  footer,
  contentClassName,
}: AuthScreenProps) {
  const imageOnLeft = imagePosition === "left"

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-12">
      <aside
        className={cn(
          "relative hidden min-h-[40vh] overflow-hidden lg:block lg:col-span-5",
          imageOnLeft ? "lg:order-1" : "lg:order-2"
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-10 pb-10">
          <div className="flex items-baseline justify-between border-t border-background/40 pt-4 text-xs uppercase tracking-[0.22em] text-background/85">
            <span>{imageCaption}</span>
            <span className="text-accent">{imageBadge}</span>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          "relative flex min-h-svh flex-col px-6 py-8 md:px-12 md:py-12 lg:col-span-7",
          imageOnLeft ? "lg:order-2" : "lg:order-1"
        )}
      >
        <header className="flex items-center justify-between">
          <Link href="/" className="font-heading text-xl tracking-tight text-foreground">
            {brandConfig.shortName}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </header>

        <div
          className={cn(
            "flex flex-1 items-center justify-center py-16",
            contentClassName
          )}
        >
          <div className="w-full max-w-md">
            <Reveal>
              <div className="mb-10">
                <p className="editorial-kicker">{eyebrow}</p>
                <h1 className="mt-5 font-heading text-balance text-4xl leading-[1.05] tracking-[-0.02em] text-foreground md:text-5xl">
                  {title}
                </h1>
                <p className="mt-5 text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>
              {children}
              {footer ? (
                <p className="mt-10 text-sm text-muted-foreground">{footer}</p>
              ) : null}
            </Reveal>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {brandConfig.name}</span>
          <Link href="/contact" className="hover:text-foreground">
            Need help?
          </Link>
        </footer>
      </main>
    </div>
  )
}

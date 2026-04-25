import Image from "next/image"

import type { MarketingMediaAsset } from "@/types/app"

import { cn } from "@/lib/utils"

export function MarketingMediaPanel({
  asset,
  eyebrow,
  title,
  description,
  className,
  imageClassName,
  priority = false,
  align = "bottom",
}: {
  asset: MarketingMediaAsset
  eyebrow?: string
  title?: string
  description?: string
  className?: string
  imageClassName?: string
  priority?: boolean
  align?: "bottom" | "center"
}) {
  const hasOverlay = Boolean(eyebrow || title || description || asset.caption)

  return (
    <div className={cn("relative overflow-hidden border border-border/60 bg-muted", className)}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className={cn("object-cover", imageClassName)}
        style={{ objectPosition: asset.objectPosition }}
      />
      {hasOverlay ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              align === "center"
                ? "bg-linear-to-t from-foreground/55 via-foreground/15 to-transparent"
                : "bg-linear-to-t from-foreground/65 via-foreground/15 to-transparent"
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 z-10 flex flex-col gap-3 px-6 pb-6 text-background md:px-8 md:pb-8",
              align === "center" ? "inset-y-0 justify-center pt-8" : "bottom-0"
            )}
          >
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.22em] text-background/80">{eyebrow}</p>
            ) : null}
            {title ? (
              <h3 className="font-heading max-w-lg text-2xl leading-tight tracking-[-0.01em] text-background md:text-3xl">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="max-w-lg text-sm leading-6 text-background/80">{description}</p>
            ) : null}
            {!description && asset.caption ? (
              <p className="max-w-lg text-sm leading-6 text-background/80">{asset.caption}</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

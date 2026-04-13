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
  return (
    <div className={cn("image-panel image-grain min-h-[23rem]", className)}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className={cn("object-cover", imageClassName)}
        style={{ objectPosition: asset.objectPosition }}
      />
      {(eyebrow || title || description || asset.caption) ? (
        <div
          className={cn(
            "absolute inset-x-0 z-10 flex flex-col gap-2 px-5 pb-5 text-white md:px-6 md:pb-6",
            align === "center" ? "inset-y-0 justify-center pt-8" : "bottom-0"
          )}
        >
          {eyebrow ? <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/82">{eyebrow}</p> : null}
          {title ? <h3 className="max-w-lg text-2xl leading-tight md:text-[2rem]">{title}</h3> : null}
          {description ? <p className="max-w-lg text-sm leading-6 text-white/84">{description}</p> : null}
          {!description && asset.caption ? (
            <p className="max-w-lg text-sm leading-6 text-white/84">{asset.caption}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

import Image from "next/image"

import { brandConfig } from "@/config/brand"
import { marketingMedia } from "@/data/marketing"
import { cn } from "@/lib/utils"

type AuthBrandPanelProps = {
  className?: string
}

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
  const asset = marketingMedia.formStory

  return (
    <div className={cn("relative hidden bg-muted lg:block", className)}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority
        sizes="50vw"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: asset.objectPosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.45)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-10">
        <blockquote className="text-lg/relaxed font-medium text-white">
          &ldquo;{brandConfig.tagline}&rdquo;
        </blockquote>
        <p className="text-sm text-white/70">{brandConfig.name}</p>
      </div>
    </div>
  )
}

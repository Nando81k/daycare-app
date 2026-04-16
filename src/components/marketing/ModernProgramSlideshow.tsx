import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ProgramSlide {
  title: string
  subtitle: string
  copy: string
  stat: string
  imageSrc: string
  imageAlt: string
}

export function ModernProgramSlideshow({
  slides,
  activeSlide,
  setActiveSlide,
  className = "",
}: {
  slides: ProgramSlide[]
  activeSlide: number
  setActiveSlide: (index: number) => void
  className?: string
}) {
  const slide = slides[activeSlide]
  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center", className)}>
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-xl">
        <Image
          src={slide.imageSrc}
          alt={slide.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 40vw"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-1">{slide.title}</h3>
          <p className="text-base md:text-lg text-sky-100 font-medium mb-2">{slide.subtitle}</p>
          <p className="text-sm md:text-base text-slate-100 max-w-lg">{slide.copy}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-6">
        {slides.map((item, idx) => (
          <button
            key={item.title}
            onClick={() => setActiveSlide(idx)}
            className={`h-2.5 rounded-full transition-all ${idx === activeSlide ? "w-8 bg-sky-700" : "w-2.5 bg-slate-300"}`}
            aria-label={`Show ${item.title} slide`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}

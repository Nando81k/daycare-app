import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function PersonAvatar({
  name,
  size = "md",
  tone = "default",
}: {
  name: string
  size?: "sm" | "md" | "lg"
  tone?: "default" | "accent" | "muted"
}) {
  const sizeClasses = {
    sm: "size-10 text-sm",
    md: "size-12 text-base",
    lg: "size-16 text-lg",
  }

  const toneClasses = {
    default: "bg-secondary text-foreground",
    accent: "bg-primary/12 text-primary",
    muted: "bg-muted text-muted-foreground",
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        toneClasses[tone]
      )}
    >
      {getInitials(name)}
    </div>
  )
}

import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type GradientSlideButtonProps = Omit<ButtonProps, "variant">

export function GradientSlideButton({
  className,
  ...props
}: GradientSlideButtonProps) {
  return <Button variant="default" className={cn("rounded-3xl", className)} {...props} />
}

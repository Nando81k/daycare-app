import type { FormSectionProps } from "@/types/app"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function FormSection({ title, description, children, footer, className }: FormSectionProps) {
  return (
    <Card className={cn("surface-panel-strong gap-0 overflow-hidden", className)}>
      <CardHeader className="border-b border-border/45 px-4 py-4 md:px-5 md:py-4">
        <CardTitle className="text-[1.2rem]">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-4 py-4 md:px-5 md:py-4">{children}</CardContent>
      {footer ? <CardFooter className="px-4 py-4 md:px-5 md:py-4">{footer}</CardFooter> : null}
    </Card>
  )
}

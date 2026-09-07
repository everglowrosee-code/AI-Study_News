import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background shadow-xs hover:opacity-90",
        secondary:
          "border-border/80 bg-muted/60 text-foreground hover:bg-muted",
        destructive:
          "border-transparent bg-foreground text-background shadow-xs hover:opacity-90 line-through opacity-80",
        outline: "border-border/80 text-foreground hover:border-foreground/40",
        naver: "border-foreground/20 bg-foreground/5 text-foreground dark:border-white/20 dark:bg-white/5 dark:text-white font-medium",
        press: "border-border/70 bg-card text-foreground/90 hover:border-foreground/30 font-medium text-[11px]",
        luxury: "border-foreground bg-foreground text-background font-bold tracking-wider uppercase text-[10px] shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

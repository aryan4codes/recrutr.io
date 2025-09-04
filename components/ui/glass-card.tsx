import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong"
  blur?: "sm" | "md" | "lg"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", blur = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-300",
          // Base glass effect
          variant === "strong" 
            ? "bg-white/90 border-white/40" 
            : "bg-white/70 border-white/30",
          // Backdrop blur
          blur === "sm" && "backdrop-blur-sm",
          blur === "md" && "backdrop-blur",
          blur === "lg" && "backdrop-blur-lg",
          // Shadows and hover effects
          "shadow-soft hover:shadow-soft-lg hover:bg-white/80",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard, type GlassCardProps }

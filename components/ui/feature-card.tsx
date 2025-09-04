import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description: string
  gradient?: boolean
  size?: "default" | "large"
  badge?: string
  children?: React.ReactNode
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon: Icon, title, description, gradient = false, size = "default", badge, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1",
          size === "large" ? "rounded-3xl p-10" : "rounded-2xl p-8",
          gradient
            ? "bg-gradient-to-br from-primary-50 via-white to-sage-50 border border-white/50 shadow-soft"
            : "bg-white/80 backdrop-blur border border-gray-100 shadow-soft",
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur rounded-full mb-4">
              {Icon && <Icon className="w-4 h-4 text-primary-500" />}
              <span className="text-sm font-medium text-gray-700">{badge}</span>
            </div>
          )}
          
          {Icon && !badge && (
            <div className="inline-flex p-3 rounded-xl bg-primary-100/50 mb-6 group-hover:bg-primary-100/70 transition-colors">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          )}
          
          <h3 className={cn(
            "font-semibold font-display text-gray-900 mb-3",
            size === "large" ? "text-2xl" : "text-xl"
          )}>
            {title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
          
          {children}
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary-200/20 to-sage-200/20 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
      </div>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export { FeatureCard, type FeatureCardProps }

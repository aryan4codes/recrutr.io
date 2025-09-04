import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: LucideIcon
  variant?: "default" | "gradient"
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    title, 
    value, 
    description, 
    trend = "neutral", 
    trendValue, 
    icon: Icon,
    variant = "default",
    ...props 
  }, ref) => {
    const trendColors = {
      up: "text-success",
      down: "text-error",
      neutral: "text-gray-500"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300 hover:shadow-soft-lg",
          variant === "gradient" 
            ? "bg-gradient-to-br from-primary-50 to-white border border-primary-100"
            : "bg-white/80 backdrop-blur border border-gray-100 shadow-soft",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {Icon && (
            <Icon className={cn(
              "w-4 h-4",
              trend === "up" ? "text-success" : 
              trend === "down" ? "text-error" : 
              "text-gray-400"
            )} />
          )}
        </div>
        
        <div className="text-3xl font-bold font-display text-gray-900 mb-1">
          {value}
        </div>
        
        {(description || trendValue) && (
          <div className="flex items-center gap-2 text-sm">
            {trendValue && (
              <span className={cn("font-medium", trendColors[trend])}>
                {trend === "up" && "+"}
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-gray-500">{description}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard, type MetricCardProps }

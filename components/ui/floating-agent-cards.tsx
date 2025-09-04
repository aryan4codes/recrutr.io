"use client"
import React from "react"
import { motion } from "framer-motion"
import { FileText, Target, UserCheck, MessageSquare, Calendar, TrendingUp } from "lucide-react"

const agentCards = [
  {
    icon: FileText,
    title: "Resume Parser Agent",
    description: "Autonomously extracts and structures candidate data",
    color: "from-primary-500 to-primary-600",
    delay: 0,
  },
  {
    icon: Target,
    title: "Matching Agent",
    description: "Intelligently ranks candidates using vector similarity",
    color: "from-sage-500 to-primary-400",
    delay: 0.1,
  },
  {
    icon: UserCheck,
    title: "Screening Agent",
    description: "Automatically evaluates candidate fit and quality",
    color: "from-peach-500 to-peach-600",
    delay: 0.2,
  },
  {
    icon: MessageSquare,
    title: "Analysis Agent",
    description: "Provides detailed explanations for every decision",
    color: "from-primary-600 to-sage-500",
    delay: 0.3,
  },
  {
    icon: Calendar,
    title: "Scheduling Agent",
    description: "Coordinates interviews across multiple calendars",
    color: "from-sage-600 to-peach-500",
    delay: 0.4,
  },
  {
    icon: TrendingUp,
    title: "Analytics Agent",
    description: "Monitors pipeline health and optimization opportunities",
    color: "from-peach-600 to-primary-500",
    delay: 0.5,
  },
]

export function FloatingAgentCards() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agentCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: card.delay,
            }}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center flex-shrink-0`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base mb-2 leading-tight">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

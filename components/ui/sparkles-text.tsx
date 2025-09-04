"use client"
import React from "react"
import { motion } from "framer-motion"

interface SparklesTextProps {
  children: React.ReactNode
  className?: string
}

export function SparklesText({ children, className = "" }: SparklesTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated sparkles - behind text */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/60 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
              x: [0, Math.random() * 15 - 7.5],
              y: [0, Math.random() * 15 - 7.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
        
        {/* Larger sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`large-${i}`}
            className="absolute pointer-events-none"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 0L14.59 8.41L23 9L14.59 11.59L12 20L9.41 11.59L1 9L9.41 8.41L12 0Z"
                fill="currentColor"
                className="text-primary-400/60"
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

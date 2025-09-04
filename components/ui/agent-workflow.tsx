"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, ArrowRight, CheckCircle, Sparkles } from "lucide-react"

const workflowSteps = [
  {
    id: "upload",
    title: "Resume Upload",
    description: "Candidate submits resume",
    agent: "Parser Agent",
    status: "completed",
    color: "from-green-500 to-green-600",
  },
  {
    id: "parse",
    title: "AI Parsing",
    description: "Extracting skills, experience, education",
    agent: "Parser Agent",
    status: "active",
    color: "from-primary-500 to-primary-600",
  },
  {
    id: "match",
    title: "Vector Matching",
    description: "Computing semantic similarity scores",
    agent: "Matching Agent",
    status: "pending",
    color: "from-sage-500 to-primary-400",
  },
  {
    id: "rank",
    title: "Smart Ranking",
    description: "Generating candidate rankings",
    agent: "Ranking Agent",
    status: "pending",
    color: "from-peach-500 to-peach-600",
  },
  {
    id: "explain",
    title: "AI Explanation",
    description: "Creating detailed reasoning",
    agent: "Analysis Agent",
    status: "pending",
    color: "from-purple-500 to-purple-600",
  },
]

export function AgentWorkflow() {
  const [activeStep, setActiveStep] = useState(1)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= workflowSteps.length - 1 ? 0 : prev + 1))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              className="relative flex flex-col items-center"
              initial={false}
              animate={{
                scale: activeStep === index ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Circle */}
              <motion.div
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden
                  ${activeStep === index 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' 
                    : activeStep > index 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gray-200'
                  }
                `}
                whileHover={{ scale: 1.05 }}
              >
                <AnimatePresence mode="wait">
                  {activeStep === index ? (
                    <motion.div
                      key="active"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                  ) : activeStep > index ? (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Bot className="w-8 h-8 text-gray-500" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulse animation for active step */}
                {activeStep === index && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary-400/30"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>

              {/* Step Info */}
              <motion.div
                className="mt-4 text-center"
                animate={{
                  opacity: activeStep === index ? 1 : 0.6,
                }}
              >
                <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{step.agent}</p>
              </motion.div>

              {/* Active Step Details */}
              <AnimatePresence>
                {activeStep === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1 }}
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/100 rounded-xl shadow-lg p-4 border border-gray-100 min-w-48 z-10"
                  >
                    <p className="text-sm text-gray-700 font-medium">{step.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-primary-600 font-medium">Processing...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Arrow between steps */}
            {index < workflowSteps.length - 1 && (
              <motion.div
                className="flex-1 flex items-center justify-center mx-4"
                animate={{
                  opacity: activeStep > index ? 1 : 0.3,
                }}
              >
                <motion.div
                  className={`h-0.5 flex-1 ${
                    activeStep > index ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeStep > index ? 1 : 0.3 }}
                  transition={{ duration: 0.5 }}
                />
                <ArrowRight className={`w-4 h-4 mx-2 ${
                  activeStep > index ? 'text-green-500' : 'text-gray-400'
                }`} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

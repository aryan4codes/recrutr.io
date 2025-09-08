"use client"
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { FloatingAgentCards } from '@/components/ui/floating-agent-cards'
import { AgentWorkflow } from '@/components/ui/agent-workflow'
import { SparklesText } from '@/components/ui/sparkles-text'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Users, 
  Brain, 
  Calendar, 
  BarChart3, 
  FileCheck,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Clock,
  Target,
  Award,
  CheckCircle2,
  TrendingUp,
  Globe,
  Network,
  Cpu,
  Workflow,
  MessageSquare,
  Eye,
  Database
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-display gradient-text">Recruiting Copilot</span>
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base">Pricing</a>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-sm">Dashboard</Button>
              </Link>
              <Button size="sm" className="text-sm">Start Free Trial</Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <AnimatedBackground>
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden min-h-screen flex items-center">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full z-20">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <motion.div
                className="space-y-8 text-left lg:text-left relative z-30"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur rounded-full border border-primary-200/50 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Bot className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    Multi-Agent AI System
                  </span>
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SparklesText className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary-700 bg-clip-text text-transparent">
                      Agentic AI
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-400 bg-clip-text text-transparent">
                      Recruiting
                    </span>
                  </SparklesText>
                </motion.div>
                
                <motion.p
                  className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-xl font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Deploy a team of <strong className="text-primary-700 font-bold">autonomous AI agents</strong> that think, 
                  reason, and act together to revolutionize your hiring process. Each agent specializes 
                  in different tasks, working in perfect coordination.
                </motion.p>
                
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="shadow-2xl text-lg px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-sage-700 " onClick={() => window.location.href = '/dashboard'}>
                      Deploy AI Agents
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-primary-200 hover:border-primary-300">
                      <Eye className="w-5 h-5 mr-2" />
                      Watch Agents Work
                    </Button>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  className="flex items-center gap-8 pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-semibold text-gray-700">6+ Specialized Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-sage-600" />
                    <span className="text-sm font-semibold text-gray-700">Real-time Coordination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-peach-600" />
                    <span className="text-sm font-semibold text-gray-700">Enterprise Ready</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                className="relative z-30"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <FloatingAgentCards />
              </motion.div>
            </div>
          </div>
        </section>
      </AnimatedBackground>

      {/* Social Proof */}
      <section className="py-24 bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/30 via-transparent to-sage-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100/80 to-sage-100/80 backdrop-blur rounded-full mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Trusted by 500+ Companies</span>
            </motion.div>
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">
              Companies Love Their <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">AI Agent Teams</span>
            </h2>
            <p className="text-gray-600">See how autonomous agents are transforming recruiting workflows</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 text-center hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "Our AI agents reduced time-to-hire by 65% and improved candidate quality scores by 40%. The autonomous decision-making is remarkable."
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-400 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm font-bold text-primary-600">SC</span>
                  </motion.div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Head of Talent, TechCorp</div>
                    <div className="text-xs text-primary-600 font-medium">6 AI Agents Deployed</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 text-center hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "The multi-agent coordination is incredible. Each agent learns and adapts, making our hiring process smarter every day."
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-sage-100 to-sage-200 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm font-bold text-sage-600">MJ</span>
                  </motion.div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Marcus Johnson</div>
                    <div className="text-sm text-gray-500">VP People, StartupX</div>
                    <div className="text-xs text-sage-600 font-medium">Full Agent Network Active</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 text-center hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "Watching our agents work together autonomously is like having a team of recruiting experts that never sleep. Revolutionary."
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-peach-100 to-peach-200 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm font-bold text-peach-600">LR</span>
                  </motion.div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Lisa Rodriguez</div>
                    <div className="text-sm text-gray-500">Chief People Officer, Scale Inc</div>
                    <div className="text-xs text-peach-600 font-medium">24/7 Agent Operations</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
      </div>

          {/* Agent Performance Stats */}
          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                500+
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">Companies Using Agents</p>
            </div>
            <div className="text-center">
            <motion.div
                className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                3M+
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">Resumes Processed</p>
            </div>
            <div className="text-center">
            <motion.div
                className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                65%
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">Faster Hiring</p>
            </div>
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                24/7
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">Agent Operations</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Agent Capabilities Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-sage-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center space-y-6 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100/80 backdrop-blur rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Autonomous Agent Network</span>
            </motion.div>
            
            <h2 className="text-5xl font-bold font-display text-gray-900">
              Meet Your <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">AI Agent Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Each agent operates independently while collaborating seamlessly. They learn, adapt, and make intelligent decisions 
              to optimize your entire recruiting pipeline—from first contact to final hire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Bot}
                title="Parser Agent"
                description="Autonomously extracts and structures candidate data from resumes. Uses advanced NLP to understand context, skills, and experience patterns."
                badge="Autonomous"
                gradient
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Brain}
                title="Matching Agent"
                description="Performs vector-based semantic analysis to find perfect candidate-job fit. Continuously learns from successful hires to improve accuracy."
                badge="Self-Learning"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Eye}
                title="Screening Agent"
                description="Intelligently evaluates candidates beyond keywords. Analyzes career progression, skill combinations, and cultural fit indicators."
                badge="Intelligent Analysis"
                gradient
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={MessageSquare}
                title="Explanation Agent"
                description="Provides detailed, human-readable explanations for every decision. Builds trust through transparency and actionable insights."
                badge="Explainable AI"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Calendar}
                title="Scheduling Agent"
                description="Orchestrates complex interview logistics across multiple calendars, time zones, and preferences. Optimizes for maximum efficiency."
                badge="Coordination Master"
                gradient
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={BarChart3}
                title="Analytics Agent"
                description="Monitors pipeline health, identifies bottlenecks, and predicts outcomes. Provides strategic recommendations for process optimization."
                badge="Predictive Insights"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agent Workflow */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-sage-50/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center space-y-6 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-sage-100 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Workflow className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Live Agent Coordination</span>
            </motion.div>
            
            <h2 className="text-5xl font-bold font-display text-gray-900">
              Watch Agents <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Work Together</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              See how our autonomous agents collaborate in real-time, making intelligent decisions and 
              adapting to your specific requirements. Each step is transparent and explainable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <AgentWorkflow />
          </motion.div>

          {/* Agent Communication Visualization */}
          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Network className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inter-Agent Communication</h3>
              <p className="text-gray-600">Agents share insights and coordinate decisions through secure message passing</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-sage-50 to-white border border-sage-100">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-sage-500 to-primary-400 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Cpu className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Parallel Processing</h3>
              <p className="text-gray-600">Multiple agents work simultaneously, dramatically reducing processing time</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-peach-50 to-white border border-peach-100">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Database className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Shared Knowledge Base</h3>
              <p className="text-gray-600">All agents learn from each interaction, continuously improving performance</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedBackground>
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-30">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Bot className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">Deploy Your Agent Team</span>
              </motion.div>
              
              <h2 className="text-5xl font-bold font-display mb-6">
                <SparklesText>
                  Ready to Deploy Your <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    AI Agent Team?
                  </span>
                </SparklesText>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join the future of recruiting with autonomous AI agents that work 24/7. 
                Experience the power of agentic AI—start your free trial today.
              </p>
              
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/dashboard">
                    <Button size="lg" className="shadow-2xl text-lg px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:via-sage-700 hover:to-peach-700">
                      Deploy Agents Now
                      <Bot className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-primary-200 hover:border-primary-300 bg-white/50 backdrop-blur">
                    <Eye className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-2 p-4 bg-white/80 backdrop-blur rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">14-Day Free Trial</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-4 bg-white/80 backdrop-blur rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">No Credit Card Required</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-4 bg-white/80 backdrop-blur rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">Deploy in Minutes</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedBackground>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-display">Recruiting Copilot</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered recruiting platform that helps you hire smarter and faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div><Link href="#features" className="hover:text-white transition-colors">Features</Link></div>
                <div><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></div>
                <div><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></div>
                <div><a href="#" className="hover:text-white transition-colors">API</a></div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">About</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Blog</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Careers</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Contact</a></div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Terms of Service</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Security</a></div>
                <div><a href="#" className="hover:text-white transition-colors">GDPR</a></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Recruiting Copilot. All rights reserved.</p>
          </div>
      </div>
      </footer>
    </div>
  )
}

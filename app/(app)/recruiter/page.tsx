'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Card } from '@/components/ui/card';
import { MarkdownMessage, JobMarkdownMessage } from '@/components/ui/markdown-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Users, 
  Star, 
  MapPin, 
  Briefcase, 
  Calendar,
  Eye,
  Send,
  Loader2,
  MessageSquare,
  Bot,
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobData {
  id: string;
  title: string;
  one_liner: string;
  location: string;
  level: string;
  department: string;
  employment_type: string;
  jd_text: string;
}

interface CandidateData {
  id: string;
  name: string;
  email: string;
  location: string;
  years_of_experience: number;
  current_company: string;
  current_position: string;
  similarity: number;
  final_score?: number;
  screening_summary?: string;
  top_skills?: Array<{ skill: string; evidence: string }>;
  confidence?: number;
}

interface TraceLog {
  id: string;
  agent_name: string;
  prompt: string;
  tool_calls: any;
  output: any;
  sql_executed?: string;
  execution_time_ms: number;
  created_at: string;
}

export default function RecruiterPage() {
  const [showTracePane, setShowTracePane] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobData | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/recruiter-agent',
    }),
    onFinish: ({ message }) => {
      // Debug: Log message structure
      console.log('Received message:', message);
      
      // Parse any structured data from the AI response
      try {
        const content = message.parts?.[0]?.type === 'text' ? message.parts[0].text : '';
        console.log('Extracted content:', content);
        const lines = content.split('\n');
        lines.forEach((line: string) => {
          if (line.startsWith('JOB_CREATED:')) {
            const jobData = JSON.parse(line.substring(12));
            setCurrentJob(jobData);
          } else if (line.startsWith('CANDIDATES_FOUND:')) {
            const candidateData = JSON.parse(line.substring(17));
            setCandidates(candidateData);
          } else if (line.startsWith('CANDIDATES_RANKED:')) {
            const rankedData = JSON.parse(line.substring(19));
            setCandidates(rankedData);
          } else if (line.startsWith('TRACE_LOG:')) {
            const traceData = JSON.parse(line.substring(10));
            setTraceLogs(prev => [...prev, traceData]);
          }
        });
      } catch (e) {
        // Ignore parsing errors
      }
    },
  });

  // Debug: Log messages array changes
  useEffect(() => {
    console.log('Messages updated:', messages.length, 'Status:', status);
    if (messages.length > 0) {
      console.log('Latest message:', messages[messages.length - 1]);
    }
  }, [messages, status]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollTo({
      top: messagesEndRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage({ text: input });
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 border-b px-6 py-8 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
          <motion.div 
            className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <Bot className="h-10 w-10 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h1 
                  className="text-4xl font-bold text-white font-display flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Recruiter AI
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                </motion.h1>
                <motion.p 
                  className="text-white/90 text-lg flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </motion.div>
                  Your intelligent hiring assistant
                </motion.p>
                
                {/* Status indicators */}
                <motion.div 
                  className="flex items-center gap-4 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <Brain className="h-3 w-3" />
                    <span>AI Active</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <Zap className="h-3 w-3" />
                    <span>Ready to Help</span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowTracePane(!showTracePane)}
                  className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 shadow-lg"
                >
                  <Eye className="h-4 w-4" />
                  {showTracePane ? 'Hide' : 'Show'} Trace
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={messagesEndRef}>
              {messages.length === 0 ? (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="max-w-4xl mx-auto">
                      {/* Main welcome */}
                      <motion.div 
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <motion.div 
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-100 via-purple-100 to-primary-100 rounded-full mb-8 shadow-lg border border-primary-200"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Bot className="w-5 h-5 text-primary-600" />
                          </motion.div>
                          <span className="text-sm font-bold text-primary-700">AI-Powered Recruiting Platform</span>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="w-4 h-4 text-primary-500" />
                          </motion.div>
                        </motion.div>
                        
                        <motion.h2 
                          className="text-6xl font-bold font-display text-gray-900 mb-8 leading-tight"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          Transform Your 
                          <motion.span 
                            className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-400 bg-clip-text text-transparent"
                            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                            transition={{ duration: 5, repeat: Infinity }}
                          >
                            Hiring Process
                          </motion.span>
                        </motion.h2>
                        
                        <motion.p 
                          className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          Simply describe your hiring needs in natural language. Our advanced AI will generate job descriptions, 
                          find perfect candidates, and provide intelligent screening—all through an intuitive conversation.
                        </motion.p>
                        
                        {/* Quick stats */}
                        <motion.div 
                          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                        >
                          <motion.div 
                            className="text-center group cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                          >
                            <div className="text-3xl font-bold text-primary-600 mb-1 group-hover:text-primary-700 transition-colors">10x</div>
                            <div className="text-sm text-gray-600 font-medium">Faster Hiring</div>
                          </motion.div>
                          <motion.div 
                            className="text-center group cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                          >
                            <div className="text-3xl font-bold text-purple-600 mb-1 group-hover:text-purple-700 transition-colors">95%</div>
                            <div className="text-sm text-gray-600 font-medium">Match Accuracy</div>
                          </motion.div>
                          <motion.div 
                            className="text-center group cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                          >
                            <div className="text-3xl font-bold text-green-600 mb-1 group-hover:text-green-700 transition-colors">24/7</div>
                            <div className="text-sm text-gray-600 font-medium">AI Availability</div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                      
                      {/* Three-step process */}
                      <motion.div 
                        className="grid md:grid-cols-3 gap-8 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <motion.div 
                          className="relative bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-3xl p-8 text-center group hover:shadow-2xl transition-all duration-500"
                          whileHover={{ scale: 1.02, y: -5 }}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <motion.div
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                            whileHover={{ rotate: 10 }}
                          >
                            <FileText className="w-10 h-10 text-white" />
                          </motion.div>
                          <div className="absolute top-4 right-4 text-6xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">1</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">Describe Your Need</h3>
                          <p className="text-gray-600 leading-relaxed">Simply tell our AI what kind of role you're hiring for in natural language</p>
                          <motion.div
                            className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium"
                            whileHover={{ x: 5 }}
                          >
                            <span>Try it now</span>
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          className="relative bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-3xl p-8 text-center group hover:shadow-2xl transition-all duration-500"
                          whileHover={{ scale: 1.02, y: -5 }}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                        >
                          <motion.div
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                            whileHover={{ rotate: -10 }}
                          >
                            <Users className="w-10 h-10 text-white" />
                          </motion.div>
                          <div className="absolute top-4 right-4 text-6xl font-bold text-purple-100 group-hover:text-purple-200 transition-colors">2</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">AI Finds Candidates</h3>
                          <p className="text-gray-600 leading-relaxed">Advanced algorithms search and match the perfect candidates instantly</p>
                          <motion.div
                            className="mt-4 inline-flex items-center gap-2 text-purple-600 font-medium"
                            whileHover={{ x: 5 }}
                          >
                            <span>See magic happen</span>
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          className="relative bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-3xl p-8 text-center group hover:shadow-2xl transition-all duration-500"
                          whileHover={{ scale: 1.02, y: -5 }}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 }}
                        >
                          <motion.div
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                            whileHover={{ rotate: 10 }}
                          >
                            <Target className="w-10 h-10 text-white" />
                          </motion.div>
                          <div className="absolute top-4 right-4 text-6xl font-bold text-green-100 group-hover:text-green-200 transition-colors">3</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">Smart Recommendations</h3>
                          <p className="text-gray-600 leading-relaxed">Get ranked candidates with detailed AI-powered insights and analysis</p>
                          <motion.div
                            className="mt-4 inline-flex items-center gap-2 text-green-600 font-medium"
                            whileHover={{ x: 5 }}
                          >
                            <span>View insights</span>
                            <BarChart3 className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                      
                      {/* Interactive getting started section */}
                      <motion.div 
                        className="bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 rounded-3xl p-10 shadow-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        <motion.div
                          className="text-center mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          <motion.h3 
                            className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3"
                            whileHover={{ scale: 1.02 }}
                          >
                            <motion.div
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              💬
                            </motion.div>
                            Start with any of these examples:
                          </motion.h3>
                          <p className="text-gray-600">Click on any example to try it instantly</p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <motion.button
                            className="bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 text-primary-800 px-6 py-4 rounded-2xl text-left transition-all duration-300 border border-primary-200 hover:border-primary-300 group"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInput("Find me a senior React developer with 5+ years in Mumbai")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">"Find me a senior React developer with 5+ years in Mumbai"</span>
                            </div>
                          </motion.button>
                          
                          <motion.button
                            className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-800 px-6 py-4 rounded-2xl text-left transition-all duration-300 border border-purple-200 hover:border-purple-300 group"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInput("I need a marketing manager for our fintech startup")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">"I need a marketing manager for our fintech startup"</span>
                            </div>
                          </motion.button>
                          
                          <motion.button
                            className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-800 px-6 py-4 rounded-2xl text-left transition-all duration-300 border border-green-200 hover:border-green-300 group"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInput("Looking for a data scientist with Python and ML experience")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">"Looking for a data scientist with Python and ML experience"</span>
                            </div>
                          </motion.button>
                          
                          <motion.button
                            className="bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-800 px-6 py-4 rounded-2xl text-left transition-all duration-300 border border-orange-200 hover:border-orange-300 group"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInput("Hire a product manager for B2B SaaS, remote OK")}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">"Hire a product manager for B2B SaaS, remote OK"</span>
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
              ) : (
                <>
                  {messages.map((message) => {
                    // Handle both old and new AI SDK message formats
                    let content = '';
                    if (message.parts && message.parts.length > 0) {
                      // New AI SDK 5.0 format
                      content = message.parts
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text)
                        .join('');
                    } else if ((message as any).content) {
                      // Fallback for older format
                      content = (message as any).content;
                    }
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-3xl rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white px-4 py-2'
                              : 'bg-white border shadow-sm overflow-hidden'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{content}</div>
                          ) : (
                            <div className="p-4">
                              {/* Use JobMarkdownMessage for job-related content */}
                              {(content.includes('**Title**') || content.includes('**Responsibilities**') || content.includes('**Requirements**')) ? (
                                <JobMarkdownMessage content={content} />
                              ) : (
                                <MarkdownMessage content={content} />
                              )}
                            </div>
                          )}
                          
                          {/* Debug info - remove in production */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-400 mt-2 px-4 pb-2 border-t bg-gray-50">
                              Status: {status} | Parts: {message.parts?.length || 0} | Role: {message.role}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Job Card */}
                  {currentJob && (
                    <JobCard job={currentJob} />
                  )}
                  
                  {/* Candidate Cards */}
                  {candidates.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Found {candidates.length} candidates
                      </h3>
                      <div className="grid gap-4">
                        {candidates.map((candidate) => (
                          <CandidateCard key={candidate.id} candidate={candidate} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Error Display */}
                  {error && (
                    <div className="flex justify-start">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-800">
                        <div className="font-semibold">Error occurred:</div>
                        <div className="text-sm">{error.message}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading Indicator */}
                  {(status === 'streaming' || status === 'submitted') && (
                    <div className="flex justify-start">
                      <div className="bg-white border shadow-sm rounded-lg px-4 py-2 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {status === 'streaming' ? 'AI is responding...' : 'Processing request...'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Enhanced Input */}
            <motion.div 
              className="border-t bg-gradient-to-r from-white via-gray-50 to-white p-8 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="relative">
                  <motion.div
                    className="flex gap-4 items-end"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-1 relative">
                      <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary-600" />
                        Describe your hiring needs
                      </label>
                      <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="E.g., 'Find me a senior React developer with 5+ years experience in Mumbai' or 'I need a marketing manager for our fintech startup'..."
                        className="flex-1 min-h-[80px] max-h-[160px] resize-none border-2 border-gray-200 focus:border-primary-400 focus:ring-primary-200 rounded-2xl px-6 py-4 text-lg placeholder:text-gray-400 shadow-sm transition-all duration-200"
                        disabled={status === 'streaming' || status === 'submitted'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }
                        }}
                      />
                      
                      {/* Status indicator */}
                      <AnimatePresence>
                        {(status === 'streaming' || status === 'submitted') && (
                          <motion.div
                            className="absolute right-4 top-16 flex items-center gap-2 text-primary-600"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Brain className="h-4 w-4" />
                            </motion.div>
                            <span className="text-sm font-medium">AI is thinking...</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
                        className="px-8 py-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg text-lg font-semibold transition-all duration-200"
                      >
                        {(status === 'streaming' || status === 'submitted') ? (
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-5 w-5" />
                            </motion.div>
                            <span>Processing</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ x: 2 }}
                          >
                            <Send className="h-5 w-5" />
                            <span>Send to AI</span>
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  {/* Enhanced suggestions */}
                  {!input && (
                    <motion.div 
                      className="mt-6 flex flex-wrap gap-3 justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {[
                        { icon: FileText, text: "Generate JD", color: "blue" },
                        { icon: Users, text: "Find Candidates", color: "purple" },
                        { icon: Target, text: "Screen & Rank", color: "green" },
                        { icon: Clock, text: "Schedule Interviews", color: "orange" }
                      ].map((item, index) => (
                        <motion.div
                          key={item.text}
                          className={`flex items-center gap-2 px-4 py-2 bg-${item.color}-50 text-${item.color}-700 rounded-full border border-${item.color}-200 text-sm font-medium`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <item.icon className="w-3 h-3" />
                          <span>{item.text}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trace Pane */}
      {showTracePane && (
        <div className="w-96 border-l bg-white flex flex-col">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">Audit Trail</h3>
            <p className="text-sm text-gray-600">AI agent actions and decisions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {traceLogs.map((log) => (
              <TraceLogItem key={log.id} log={log} />
            ))}
            {traceLogs.length === 0 && (
              <p className="text-gray-500 text-sm">No trace logs yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: JobData }) {
  return (
    <Card className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.one_liner}</p>
          </div>
        </div>
        <Badge variant="secondary">{job.level}</Badge>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          {job.department}
        </div>
        <Badge variant="outline">{job.employment_type}</Badge>
      </div>
      
      <Button variant="outline" className="w-full">
        View Full Job Description
      </Button>
    </Card>
  );
}

function CandidateCard({ candidate }: { candidate: CandidateData }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{candidate.name}</h4>
          <p className="text-gray-600">{candidate.current_position} at {candidate.current_company}</p>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {candidate.location}
            </span>
            <span>{candidate.years_of_experience} years exp</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{(candidate.similarity * 100).toFixed(0)}%</span>
          </div>
          {candidate.final_score && (
            <Badge variant="secondary">
              Score: {(candidate.final_score * 100).toFixed(0)}
            </Badge>
          )}
        </div>
      </div>
      
      {candidate.screening_summary && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">{candidate.screening_summary}</p>
        </div>
      )}
      
      {candidate.top_skills && candidate.top_skills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {candidate.top_skills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill.skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          View Profile
        </Button>
        <Button size="sm" className="flex-1">
          <Calendar className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </div>
    </Card>
  );
}

function TraceLogItem({ log }: { log: TraceLog }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="p-3 text-xs">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="font-semibold">{log.agent_name}</div>
          <div className="text-gray-500">{log.execution_time_ms}ms</div>
        </div>
        <div className="text-gray-400">
          {new Date(log.created_at).toLocaleTimeString()}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-2 space-y-2 text-xs">
          {log.prompt && (
            <div>
              <div className="font-semibold">Prompt:</div>
              <div className="bg-gray-50 p-2 rounded">{log.prompt}</div>
            </div>
          )}
          {log.tool_calls && (
            <div>
              <div className="font-semibold">Tool Calls:</div>
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.tool_calls, null, 2)}
              </pre>
            </div>
          )}
          {log.sql_executed && (
            <div>
              <div className="font-semibold">SQL:</div>
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                {log.sql_executed}
              </pre>
            </div>
          )}
          {log.output && (
            <div>
              <div className="font-semibold">Output:</div>
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

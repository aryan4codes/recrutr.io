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
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

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
          className="bg-gradient-to-r from-primary-500 to-primary-600 border-b px-6 py-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">
                🤖 Recruiter AI
              </h1>
              <p className="text-white/90 text-lg">
                Your intelligent hiring assistant
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowTracePane(!showTracePane)}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
            {showTracePane ? 'Hide' : 'Show'} Trace
          </Button>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full mb-6">
                          <MessageSquare className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-semibold text-primary-700">AI-Powered Recruiting</span>
                        </div>
                        
                        <h2 className="text-5xl font-bold font-display text-gray-900 mb-6">
                          Start Your <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">AI Hiring Journey</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                          Describe what you're looking for and let our AI handle the rest. 
                          From job descriptions to candidate screening—all in one conversation.
                        </p>
                      </motion.div>
                      
                      {/* Three-step process */}
                      <motion.div 
                        className="grid md:grid-cols-3 gap-8 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 5 }}
                          >
                            <FileText className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">1. Describe Your Need</h3>
                          <p className="text-gray-600">Tell the AI what kind of role you're hiring for</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: -5 }}
                          >
                            <Users className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">2. AI Finds Candidates</h3>
                          <p className="text-gray-600">Get perfectly matched candidates instantly</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: 5 }}
                          >
                            <Star className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">3. Smart Recommendations</h3>
                          <p className="text-gray-600">Receive ranked candidates with insights</p>
                        </div>
                      </motion.div>
                      
                      {/* Getting started prompt */}
                      <motion.div 
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          💬 Try saying something like:
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-primary-50 text-primary-800 px-4 py-3 rounded-xl">
                            "Find me a senior React developer with 5+ years in Mumbai"
                          </div>
                          <div className="bg-purple-50 text-purple-800 px-4 py-3 rounded-xl">
                            "I need a marketing manager for our fintech startup"
                          </div>
                          <div className="bg-green-50 text-green-800 px-4 py-3 rounded-xl">
                            "Looking for a data scientist with Python and ML experience"
                          </div>
                          <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl">
                            "Hire a product manager for B2B SaaS, remote OK"
                          </div>
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

            {/* Input */}
            <div className="border-t bg-white p-6 shadow-lg">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Describe the role you're hiring for..."
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <Button type="submit" disabled={isLoading || !input?.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
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

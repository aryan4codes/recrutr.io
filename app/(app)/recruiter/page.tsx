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
  Target
} from 'lucide-react';

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
  final_score: number;
  screening_summary: string;
  top_skills: string[];
}

interface TraceLogData {
  id: string;
  agent_name: string;
  prompt: string;
  tool_calls: any;
  output: any;
  created_at: string;
}

export default function RecruiterPage() {
  const [showTracePane, setShowTracePane] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobData | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [traceLogs, setTraceLogs] = useState<TraceLogData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/recruiter-agent',
    }),
    onFinish: (options) => {
      // Parse structured data from the AI response
      const content = options.message.parts
        ?.filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('') || '';

      // Look for structured data markers
      const jobMatch = content.match(/JOB_CREATED:\s*({[\s\S]*?})/);
      const candidatesMatch = content.match(/CANDIDATES_FOUND:\s*(\[[\s\S]*?\])/);
      const traceMatch = content.match(/TRACE_LOG:\s*({[\s\S]*?})/); 

      if (jobMatch) {
        try {
          const jobData = JSON.parse(jobMatch[1]);
          setCurrentJob(jobData);
        } catch (e) {
          console.error('Failed to parse job data:', e);
        }
      }

      if (candidatesMatch) {
        try {
          const candidatesData = JSON.parse(candidatesMatch[1]);
          setCandidates(candidatesData);
        } catch (e) {
          console.error('Failed to parse candidates data:', e);
        }
      }

      if (traceMatch) {
        try {
          const traceData = JSON.parse(traceMatch[1]);
          setTraceLogs(prev => [...prev, traceData]);
        } catch (e) {
          console.error('Failed to parse trace data:', e);
        }
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Auto-scroll to bottom when new messages arrive or when streaming completes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages.length, status]); // Trigger on message count change and status changes

  // Additional scroll trigger for when content changes during streaming
  useEffect(() => {
    if (status === 'streaming' || status === 'ready') {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Recruiting Copilot
                </h1>
                <p className="text-gray-600">
                  AI-powered hiring assistant with agents
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowTracePane(!showTracePane)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showTracePane ? 'Hide' : 'Show'} Trace
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6 border">
                          <Bot className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">AI-Powered Recruiting with agents</span>
                        </div>
                        
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                          AI Recruiting Assistant
                        </h2>
                        
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                          Describe your hiring needs in natural language. Our AI will generate job descriptions, 
                          find candidates, and provide intelligent screening through conversation.
                        </p>
                      </div>
                      
                      {/* Process steps */}
                      <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-4 bg-primary-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Describe Your Need</h3>
                          <p className="text-gray-600">Tell the AI what kind of role you're hiring for</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-4 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">2. AI Finds Candidates</h3>
                          <p className="text-gray-600">Advanced search and matching of candidates</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-4 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Smart Recommendations</h3>
                          <p className="text-gray-600">Ranked candidates with detailed analysis</p>
                        </div>
                      </div>
                      
                      {/* Example prompts */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Example prompts to get started:
                          </h3>
                          <p className="text-gray-600">Click on any example to try it</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          <button
                            className="bg-white border border-gray-200 hover:border-gray-300 px-4 py-3 rounded-lg text-left transition-colors"
                            onClick={() => setInput("Find me a senior React developer with 5+ years in Mumbai")}
                          >
                            <span className="text-sm text-gray-700">"Find me a senior React developer with 5+ years in Mumbai"</span>
                          </button>
                          
                          <button
                            className="bg-white border border-gray-200 hover:border-gray-300 px-4 py-3 rounded-lg text-left transition-colors"
                            onClick={() => setInput("I need a marketing manager for our fintech startup")}
                          >
                            <span className="text-sm text-gray-700">"I need a marketing manager for our fintech startup"</span>
                          </button>
                          
                          <button
                            className="bg-white border border-gray-200 hover:border-gray-300 px-4 py-3 rounded-lg text-left transition-colors"
                            onClick={() => setInput("Looking for a data scientist with Python and ML experience")}
                          >
                            <span className="text-sm text-gray-700">"Looking for a data scientist with Python and ML experience"</span>
                          </button>
                          
                          <button
                            className="bg-white border border-gray-200 hover:border-gray-300 px-4 py-3 rounded-lg text-left transition-colors"
                            onClick={() => setInput("Hire a product manager for B2B SaaS, remote OK")}
                          >
                            <span className="text-sm text-gray-700">"Hire a product manager for B2B SaaS, remote OK"</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ) : (
                <>
                  {messages.map((message, index) => {
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

                    // For streaming messages, don't render until we have substantial content
                    const isStreamingMessage = index === messages.length - 1 && status === 'streaming';
                    if (isStreamingMessage && content.length < 10) {
                      return null;
                    }
                    
                    return (
                      <div
                        key={`${message.id}-${content.length}`}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-3xl rounded-lg transition-all duration-200 ${
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
                              {content.includes('JOB_CREATED') || content.includes('job description') || content.includes('Job Title') ? (
                                <JobMarkdownMessage content={content} />
                              ) : (
                                <MarkdownMessage content={content} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Show typing indicator when AI is responding */}
                  {(status === 'streaming' || status === 'submitted') && (
                    <div className="flex justify-start">
                      <div className="bg-white border shadow-sm rounded-lg px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-sm">AI is responding...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-white p-6">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Describe the role you're hiring for..."
                      className="min-h-[60px] resize-none border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg px-4 py-3"
                      disabled={status === 'streaming' || status === 'submitted'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }
                      }}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  >
                    {(status === 'streaming' || status === 'submitted') ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {(status === 'streaming' || status === 'submitted') && (
                  <div className="mt-3 flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">AI is processing your request...</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Trace Pane */}
      {showTracePane && (
        <div className="w-96 border-l bg-white flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Execution Trace</h3>
            <p className="text-sm text-gray-600">View AI agent decision process</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {traceLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trace logs yet</p>
                <p className="text-xs">Start a conversation to see AI decision process</p>
              </div>
            ) : (
              <div className="space-y-4">
                {traceLogs.map((log) => (
                  <TraceCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Job Card Component
function JobCard({ job }: { job: JobData }) {
  return (
    <Card className="p-6 border-l-4 border-l-primary-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4">{job.one_liner}</p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{job.location}</span>
            </div>
            <Badge variant="secondary">{job.level}</Badge>
            <Badge variant="outline">{job.department}</Badge>
            <Badge variant="outline">{job.employment_type}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Candidate Card Component
function CandidateCard({ candidate }: { candidate: CandidateData }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-semibold text-gray-900">{candidate.name}</h4>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{Math.round(candidate.final_score)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-2">{candidate.current_position} at {candidate.current_company}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{candidate.years_of_experience} years exp</span>
            </div>
          </div>
          
          {candidate.screening_summary && (
            <p className="text-sm text-gray-700 mb-3">{candidate.screening_summary}</p>
          )}
          
          {candidate.top_skills && candidate.top_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.top_skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Trace Card Component
function TraceCard({ log }: { log: TraceLogData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          <span className="font-medium text-sm text-gray-900">{log.agent_name}</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(log.created_at).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {log.prompt?.substring(0, 100)}...
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs"
      >
        {isExpanded ? 'Hide Details' : 'Show Details'}
      </Button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <strong>Prompt:</strong>
            <pre className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
              {log.prompt}
            </pre>
          </div>
          
          {log.tool_calls && (
            <div>
              <strong>Tool Calls:</strong>
              <pre className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
                {JSON.stringify(log.tool_calls, null, 2)}
              </pre>
            </div>
          )}
          
          {log.output && (
            <div>
              <strong>Output:</strong>
              <pre className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
                {JSON.stringify(log.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
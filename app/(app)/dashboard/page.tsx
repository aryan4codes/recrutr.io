import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { MetricCard } from '@/components/ui/metric-card'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Users, 
  Brain, 
  Calendar, 
  BarChart3, 
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sage-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your recruiting pipeline.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/jobs/new">
                <Button className="shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div>
          <h2 className="text-lg font-semibold font-display text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Active Jobs"
              value="24"
              trend="up"
              trendValue="+12%"
              description="from last month"
              icon={TrendingUp}
              variant="gradient"
            />
            <MetricCard
              title="Total Candidates"
              value="1,247"
              trend="up"
              trendValue="+18%"
              description="this quarter"
              icon={Users}
            />
            <MetricCard
              title="Interviews Scheduled"
              value="156"
              trend="neutral"
              description="this week"
              icon={Clock}
            />
            <MetricCard
              title="Offers Extended"
              value="43"
              trend="up"
              trendValue="+8%"
              description="this month"
              icon={CheckCircle}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold font-display text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/jobs/new">
              <Card className="hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-primary-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">Create New Job</CardTitle>
                  <CardDescription>
                    Start a new job posting with AI assistance
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/candidates/upload">
              <Card className="hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-sage-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sage-500 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">Upload Resume</CardTitle>
                  <CardDescription>
                    Add new candidates to your pipeline
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/shortlist">
              <Card className="hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-peach-100 to-peach-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain className="w-6 h-6 text-peach-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-peach-500 transition-colors" />
                  </div>
                  <CardTitle className="text-lg">Generate Shortlist</CardTitle>
                  <CardDescription>
                    AI-powered candidate ranking and matching
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Features Grid */}
        <div>
          <h2 className="text-lg font-semibold font-display text-gray-900 mb-6">All Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* Job Management */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={Briefcase}
                title="Job Management"
                description="Create and manage job descriptions with AI assistance. Generate compelling JDs that attract the right candidates."
                badge="AI-Powered"
                gradient
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/jobs/new">
                    <Button className="w-full">Create New Job</Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full">View All Jobs</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>

            {/* Candidate Pipeline */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={Users}
                title="Candidate Pipeline"
                description="Upload resumes and manage candidate profiles. AI-powered parsing extracts key information automatically."
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/candidates/upload">
                    <Button className="w-full">Upload Resume</Button>
                  </Link>
                  <Link href="/candidates">
                    <Button variant="outline" className="w-full">View Candidates</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>

            {/* AI Shortlisting */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={Brain}
                title="AI Shortlisting"
                description="Rank candidates with AI-powered explanations. Get detailed reasoning for every recommendation."
                badge="Smart Matching"
                gradient
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/shortlist">
                    <Button className="w-full">Generate Shortlist</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>

            {/* Interview Scheduling */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={Calendar}
                title="Interview Scheduling"
                description="Design panels and schedule interviews automatically. Coordinate across teams with smart calendar integration."
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/schedule">
                    <Button className="w-full">Schedule Interviews</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>

            {/* Pipeline Operations */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={BarChart3}
                title="Pipeline Operations"
                description="Monitor SLAs and automated nudges. Keep your recruiting process on track with intelligent alerts."
                badge="Real-time"
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/ops">
                    <Button className="w-full">View Operations</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>

            {/* Audit & Export */}
            <div className="flex flex-col h-full">
              <FeatureCard
                icon={FileCheck}
                title="Audit & Export"
                description="Export hiring data and audit trails. Complete compliance reporting with detailed analytics."
                gradient
                className="h-full flex flex-col"
              >
                <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                  <Link href="/audit">
                    <Button className="w-full">Export Data</Button>
                  </Link>
                </div>
              </FeatureCard>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold font-display text-gray-900 mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-400 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New job "Senior Frontend Engineer" created</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-100 to-sage-200 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-sage-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">5 new candidates uploaded</p>
                    <p className="text-sm text-gray-500">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-peach-100 to-peach-200 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-peach-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AI shortlist generated for "Product Manager" role</p>
                    <p className="text-sm text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

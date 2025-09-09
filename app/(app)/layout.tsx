import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Briefcase, 
  Plus, 
  Users, 
  Upload, 
  Brain, 
  Calendar, 
  BarChart3, 
  FileCheck,
  Sparkles,
  MessageSquare,
  Bot,
  Star
} from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur border-r border-gray-100 shadow-soft">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 rounded-xl p-2 -m-2 hover:bg-gray-100/60 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display gradient-text">Recruiting Copilot</h1>
              <p className="text-xs text-gray-500 font-medium">AI-powered hiring</p>
            </div>
          </Link>
        </div>
        
        <nav className="px-6 space-y-1">
          <NavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs & Candidates</p>
          </div>
          <NavLink href="/jobs" label="All Jobs" icon={Briefcase} />
          <NavLink href="/jobs/new" label="Create Job" icon={Plus} />
          <NavLink href="/candidates" label="Candidates" icon={Users} />
          <NavLink href="/candidates/upload" label="Upload Resume" icon={Upload} />
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Tools</p>
          </div>
          <RecruiterAILink />
          {/* <NavLink href="/shortlist" label="AI Shortlist" icon={Brain} />
          <NavLink href="/schedule" label="Schedule" icon={Calendar} /> */}
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Analytics</p>
          </div>
          <NavLink href="/ops" label="Operations" icon={BarChart3} />
          <NavLink href="/audit" label="Audit & Export" icon={FileCheck} />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

interface NavLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-gray-100/50 group transition-all duration-200"
      >
        <Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" />
        <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      </Button>
    </Link>
  )
}

function RecruiterAILink() {
  return (
    <Link href="/recruiter">
      <div className="relative group mb-2">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-[1px] rounded-xl">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-auto py-4 px-4 bg-white hover:bg-gray-50 rounded-xl group transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                    🤖 Recruiter AI
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    AI-powered hiring assistant
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                NEW
              </div>
            </div>
          </Button>
        </div>
      </div>
    </Link>
  )
}

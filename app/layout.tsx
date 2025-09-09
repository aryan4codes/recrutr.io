import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recrutr - AI-Powered Hiring Platform',
  description: 'Transform your recruiting workflow with intelligent automation that finds, evaluates, and schedules the perfect candidates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-gray-50 font-sans antialiased")}>
        {children}
      </body>
    </html>
  )
}

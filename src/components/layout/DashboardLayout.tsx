'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

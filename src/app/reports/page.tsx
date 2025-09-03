import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import ReportsContent from '@/components/reports/ReportsContent'
import { Toaster } from 'react-hot-toast'

export default function ReportsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <ReportsContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}


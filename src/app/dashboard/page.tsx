import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import DashboardContent from '@/components/dashboard/DashboardContent'
import { Toaster } from 'react-hot-toast'

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

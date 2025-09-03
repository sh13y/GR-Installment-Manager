import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import UsersContent from '@/components/users/UsersContent'
import { Toaster } from 'react-hot-toast'

export default function UsersPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <UsersContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}


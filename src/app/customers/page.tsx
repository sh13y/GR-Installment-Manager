import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import CustomersContent from '@/components/customers/CustomersContent'
import { Toaster } from 'react-hot-toast'

export default function CustomersPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <CustomersContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import SalesContent from '@/components/sales/SalesContent'
import { Toaster } from 'react-hot-toast'

export default function SalesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <SalesContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

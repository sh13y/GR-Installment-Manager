import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import PaymentsContent from '@/components/payments/PaymentsContent'
import { Toaster } from 'react-hot-toast'

export default function PaymentsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <PaymentsContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import InventoryContent from '@/components/inventory/InventoryContent'
import { Toaster } from 'react-hot-toast'

export default function InventoryPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <InventoryContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

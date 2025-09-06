import { Metadata } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/components/providers/AuthProvider'
import ProductsContent from '@/components/products/ProductsContent'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Products - GR Manager',
  description: 'Manage product catalog with pricing and installment settings',
}

export default function ProductsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <ProductsContent />
      </DashboardLayout>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

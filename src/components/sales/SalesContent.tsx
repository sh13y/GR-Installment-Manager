'use client'

import { useState, useEffect } from 'react'
import { Sale, Customer, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { useData } from '@/components/providers/DataProvider'
import SalesTable from './SalesTable'
import SaleForm from './SaleForm'
import Modal from '@/components/ui/Modal'
import SearchFilter from '@/components/ui/SearchFilter'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/helpers'
import { calculateRemainingBalancesForSales } from '@/utils/balanceCalculations'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function SalesContent() {
  const [submitting, setSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'defaulted'>('all')
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [salesWithRealTimeBalance, setSalesWithRealTimeBalance] = useState<Sale[]>([])
  const { userProfile } = useAuth()
  const { sales, invalidateData, isLoading } = useData()

  // Calculate real-time remaining balance for all sales
  useEffect(() => {
    const calculateRealTimeBalances = async () => {
      if (sales.length === 0) {
        setSalesWithRealTimeBalance([])
        return
      }

      try {
        const salesWithBalance = await calculateRemainingBalancesForSales(sales)
        setSalesWithRealTimeBalance(salesWithBalance)
      } catch (error) {
        console.error('Error calculating real-time balances:', error)
        setSalesWithRealTimeBalance(sales)
      }
    }

    calculateRealTimeBalances()
  }, [sales])

  useEffect(() => {
    // Filter sales based on search term and status
    let filtered = salesWithRealTimeBalance

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.nic_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.phone?.includes(searchTerm)
      )
    }

    setFilteredSales(filtered)
  }, [salesWithRealTimeBalance, searchTerm, statusFilter])

  const handleCreateSale = () => {
    setEditingSale(null)
    setIsModalOpen(true)
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    setIsModalOpen(true)
  }

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return
    }

    if (userProfile?.role !== 'super_admin') {
      toast.error('Only super admin can delete sales')
      return
    }

    try {
      setSubmitting(true)
      
      // Check if sale has any payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id')
        .eq('sale_id', saleId)

      if (paymentsError) {
        toast.error('Error checking payments')
        console.error('Error:', paymentsError)
        return
      }

      if (payments && payments.length > 0) {
        toast.error('Cannot delete sale: Sale has payment records. Delete payments first.')
        return
      }

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)

      if (error) {
        toast.error('Error deleting sale')
        console.error('Error:', error)
        return
      }

      toast.success('Sale deleted successfully')
      invalidateData('sales')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      setSubmitting(true)
      
      if (editingSale) {
        // For editing, fetch all payments made to this sale and recalculate remaining balance
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .eq('sale_id', editingSale.id)

        if (paymentsError) {
          toast.error('Error fetching payment history')
          console.error('Error:', paymentsError)
          return
        }

        // Calculate total payments made (only from payments table)
        const totalPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
        
        // Recalculate remaining balance: new total amount minus all payments made
        const updatedRemainingBalance = Math.max(0, formData.total_amount - totalPayments)

        // Update existing sale with recalculated remaining balance
        const { error } = await supabase
          .from('sales')
          .update({
            ...formData,
            remaining_balance: updatedRemainingBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSale.id)

        if (error) {
          toast.error('Error updating sale')
          console.error('Error:', error)
          return
        }

        toast.success('Sale updated successfully')
      } else {
        // Create new sale
        const { error } = await supabase
          .from('sales')
          .insert([{
            ...formData,
            created_by: userProfile?.id
          }])

        if (error) {
          toast.error('Error creating sale')
          console.error('Error:', error)
          return
        }

        toast.success('Sale created successfully')
      }
      
      setIsModalOpen(false)
      setEditingSale(null)
      invalidateData('sales')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkCompleted = async (saleId: string) => {
    if (!confirm('Mark this sale as completed?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('sales')
        .update({ 
          status: 'completed',
          remaining_balance: 0
        })
        .eq('id', saleId)

      if (error) {
        toast.error('Error updating sale status')
        console.error('Error:', error)
        return
      }

      toast.success('Sale marked as completed')
      invalidateData('sales')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  // Calculate stats using real-time balance data
  const totalSales = salesWithRealTimeBalance.length
  const activeSales = salesWithRealTimeBalance.filter((s: Sale) => s.status === 'active').length
  const completedSales = salesWithRealTimeBalance.filter((s: Sale) => s.status === 'completed').length
  const totalRevenue = salesWithRealTimeBalance.reduce((sum: number, sale: Sale) => sum + (sale.total_amount || 0), 0)
  const outstandingBalance = salesWithRealTimeBalance
    .filter((s: Sale) => s.status === 'active')
    .reduce((sum: number, sale: Sale) => sum + (sale.remaining_balance || 0), 0)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Sales Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track tire sales and installment plans
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleCreateSale}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Sale
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {totalSales}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Sales
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <span className="text-2xl font-bold text-yellow-600">
                    {activeSales}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Active Sales
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-50">
                  <span className="text-2xl font-bold text-green-600">
                    {completedSales}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Completed
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-purple-50">
                  <span className="text-base font-bold text-purple-600 break-all">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-red-50">
                  <span className="text-base font-bold text-red-600 break-all">
                    {formatCurrency(outstandingBalance)}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Outstanding
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by customer name, NIC, or phone..."
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="defaulted">Defaulted</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <SalesTable
        sales={filteredSales}
        loading={submitting}
        onMarkCompleted={handleMarkCompleted}
        onEdit={handleEditSale}
        onDelete={handleDeleteSale}
        userRole={userProfile?.role}
      />

      {/* Sale Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSale(null)
        }}
        title={editingSale ? "Edit Sale" : "Create New Sale"}
        size="lg"
      >
        <SaleForm
          editingSale={editingSale}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingSale(null)
          }}
        />
      </Modal>
    </div>
  )
}

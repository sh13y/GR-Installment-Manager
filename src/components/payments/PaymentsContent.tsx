'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Payment, Sale } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { useData } from '@/components/providers/DataProvider'
import PaymentsTable from './PaymentsTable'
import PaymentForm from './PaymentForm'
import SaleSelector from './SaleSelector'
import Modal from '@/components/ui/Modal'
import SearchFilter from '@/components/ui/SearchFilter'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/helpers'
import { calculateRemainingBalancesForSales, calculateRemainingBalance } from '@/utils/balanceCalculations'

export default function PaymentsContent() {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [activeSalesWithBalance, setActiveSalesWithBalance] = useState<Sale[]>([])
  const { userProfile } = useAuth()
  const { payments, sales, invalidateData } = useData()
  
  const searchParams = useSearchParams()
  const saleIdFromUrl = searchParams.get('sale_id')

  // Get active sales from cached data
  const activeSales = sales.filter((sale: Sale) => sale.status === 'active')

  // Effect to calculate real-time balances for active sales
  useEffect(() => {
    const updateActiveSalesWithBalance = async () => {
      if (activeSales.length > 0) {
        const activeSalesData = sales.filter((sale: Sale) => sale.status === 'active')
        const salesWithBalance = await calculateRemainingBalancesForSales(activeSalesData)
        setActiveSalesWithBalance(salesWithBalance)
      } else {
        setActiveSalesWithBalance([])
      }
    }
    
    updateActiveSalesWithBalance()
  }, [sales, payments]) // Recalculate when sales or payments change

  useEffect(() => {
    // Auto-select sale if provided in URL
    if (saleIdFromUrl && activeSalesWithBalance.length > 0) {
      const sale = activeSalesWithBalance.find((s: Sale) => s.id === saleIdFromUrl)
      if (sale) {
        setSelectedSale(sale)
        setIsModalOpen(true)
      }
    }
  }, [saleIdFromUrl, activeSalesWithBalance])

  useEffect(() => {
    // Filter payments based on search term and date
    let filtered = payments

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const startDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(today.getDate() - 7)
          break
        case 'month':
          startDate.setDate(today.getDate() - 30)
          break
      }

      filtered = filtered.filter((payment: Payment) => 
        new Date(payment.payment_date) >= startDate
      )
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((payment: Payment) => {
        const sale = sales.find((s: Sale) => s.id === payment.sale_id)
        const customerName = sale?.customer?.full_name?.toLowerCase() || ''
        const searchLower = searchTerm.toLowerCase()
        
        return customerName.includes(searchLower) ||
               payment.payment_method?.toLowerCase().includes(searchLower) ||
               payment.amount?.toString().includes(searchTerm)
      })
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, dateFilter])

  const handleCreatePayment = (sale?: Sale) => {
    setSelectedSale(sale || null)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingPayment) {
        // Update existing payment
        const oldAmount = editingPayment.amount
        
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            amount: formData.amount,
            payment_method: formData.payment_method,
            notes: formData.notes,
            payment_date: formData.payment_date
          })
          .eq('id', editingPayment.id)

        if (paymentError) {
          toast.error('Error updating payment')
          console.error('Error:', paymentError)
          return
        }

        // Update sale remaining balance using real-time calculation
        const sale = sales.find((s: Sale) => s.id === formData.sale_id)
        if (sale) {
          const newRemainingBalance = await calculateRemainingBalance(sale.id, sale.total_amount)
          const newStatus = newRemainingBalance === 0 ? 'completed' : 'active'

          const { error: updateError } = await supabase
            .from('sales')
            .update({
              remaining_balance: newRemainingBalance,
              status: newStatus
            })
            .eq('id', sale.id)

          if (updateError) {
            toast.error('Error updating sale balance')
            console.error('Error:', updateError)
            return
          }
        }

        toast.success('Payment updated successfully')
      } else {
        // Create new payment
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert([{
            ...formData,
            created_by: userProfile?.id
          }])
          .select()
          .single()

        if (paymentError) {
          toast.error('Error creating payment')
          console.error('Error:', paymentError)
          return
        }

        // Update sale remaining balance using real-time calculation
        const sale = activeSalesWithBalance.find((s: Sale) => s.id === formData.sale_id)
        if (sale) {
          const newRemainingBalance = await calculateRemainingBalance(sale.id, sale.total_amount)
          const newStatus = newRemainingBalance === 0 ? 'completed' : 'active'

          const { error: updateError } = await supabase
            .from('sales')
            .update({
              remaining_balance: newRemainingBalance,
              status: newStatus
            })
            .eq('id', sale.id)

          if (updateError) {
            toast.error('Error updating sale balance')
            console.error('Error:', updateError)
            return
          }

          if (newRemainingBalance === 0) {
            toast.success('Payment recorded! Sale completed.')
          } else {
            toast.success('Payment recorded successfully')
          }
        }
      }

      setIsModalOpen(false)
      setSelectedSale(null)
      setEditingPayment(null)
      invalidateData() // Refresh both sales and payments data
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleEditPayment = (payment: Payment) => {
    if (userProfile?.role !== 'super_admin') {
      toast.error('Only super administrators can edit payments')
      return
    }
    
    const sale = sales.find((s: Sale) => s.id === payment.sale_id)
    if (sale) {
      setSelectedSale(sale)
      setEditingPayment(payment)
      setIsModalOpen(true)
    }
  }

  const handleDeletePayment = async (payment: Payment) => {
    if (userProfile?.role !== 'super_admin') {
      toast.error('Only super administrators can delete payments')
      return
    }

    if (!confirm(`Are you sure you want to delete this payment of ${formatCurrency(payment.amount)}? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Delete the payment
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id)

      if (deleteError) {
        toast.error('Error deleting payment')
        console.error('Error:', deleteError)
        return
      }

      // Update the sale's remaining balance using real-time calculation
      const sale = sales.find((s: Sale) => s.id === payment.sale_id)
      if (sale) {
        const newRemainingBalance = await calculateRemainingBalance(sale.id, sale.total_amount)
        const newStatus = newRemainingBalance > 0 ? 'active' : 'completed'

        const { error: updateError } = await supabase
          .from('sales')
          .update({
            remaining_balance: newRemainingBalance,
            status: newStatus
          })
          .eq('id', payment.sale_id)

        if (updateError) {
          toast.error('Error updating sale balance')
          console.error('Error:', updateError)
          return
        }
      }

      toast.success('Payment deleted successfully')
      invalidateData() // Refresh both sales and payments data
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const todayPayments = payments.filter((p: Payment) => {
    const today = new Date().toISOString().split('T')[0]
    return p.payment_date === today
  })
  
  const todayTotal = todayPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
  const todayCount = todayPayments.length
  
  const weekPayments = payments.filter((p: Payment) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(p.payment_date) >= weekAgo
  })
  
  const weekTotal = weekPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
  const totalOutstanding = activeSalesWithBalance.reduce((sum: number, s: Sale) => sum + (s.remaining_balance || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Payment Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track daily installment payments and collections
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => handleCreatePayment()}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Collections</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(todayTotal)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Payments</dt>
                  <dd className="text-lg font-medium text-gray-900">{todayCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Week's Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(weekTotal)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Sales ({activeSalesWithBalance.length})
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalOutstanding)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Selector - Only show if there are active sales */}
      {activeSalesWithBalance.length > 0 && (
        <SaleSelector
          sales={activeSalesWithBalance} 
          onSelectSale={handleCreatePayment}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search payments..."
            />
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="border-gray-300 rounded-md shadow-sm text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <PaymentsTable
        payments={filteredPayments}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        loading={loading}
      />

      {/* Payment Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editingPayment ? 'Edit Payment' : 'Record Payment'}
        onClose={() => {
        setIsModalOpen(false)
        setSelectedSale(null)
        setEditingPayment(null)
      }}>
        <PaymentForm
          selectedSale={selectedSale}
          editingPayment={editingPayment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedSale(null)
            setEditingPayment(null)
          }}
          activeSales={activeSalesWithBalance}
        />
      </Modal>
    </div>
  )
}
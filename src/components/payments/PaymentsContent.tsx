'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Payment, Sale } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import PaymentsTable from './PaymentsTable'
import PaymentForm from './PaymentForm'
import SaleSelector from './SaleSelector'
import Modal from '@/components/ui/Modal'
import SearchFilter from '@/components/ui/SearchFilter'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/helpers'

export default function PaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeSales, setActiveSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const { userProfile } = useAuth()
  
  const searchParams = useSearchParams()
  const saleIdFromUrl = searchParams.get('sale_id')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Auto-select sale if provided in URL
    if (saleIdFromUrl && activeSales.length > 0) {
      const sale = activeSales.find(s => s.id === saleIdFromUrl)
      if (sale) {
        setSelectedSale(sale)
        setIsModalOpen(true)
      }
    }
  }, [saleIdFromUrl, activeSales])

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

      filtered = filtered.filter(payment => 
        new Date(payment.payment_date) >= startDate
      )
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.sales?.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.sales?.customers?.nic_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.sales?.customers?.phone?.includes(searchTerm)
      )
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, dateFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [paymentsResult, salesResult] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            sales (
              id,
              total_amount,
              remaining_balance,
              customers (
                id,
                full_name,
                nic_number,
                phone
              ),
              products (
                name
              )
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('sales')
          .select(`
            *,
            customers (
              id,
              full_name,
              nic_number,
              phone
            ),
            products (
              name,
              daily_installment
            )
          `)
          .eq('status', 'active')
          .gt('remaining_balance', 0)
          .order('created_at', { ascending: false })
      ])

      if (paymentsResult.error) {
        toast.error('Error fetching payments')
        console.error('Error:', paymentsResult.error)
        return
      }

      if (salesResult.error) {
        toast.error('Error fetching active sales')
        console.error('Error:', salesResult.error)
        return
      }

      setPayments(paymentsResult.data || [])
      setActiveSales(salesResult.data || [])
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = (sale?: Sale) => {
    setSelectedSale(sale || null)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      // Start a transaction to create payment and update sale balance
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

      // Update sale remaining balance
      const sale = activeSales.find(s => s.id === formData.sale_id)
      if (sale) {
        const newBalance = Math.max(0, sale.remaining_balance - formData.amount)
        const newStatus = newBalance === 0 ? 'completed' : 'active'

        const { error: updateError } = await supabase
          .from('sales')
          .update({ 
            remaining_balance: newBalance,
            status: newStatus
          })
          .eq('id', formData.sale_id)

        if (updateError) {
          toast.error('Error updating sale balance')
          console.error('Error:', updateError)
          return
        }

        if (newBalance === 0) {
          toast.success('Payment recorded! Sale completed.')
        } else {
          toast.success('Payment recorded successfully')
        }
      }

      setIsModalOpen(false)
      setSelectedSale(null)
      fetchData()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  // Calculate stats
  const todayPayments = payments.filter(p => {
    const today = new Date().toISOString().split('T')[0]
    return p.payment_date === today
  })
  
  const todayTotal = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const todayCount = todayPayments.length
  
  const weekPayments = payments.filter(p => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(p.payment_date) >= weekAgo
  })
  
  const weekTotal = weekPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalOutstanding = activeSales.reduce((sum, s) => sum + (s.remaining_balance || 0), 0)

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
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-50">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(todayTotal)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Today's Collections
                </p>
                <p className="text-xs text-gray-400">
                  {todayCount} payments
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(weekTotal)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  This Week
                </p>
                <p className="text-xs text-gray-400">
                  {weekPayments.length} payments
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
                    {activeSales.length}
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
                <div className="p-3 rounded-lg bg-red-50">
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(totalOutstanding)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Outstanding Balance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sales Quick Actions */}
      {activeSales.length > 0 && (
        <SaleSelector 
          sales={activeSales} 
          onSelectSale={handleCreatePayment}
        />
      )}

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
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="form-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <PaymentsTable
        payments={filteredPayments}
        loading={loading}
      />

      {/* Payment Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSale(null)
        }}
        title="Record Payment"
        size="lg"
      >
        <PaymentForm
          activeSales={activeSales}
          selectedSale={selectedSale}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedSale(null)
          }}
        />
      </Modal>
    </div>
  )
}

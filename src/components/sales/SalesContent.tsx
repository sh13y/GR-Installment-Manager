'use client'

import { useState, useEffect } from 'react'
import { Sale, Customer, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import SalesTable from './SalesTable'
import SaleForm from './SaleForm'
import Modal from '@/components/ui/Modal'
import SearchFilter from '@/components/ui/SearchFilter'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/utils/helpers'

export default function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'defaulted'>('all')
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const { userProfile } = useAuth()

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    // Filter sales based on search term and status
    let filtered = sales

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
  }, [sales, searchTerm, statusFilter])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
            id,
            name,
            selling_price,
            service_charge
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error fetching sales')
        console.error('Error:', error)
        return
      }

      setSales(data || [])
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSale = () => {
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData: any) => {
    try {
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
      setIsModalOpen(false)
      fetchSales()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
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
      fetchSales()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  // Calculate stats
  const totalSales = sales.length
  const activeSales = sales.filter(s => s.status === 'active').length
  const completedSales = sales.filter(s => s.status === 'completed').length
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
  const outstandingBalance = sales
    .filter(s => s.status === 'active')
    .reduce((sum, sale) => sum + (sale.remaining_balance || 0), 0)

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
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
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
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(outstandingBalance)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
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
        loading={loading}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* Sale Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Sale"
        size="lg"
      >
        <SaleForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

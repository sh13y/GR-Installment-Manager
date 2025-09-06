'use client'

import { useState, useEffect } from 'react'
import { Customer } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { useData } from '@/components/providers/DataProvider'
import CustomersTable from './CustomersTable'
import CustomerForm from './CustomerForm'
import CustomerPaymentHistory from './CustomerPaymentHistory'
import Modal from '@/components/ui/Modal'
import SearchFilter from '@/components/ui/SearchFilter'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CustomersContent() {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingHistoryCustomer, setViewingHistoryCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const { userProfile } = useAuth()
  const { customers, invalidateData } = useData()

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer => 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.nic_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  const handleCreateCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleViewHistory = (customer: Customer) => {
    setViewingHistoryCustomer(customer)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      // First check if customer has any sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id')
        .eq('customer_id', customerId)

      if (salesError) {
        toast.error('Error checking customer sales')
        console.error('Error:', salesError)
        return
      }

      if (sales && sales.length > 0) {
        toast.error('Cannot delete customer with existing sales records. Please deactivate the customer instead.')
        return
      }

      // Check if customer has payments (through sales)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id')
        .eq('sale_id', customerId)

      if (paymentsError) {
        console.error('Error checking payments:', paymentsError)
      }

      if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        return
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        if (error.code === '23503') {
          toast.error('Cannot delete customer: Customer has related records (sales/payments). Please deactivate the customer instead.')
        } else {
          toast.error('Error deleting customer')
        }
        console.error('Error:', error)
        return
      }

      toast.success('Customer deleted successfully')
      invalidateData('customers')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleToggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this customer?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: !currentStatus })
        .eq('id', customerId)

      if (error) {
        toast.error('Error updating customer status')
        console.error('Error:', error)
        return
      }

      toast.success(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      invalidateData('customers')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id)

        if (error) {
          toast.error('Error updating customer')
          console.error('Error:', error)
          return
        }

        toast.success('Customer updated successfully')
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...formData,
            created_by: userProfile?.id
          }])

        if (error) {
          toast.error('Error creating customer')
          console.error('Error:', error)
          return
        }

        toast.success('Customer created successfully')
      }

      setIsModalOpen(false)
      setEditingCustomer(null)
      invalidateData('customers')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Customers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer registrations and profiles
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleCreateCustomer}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search customers by name, NIC, or phone..."
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {customers.length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Customers
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
                    {customers.filter(c => c.registration_fee_paid).length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Registration Paid
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
                    {customers.filter(c => c.is_active).length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Active Customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <CustomersTable
        customers={filteredCustomers}
        loading={loading}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onToggleStatus={handleToggleCustomerStatus}
        onViewHistory={handleViewHistory}
      />

      {/* Customer Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCustomer(null)
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingCustomer(null)
          }}
        />
      </Modal>

      {/* Customer Payment History Modal */}
      {viewingHistoryCustomer && (
        <CustomerPaymentHistory
          customer={viewingHistoryCustomer}
          onClose={() => setViewingHistoryCustomer(null)}
        />
      )}
    </div>
  )
}

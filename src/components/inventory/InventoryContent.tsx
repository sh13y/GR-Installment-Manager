'use client'

import { useState, useEffect } from 'react'
import { Inventory, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import InventoryTable from './InventoryTable'
import StockUpdateForm from './StockUpdateForm'
import Modal from '@/components/ui/Modal'
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function InventoryContent() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const { userProfile } = useAuth()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            id,
            name,
            cost_price,
            selling_price,
            is_active
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error fetching inventory')
        console.error('Error:', error)
        return
      }

      setInventory(data || [])
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = (item: Inventory) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAddStock = () => {
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedItem) {
        // Update existing inventory
        const { error } = await supabase
          .from('inventory')
          .update({
            quantity_in_stock: formData.quantity_in_stock,
            reorder_level: formData.reorder_level,
            last_restocked: formData.last_restocked || new Date().toISOString().split('T')[0],
          })
          .eq('id', selectedItem.id)

        if (error) {
          toast.error('Error updating inventory')
          console.error('Error:', error)
          return
        }

        toast.success('Inventory updated successfully')
      } else {
        // Create new inventory record
        const { error } = await supabase
          .from('inventory')
          .insert([formData])

        if (error) {
          toast.error('Error creating inventory record')
          console.error('Error:', error)
          return
        }

        toast.success('Inventory record created successfully')
      }

      setIsModalOpen(false)
      setSelectedItem(null)
      fetchInventory()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  // Calculate stats
  const totalProducts = inventory.length
  const lowStockItems = inventory.filter(item => 
    item.quantity_in_stock <= item.reorder_level
  ).length
  const outOfStockItems = inventory.filter(item => 
    item.quantity_in_stock === 0
  ).length
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.quantity_in_stock * (item.product?.cost_price || 0)), 0
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Inventory Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track tire inventory and stock levels
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleAddStock}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {totalProducts}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${lowStockItems > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                  <span className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {lowStockItems}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Low Stock Items
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${outOfStockItems > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <span className={`text-2xl font-bold ${outOfStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {outOfStockItems}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Out of Stock
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
                    ₹{totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Value
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="card-body">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-yellow-700">
                  {lowStockItems} product{lowStockItems !== 1 ? 's are' : ' is'} running low on stock. 
                  Consider restocking soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable
        inventory={inventory}
        loading={loading}
        onUpdateStock={handleUpdateStock}
      />

      {/* Stock Update Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(null)
        }}
        title={selectedItem ? 'Update Stock' : 'Add New Product'}
        size="lg"
      >
        <StockUpdateForm
          item={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedItem(null)
          }}
        />
      </Modal>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { APP_CONFIG } from '@/utils/constants'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeSlashIcon, 
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'
import SearchFilter from '@/components/ui/SearchFilter'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

type SortField = 'name' | 'cost_price' | 'selling_price' | 'profit' | 'service_charge' | 'daily_installment' | 'created_at'
type SortOrder = 'asc' | 'desc'

export default function ProductsTable({ products, onEdit, onDelete, onToggleStatus }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any
    let bValue: any

    // Special handling for profit calculation
    if (sortField === 'profit') {
      aValue = a.selling_price - a.cost_price
      bValue = b.selling_price - b.cost_price
    } else {
      aValue = a[sortField as keyof Product]
      bValue = b[sortField as keyof Product]
    }

    // Handle date sorting
    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return `${APP_CONFIG.CURRENCY_SYMBOL}${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search products..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Product Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('cost_price')}
              >
                <div className="flex items-center gap-1">
                  Cost Price
                  <SortIcon field="cost_price" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('selling_price')}
              >
                <div className="flex items-center gap-1">
                  Selling Price
                  <SortIcon field="selling_price" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('profit')}
              >
                <div className="flex items-center gap-1">
                  Profit
                  <SortIcon field="profit" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('service_charge')}
              >
                <div className="flex items-center gap-1">
                  Service Charge
                  <SortIcon field="service_charge" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('daily_installment')}
              >
                <div className="flex items-center gap-1">
                  Daily Installment
                  <SortIcon field="daily_installment" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Max Installments
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Status
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Created
                  <SortIcon field="created_at" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' ? 'No products found matching your criteria' : 'No products yet'}
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => {
                const profit = product.selling_price - product.cost_price
                const totalCustomerPayment = product.selling_price + product.service_charge
                
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total Payment: {formatCurrency(totalCustomerPayment)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatCurrency(product.cost_price)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatCurrency(product.selling_price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatCurrency(product.service_charge)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatCurrency(product.daily_installment)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {product.max_installments}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit product"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(product.id, product.is_active)}
                          className={`p-1 ${product.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                          title={product.is_active ? 'Deactivate product' : 'Activate product'}
                        >
                          {product.is_active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete product"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {sortedProducts.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <span>
            Showing {sortedProducts.length} of {products.length} products
          </span>
          <span>
            {products.filter(p => p.is_active).length} active, {products.filter(p => !p.is_active).length} inactive
          </span>
        </div>
      )}
    </div>
  )
}

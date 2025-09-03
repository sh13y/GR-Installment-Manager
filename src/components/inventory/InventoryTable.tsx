import { Inventory } from '@/types'
import { formatDate, formatCurrency } from '@/utils/helpers'
import { PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface InventoryTableProps {
  inventory: Inventory[]
  loading: boolean
  onUpdateStock: (item: Inventory) => void
}

export default function InventoryTable({ 
  inventory, 
  loading, 
  onUpdateStock 
}: InventoryTableProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a product to inventory.</p>
        </div>
      </div>
    )
  }

  const getStockStatus = (item: Inventory) => {
    if (item.quantity_in_stock === 0) {
      return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' }
    } else if (item.quantity_in_stock <= item.reorder_level) {
      return { status: 'low-stock', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    } else {
      return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' }
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Product</th>
              <th className="table-header-cell">Current Stock</th>
              <th className="table-header-cell">Reorder Level</th>
              <th className="table-header-cell">Unit Cost</th>
              <th className="table-header-cell">Total Value</th>
              <th className="table-header-cell">Last Restocked</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item)
              const totalValue = item.quantity_in_stock * (item.product?.cost_price || 0)
              
              return (
                <tr key={item.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cost: {formatCurrency(item.product?.cost_price || 0)}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold ${stockStatus.color}`}>
                        {item.quantity_in_stock}
                      </span>
                      {item.quantity_in_stock <= item.reorder_level && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {item.reorder_level}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900 text-currency">
                      {formatCurrency(item.product?.cost_price || 0)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900 text-currency">
                      {formatCurrency(totalValue)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">
                      {item.last_restocked ? formatDate(item.last_restocked) : 'Never'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.status === 'out-of-stock' && 'Out of Stock'}
                      {stockStatus.status === 'low-stock' && 'Low Stock'}
                      {stockStatus.status === 'in-stock' && 'In Stock'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => onUpdateStock(item)}
                      className="text-primary-600 hover:text-primary-700 p-1"
                      title="Update stock"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Products: </span>
            <span className="font-semibold text-gray-900">{inventory.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Stock: </span>
            <span className="font-semibold text-gray-900">
              {inventory.reduce((sum, item) => sum + item.quantity_in_stock, 0)} units
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Value: </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(inventory.reduce((sum, item) => 
                sum + (item.quantity_in_stock * (item.product?.cost_price || 0)), 0
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

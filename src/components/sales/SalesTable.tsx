import { Sale } from '@/types'
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers'
import { CheckCircleIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

interface SalesTableProps {
  sales: Sale[]
  loading: boolean
  onMarkCompleted: (saleId: string) => void
  onEdit?: (sale: Sale) => void
  onDelete?: (saleId: string) => void
  userRole?: string
}

export default function SalesTable({ 
  sales, 
  loading, 
  onMarkCompleted,
  onEdit,
  onDelete,
  userRole
}: SalesTableProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new sale.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Product</th>
              <th className="table-header-cell">Qty</th>
              <th className="table-header-cell">Sale Date</th>
              <th className="table-header-cell">Initial Payment</th>
              <th className="table-header-cell">Total Amount</th>
              <th className="table-header-cell">Remaining Balance</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {sale.customer?.full_name || 'Unknown Customer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      NIC: {sale.customer?.nic_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {sale.customer?.phone}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm text-gray-900">
                    {sale.product?.name || 'FM Tyre'}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.quantity || 1}
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">
                    {formatDate(sale.sale_date)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm font-medium text-gray-900 text-currency">
                    {formatCurrency(sale.initial_payment)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm font-medium text-gray-900 text-currency">
                    {formatCurrency(sale.total_amount)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`text-sm font-medium text-currency ${
                    sale.remaining_balance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(sale.remaining_balance)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${getStatusColor(sale.status)}`}>
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    {sale.status === 'active' && sale.remaining_balance <= 0 && (
                      <button
                        onClick={() => onMarkCompleted(sale.id)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Mark as completed"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={`/payments?sale_id=${sale.id}`}
                      className="text-primary-600 hover:text-primary-700 p-1"
                      title="View payments"
                    >
                      <ClockIcon className="h-4 w-4" />
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(sale)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit sale"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && userRole === 'super_admin' && (
                      <button
                        onClick={() => onDelete(sale.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete sale (Super Admin only)"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

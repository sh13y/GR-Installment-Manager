import { Payment } from '@/types'
import { formatDate, formatCurrency } from '@/utils/helpers'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/AuthProvider'

interface PaymentsTableProps {
  payments: Payment[]
  loading: boolean
  onEdit?: (payment: Payment) => void
  onDelete?: (payment: Payment) => void
}

export default function PaymentsTable({ payments, loading, onEdit, onDelete }: PaymentsTableProps) {
  const { userProfile } = useAuth()
  const canDelete = userProfile?.role === 'super_admin'

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">No payments match your current filters.</p>
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
              <th className="table-header-cell">Payment Date</th>
              <th className="table-header-cell">Sale #</th>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Product</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Payment Method</th>
              <th className="table-header-cell">Notes</th>
              <th className="table-header-cell">Recorded At</th>
              {(onEdit || onDelete) && (
                <th className="table-header-cell">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="table-row">
                <td className="table-cell">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(payment.payment_date)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm font-medium text-blue-600">
                    {(payment as any).sales?.sale_number || 'No Number'}
                  </span>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {(payment as any).sales?.customers?.full_name || 'Unknown Customer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      NIC: {(payment as any).sales?.customers?.nic_number || 'No NIC'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(payment as any).sales?.customers?.phone || 'No Phone'}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">
                    {(payment as any).sales?.products?.name || 'FM Tyre'}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm font-semibold text-green-600 text-currency">
                    {formatCurrency(payment.amount)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="badge badge-info capitalize">
                    {payment.payment_method.replace('_', ' ')}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-500">
                    {payment.notes || '-'}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-500">
                    {formatDate(payment.created_at)}
                  </span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(payment)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit payment"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && canDelete && (
                        <button
                          onClick={() => onDelete(payment)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete payment (Super Admin only)"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Total {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </span>
          <span className="font-semibold text-gray-900">
            Total Amount: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}

import { Customer } from '@/types'
import { formatDate } from '@/utils/helpers'
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, NoSymbolIcon, ClockIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
  onToggleStatus?: (customerId: string, currentStatus: boolean) => void
  onViewHistory?: (customer: Customer) => void
}

export default function CustomersTable({ 
  customers, 
  loading, 
  onEdit, 
  onDelete,
  onToggleStatus,
  onViewHistory 
}: CustomersTableProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new customer.</p>
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
              <th className="table-header-cell">Customer Info</th>
              <th className="table-header-cell">Contact</th>
              <th className="table-header-cell">Registration</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Created</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      NIC: {customer.nic_number}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm text-gray-900">
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {customer.registration_fee_paid ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm ${
                      customer.registration_fee_paid 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {customer.registration_fee_paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    customer.is_active 
                      ? 'badge-success' 
                      : 'badge-secondary'
                  }`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">
                    {formatDate(customer.created_at)}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-primary-600 hover:text-primary-700 p-1"
                      title="Edit customer"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {onViewHistory && (
                      <button
                        onClick={() => onViewHistory(customer)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="View payment history"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(customer.id, customer.is_active)}
                        className={`p-1 ${
                          customer.is_active 
                            ? 'text-orange-600 hover:text-orange-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                        title={customer.is_active ? 'Deactivate customer' : 'Activate customer'}
                      >
                        {customer.is_active ? (
                          <NoSymbolIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete customer (only if no sales)"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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

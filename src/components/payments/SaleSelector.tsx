import { Sale } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface SaleSelectorProps {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
}

export default function SaleSelector({ sales, onSelectSale }: SaleSelectorProps) {
  // Show only first 6 sales, prioritize by remaining balance and days since last payment
  const prioritizedSales = sales
    .sort((a, b) => {
      // Sort by remaining balance (higher first) and then by creation date (older first)
      const balanceDiff = (b.remaining_balance || 0) - (a.remaining_balance || 0)
      if (balanceDiff !== 0) return balanceDiff
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    .slice(0, 6)

  if (sales.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Quick Payment Entry</h3>
        <p className="text-sm text-gray-500">Click on any active sale to record a payment</p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prioritizedSales.map((sale) => (
            <div
              key={sale.id}
              onClick={() => onSelectSale(sale)}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                    {sale.customer?.full_name || 'Unknown Customer'}
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    NIC: {sale.customer?.nic_number || 'No NIC'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {sale.customer?.phone || 'No Phone'}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <CurrencyDollarIcon className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Outstanding:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(sale.remaining_balance)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sale Number:</span>
                  <span className="font-medium text-blue-600">
                    {sale.sale_number || 'No Number'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sale Date:</span>
                  <span>{formatDate(sale.sale_date)}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total Sale:</span>
                  <span>{formatCurrency(sale.total_amount)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>
                    {Math.ceil(sale.remaining_balance / (sale.product?.daily_installment || 57))} days remaining
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {sales.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {prioritizedSales.length} of {sales.length} active sales. 
              Use the "Record Payment" button above to see all sales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Customer, Sale, Payment } from '@/types'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { calculateRemainingBalancesForSales } from '@/utils/balanceCalculations'
import { XMarkIcon, CreditCardIcon, ShoppingCartIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { PlayIcon } from '@heroicons/react/24/solid'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CustomerPaymentHistoryProps {
  customer: Customer
  onClose: () => void
}

interface PaymentHistoryItem {
  id: string
  type: 'registration' | 'payment'
  amount: number
  date: string
  description: string
  sale_id?: string
  balance_after?: number
}

export default function CustomerPaymentHistory({ customer, onClose }: CustomerPaymentHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<PaymentHistoryItem[]>([])
  const [salesWithBalances, setSalesWithBalances] = useState<Sale[]>([])
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalDue: 0,
    activeSales: 0,
    completedSales: 0
  })

  useEffect(() => {
    fetchPaymentHistory()
  }, [customer.id])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)

      // First, fetch customer's sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total_amount,
          initial_payment,
          status,
          created_at,
          sale_date,
          products (name)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Error fetching sales:', salesError)
        return
      }

      // Get the sale IDs for this customer
      const saleIds = (sales || []).map(sale => sale.id)

      // Then fetch payments for those sales
      let payments: any[] = []
      if (saleIds.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            payment_date,
            created_at,
            sale_id,
            sales (
              id,
              total_amount,
              products (name)
            )
          `)
          .in('sale_id', saleIds)
          .order('created_at', { ascending: false })

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError)
          return
        }

        payments = paymentsData || []
      }

      // Build payment history
      const historyItems: PaymentHistoryItem[] = []

      // Add registration fee if paid
      if (customer.registration_fee_paid) {
        historyItems.push({
          id: `reg-${customer.id}`,
          type: 'registration',
          amount: 250, // Registration fee amount
          date: customer.registration_date,
          description: 'Registration Fee Payment',
        })
      }

      // Add initial payments from sales
      (sales || []).forEach(sale => {
        if (sale.initial_payment && sale.initial_payment > 0) {
          const productName = Array.isArray(sale.products) && sale.products.length > 0 
            ? sale.products[0].name 
            : (sale.products as any)?.name || 'Product'
          
          historyItems.push({
            id: `initial-${sale.id}`,
            type: 'payment',
            amount: sale.initial_payment,
            date: sale.sale_date || sale.created_at,
            description: `Initial Payment for ${productName}`,
            sale_id: sale.id,
          })
        }
      })

      // Add installment payments
      payments.forEach(payment => {
        const sale = payment.sales as any
        historyItems.push({
          id: payment.id,
          type: 'payment',
          amount: payment.amount,
          date: payment.payment_date || payment.created_at,
          description: `Installment Payment for ${sale?.products?.name || 'Product'}`,
          sale_id: sale?.id,
        })
      })

      // Sort by date (newest first)
      historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Calculate summary using centralized balance calculation system
      const totalPaid = historyItems.reduce((sum, item) => sum + item.amount, 0)
      
      // Use centralized balance calculations for consistency
      // Map the sales data to match Sale interface for balance calculations
      const salesForCalculation: Sale[] = (sales || []).map(sale => ({
        id: sale.id,
        sale_number: `SALE-${sale.id.slice(0, 8)}`,
        customer_id: customer.id,
        product_id: 'unknown',
        quantity: 1,
        sale_date: sale.sale_date || sale.created_at,
        initial_payment: sale.initial_payment || 0,
        total_amount: sale.total_amount || 0,
        remaining_balance: 0, // Will be calculated
        status: sale.status,
        created_by: '',
        created_at: sale.created_at,
        updated_at: sale.created_at
      } as Sale))
      
      const salesWithBalances = await calculateRemainingBalancesForSales(salesForCalculation)
      
      // Add product name for display purposes
      const salesWithProductInfo = salesWithBalances.map(sale => {
        const originalSale = (sales || []).find(originalSale => originalSale.id === sale.id)
        const productName = Array.isArray(originalSale?.products) && originalSale.products.length > 0
          ? originalSale.products[0].name
          : (originalSale?.products as any)?.name || 'Product'
        
        return {
          ...sale,
          productName
        }
      })
      
      setSalesWithBalances(salesWithProductInfo as Sale[])
      
      const totalSalesAmount = salesWithBalances.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const totalDue = salesWithBalances.reduce((sum, sale) => sum + (sale.remaining_balance || 0), 0)
      
      const activeSales = salesWithBalances.filter(sale => sale.status === 'active').length
      const completedSales = salesWithBalances.filter(sale => sale.status === 'completed').length

      setHistory(historyItems)
      setSummary({
        totalPaid,
        totalDue: Math.max(0, totalDue),
        activeSales,
        completedSales
      })

    } catch (error) {
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Payment History
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              {customer.full_name} • {customer.nic_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-green-600 truncate">Total Paid</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-900 truncate">
                          {formatCurrency(summary.totalPaid)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShoppingCartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-red-600 truncate">Outstanding</p>
                        <p className="text-lg sm:text-2xl font-bold text-red-900 truncate">
                          {formatCurrency(summary.totalDue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">Active Sales</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-900 truncate">
                          {summary.activeSales} Sales
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-purple-600 truncate">Completed</p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-900 truncate">
                          {summary.completedSales} Sales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mt-6">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-100">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Payment Timeline
                    </h3>
                  </div>
                  
                  {history.length === 0 ? (
                    <div className="px-4 sm:px-6 py-8 text-center">
                      <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                        <CreditCardIcon className="h-full w-full" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base">No payment history found.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      {/* Mobile View */}
                      <div className="block sm:hidden">
                        <div className="max-h-96 overflow-y-auto">
                          {history.map((item) => (
                            <div key={item.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.type === 'registration'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.type === 'registration' ? 'Registration' : 'Payment'}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 mb-1">
                                {item.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(item.date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:block">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {history.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(item.date)}
                                  </td>
                                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.type === 'registration'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {item.type === 'registration' ? 'Registration' : 'Payment'}
                                    </span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                    <div className="truncate max-w-xs" title={item.description}>
                                      {item.description}
                                    </div>
                                  </td>
                                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Individual Sale Balances */}
                {salesWithBalances && salesWithBalances.length > 0 && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mt-6">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-100">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                        <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Individual Sale Balances
                      </h3>
                    </div>
                    
                    <div className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sale Date
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remaining Balance
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {salesWithBalances.map((sale) => (
                              <tr key={sale.id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {(sale as any).productName || 'Product'}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(sale.sale_date || sale.created_at)}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                                  {formatCurrency(sale.total_amount)}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                  <span className={`${sale.remaining_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(sale.remaining_balance)}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    sale.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : sale.status === 'active'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

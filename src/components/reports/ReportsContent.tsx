'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, downloadAsCSV } from '@/utils/helpers'
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ReportsContent() {
  const [reportData, setReportData] = useState({
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    completedSales: 0,
    activeSales: 0,
    todayCollections: 0,
    monthlyRevenue: 0,
    recentSales: [],
    recentPayments: [],
    topCustomers: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Fetch various metrics
      const [
        customersResult,
        salesResult,
        paymentsResult,
        todayPaymentsResult
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('sales').select('id, total_amount, status, remaining_balance', { count: 'exact' }),
        supabase.from('payments').select('amount, payment_date'),
        supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', new Date().toISOString().split('T')[0])
      ])

      const totalCustomers = customersResult.count || 0
      const totalSales = salesResult.count || 0
      
      const sales = salesResult.data || []
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const outstandingBalance = sales
        .filter(sale => sale.status === 'active')
        .reduce((sum, sale) => sum + (sale.remaining_balance || 0), 0)
      const completedSales = sales.filter(sale => sale.status === 'completed').length
      const activeSales = sales.filter(sale => sale.status === 'active').length

      const payments = paymentsResult.data || []
      const todayPayments = todayPaymentsResult.data || []
      const todayCollections = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

      // Monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyPayments = payments.filter(payment => 
        payment.payment_date?.startsWith(currentMonth)
      )
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

      setReportData({
        totalCustomers,
        totalSales,
        totalRevenue,
        outstandingBalance,
        completedSales,
        activeSales,
        todayCollections,
        monthlyRevenue,
        recentSales: [],
        recentPayments: [],
        topCustomers: []
      })

    } catch (error) {
      toast.error('Error fetching report data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async (type: 'sales' | 'payments' | 'customers') => {
    try {
      let data = []
      let filename = ''

      switch (type) {
        case 'sales':
          const { data: salesData } = await supabase
            .from('sales')
            .select(`
              sale_date,
              initial_payment,
              total_amount,
              remaining_balance,
              status,
              customer:customers!customer_id(full_name, nic_number, phone),
              product:products!product_id(name)
            `)
            .gte('sale_date', dateRange.startDate)
            .lte('sale_date', dateRange.endDate)
          
          data = salesData?.map(sale => ({
            Date: formatDate(sale.sale_date),
            Customer: (sale.customer as any)?.full_name || 'Unknown',
            NIC: (sale.customer as any)?.nic_number || 'N/A',
            Phone: (sale.customer as any)?.phone || 'N/A',
            Product: (sale.product as any)?.name || 'N/A',
            'Initial Payment': formatCurrency(sale.initial_payment),
            'Total Amount': formatCurrency(sale.total_amount),
            'Remaining Balance': formatCurrency(sale.remaining_balance),
            Status: sale.status
          })) || []
          filename = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}`
          break

        case 'payments':
          const { data: paymentsData } = await supabase
            .from('payments')
            .select(`
              payment_date,
              amount,
              payment_method,
              sale:sales!sale_id(
                customer:customers!customer_id(full_name, nic_number)
              )
            `)
            .gte('payment_date', dateRange.startDate)
            .lte('payment_date', dateRange.endDate)
          
          data = paymentsData?.map(payment => ({
            Date: formatDate(payment.payment_date),
            Customer: (payment.sale as any)?.customer?.full_name || 'Unknown',
            NIC: (payment.sale as any)?.customer?.nic_number || 'N/A',
            Amount: formatCurrency(payment.amount),
            Method: payment.payment_method || 'Cash'
          })) || []
          filename = `payments-report-${dateRange.startDate}-to-${dateRange.endDate}`
          break

        case 'customers':
          const { data: customersData } = await supabase
            .from('customers')
            .select('*')
            .gte('created_at', dateRange.startDate)
            .lte('created_at', dateRange.endDate + ' 23:59:59')
          
          data = customersData?.map(customer => ({
            'Registration Date': formatDate(customer.registration_date),
            'Full Name': customer.full_name,
            'NIC Number': customer.nic_number,
            Phone: customer.phone,
            Email: customer.email || 'N/A',
            Address: customer.address || 'N/A',
            'Registration Fee Paid': customer.registration_fee_paid ? 'Yes' : 'No',
            Status: customer.is_active ? 'Active' : 'Inactive'
          })) || []
          filename = `customers-report-${dateRange.startDate}-to-${dateRange.endDate}`
          break
      }

      if (data.length > 0) {
        downloadAsCSV(data, filename)
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`)
      } else {
        toast.error('No data found for the selected date range')
      }
    } catch (error) {
      toast.error('Error exporting data')
      console.error('Error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Business Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive business analytics and data exports
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Report Period</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={async () => {
                  toast.loading('Generating report...', { id: 'report-loading' })
                  await fetchReportData()
                  toast.success('Report data updated!', { id: 'report-loading' })
                }}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Export Reports</h3>
          <p className="text-sm text-gray-500">Download reports as CSV files for the selected date range</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportToCSV('sales')}
              className="btn-primary flex items-center justify-center"
              disabled={loading}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Sales Report
            </button>
            <button
              onClick={() => exportToCSV('payments')}
              className="btn-primary flex items-center justify-center"
              disabled={loading}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Payments Report
            </button>
            <button
              onClick={() => exportToCSV('customers')}
              className="btn-primary flex items-center justify-center"
              disabled={loading}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Customers Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.totalCustomers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.totalSales}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(reportData.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Collections</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(reportData.todayCollections)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Export Reports</h3>
          <p className="text-sm text-gray-500">Download detailed reports as CSV files</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportToCSV('sales')}
              className="btn-outline flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Sales Report
            </button>
            <button
              onClick={() => exportToCSV('payments')}
              className="btn-outline flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Payments Report
            </button>
            <button
              onClick={() => exportToCSV('customers')}
              className="btn-outline flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Customers Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Sales Summary</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Sales:</span>
                <span className="font-medium">{reportData.activeSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Sales:</span>
                <span className="font-medium">{reportData.completedSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className="font-medium text-red-600">{formatCurrency(reportData.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-900 font-medium">Completion Rate:</span>
                <span className="font-medium">
                  {reportData.totalSales > 0 ? Math.round((reportData.completedSales / reportData.totalSales) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Revenue:</span>
                <span className="font-medium">{formatCurrency(reportData.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Sale Value:</span>
                <span className="font-medium">
                  {formatCurrency(reportData.totalSales > 0 ? reportData.totalRevenue / reportData.totalSales : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Rate:</span>
                <span className="font-medium">
                  {reportData.totalRevenue > 0 ? 
                    Math.round(((reportData.totalRevenue - reportData.outstandingBalance) / reportData.totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


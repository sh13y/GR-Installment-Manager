'use client'

import { useState, useEffect } from 'react'
import StatsCards from './StatsCards'
import SalesChart from './SalesChart'
import RecentActivity from './RecentActivity'
import PaymentOverview from './PaymentOverview'
import { DashboardStats } from '@/types'
import { supabase } from '@/lib/supabase'
import { useData } from '@/components/providers/DataProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { customers, sales, payments, isLoading } = useData()

  useEffect(() => {
    if (!isLoading && customers.length >= 0 && sales.length >= 0 && payments.length >= 0) {
      calculateDashboardStats()
    }
  }, [customers, sales, payments, isLoading])

  const calculateDashboardStats = async () => {
    try {
      setLoading(true)

      // Calculate stats from cached data
      const totalCustomers = customers.length
      const totalSales = sales.length
      
      // Calculate registration fee revenue (Rs. 250 per customer who paid)
      const registrationFeesCount = customers.filter(c => c.registration_fee_paid).length
      const registrationRevenue = registrationFeesCount * 250 // Rs. 250 per registration

      // Calculate initial payments revenue (Rs. 610 each sale)
      const initialPaymentsRevenue = sales.reduce((sum, sale) => sum + (sale.initial_payment || 0), 0)

      // Calculate installment payments revenue (daily payments received)
      const installmentPaymentsRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      
      // Total actual revenue = Registration fees + Initial payments + Installment payments
      const totalRevenue = registrationRevenue + initialPaymentsRevenue + installmentPaymentsRevenue
      
      const activeSales = sales.filter(sale => sale.status === 'active').length
      const completedSales = sales.filter(sale => sale.status === 'completed').length

      // Calculate pending amounts (outstanding balances from sales)
      const pendingPayments = sales
        .filter(sale => sale.status === 'active')
        .reduce((sum, sale) => sum + (sale.remaining_balance || 0), 0)

      // Today's payments
      const today = new Date().toISOString().split('T')[0]
      const todayPayments = payments.filter(payment => 
        payment.payment_date?.startsWith(today) || payment.created_at?.startsWith(today)
      )
      const todayTotal = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

      // Calculate monthly revenue (current month) - only actual payments + registrations
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyPayments = payments.filter(payment => 
        payment.created_at?.startsWith(currentMonth)
      )
      const monthlyInstallmentRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      
      // Get monthly registrations
      const monthlyRegistrations = customers.filter(customer =>
        customer.registration_fee_paid && 
        customer.created_at?.startsWith(currentMonth)
      )
      const monthlyRegistrationRevenue = monthlyRegistrations.length * 250
      
      // Get monthly initial payments (from sales created this month)
      const monthlySales = sales.filter(sale =>
        sale.created_at?.startsWith(currentMonth)
      )
      const monthlyInitialPayments = monthlySales.reduce((sum, sale) => sum + (sale.initial_payment || 0), 0)
      
      const monthlyRevenue = monthlyInstallmentRevenue + monthlyRegistrationRevenue + monthlyInitialPayments

      setStats({
        totalCustomers,
        totalSales,
        totalRevenue, // Registration + Initial payments + Installment payments
        pendingPayments, // Outstanding balances 
        completedSales,
        activeSales,
        todayPayments: todayTotal,
        monthlyRevenue, // Only actual money received this month
        registrationRevenue, // Total registration revenue
        paymentsRevenue: initialPaymentsRevenue + installmentPaymentsRevenue, // Total payment revenue
      })
    } catch (error) {
      console.error('Error calculating dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    calculateDashboardStats()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleRefresh}
            className="btn-outline"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <PaymentOverview />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}

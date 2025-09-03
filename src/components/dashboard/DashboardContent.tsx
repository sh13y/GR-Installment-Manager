'use client'

import { useState, useEffect } from 'react'
import StatsCards from './StatsCards'
import SalesChart from './SalesChart'
import RecentActivity from './RecentActivity'
import PaymentOverview from './PaymentOverview'
import { DashboardStats } from '@/types'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch various stats in parallel
      const [
        customersResult,
        salesResult,
        paymentsResult,
        todayPaymentsResult,
        registrationFeesResult
      ] = await Promise.all([
        supabase.from('customers').select('id, registration_fee_paid', { count: 'exact' }),
        supabase.from('sales').select('id, total_amount, status', { count: 'exact' }),
        supabase.from('payments').select('amount, created_at'),
        supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', new Date().toISOString().split('T')[0]),
        supabase.from('customers').select('registration_fee_paid').eq('registration_fee_paid', true)
      ])

      const customers = customersResult.data || []
      const totalCustomers = customersResult.count || 0
      const totalSales = salesResult.count || 0
      
      // Calculate registration fee revenue (₹250 per customer who paid)
      const registrationFeesCount = registrationFeesResult.data?.length || 0
      const registrationRevenue = registrationFeesCount * 250 // ₹250 per registration

      // Calculate actual payment revenue (money actually received)
      const payments = paymentsResult.data || []
      const paymentsRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      
      // Total actual revenue = Registration fees + Actual payments received
      const totalRevenue = registrationRevenue + paymentsRevenue
      
      const sales = salesResult.data || []
      const activeSales = sales.filter(sale => sale.status === 'active').length
      const completedSales = sales.filter(sale => sale.status === 'completed').length

      // Calculate pending amounts (outstanding balances from sales)
      const salesData = await supabase
        .from('sales')
        .select('remaining_balance')
        .eq('status', 'active')
      
      const pendingPayments = salesData.data?.reduce((sum, sale) => sum + (sale.remaining_balance || 0), 0) || 0

      const todayPayments = todayPaymentsResult.data || []
      const todayTotal = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

      // Calculate monthly revenue (current month) - only actual payments + registrations
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyPayments = payments.filter(payment => 
        payment.created_at?.startsWith(currentMonth)
      )
      const monthlyPaymentRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      
      // Get monthly registrations
      const monthlyRegistrations = await supabase
        .from('customers')
        .select('registration_fee_paid, created_at')
        .eq('registration_fee_paid', true)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`)
      
      const monthlyRegistrationRevenue = (monthlyRegistrations.data?.length || 0) * 250
      const monthlyRevenue = monthlyPaymentRevenue + monthlyRegistrationRevenue

      setStats({
        totalCustomers,
        totalSales,
        totalRevenue, // Only actual money received
        pendingPayments, // Outstanding balances 
        completedSales,
        activeSales,
        todayPayments: todayTotal,
        monthlyRevenue, // Only actual money received this month
        registrationRevenue, // Total registration revenue
        paymentsRevenue, // Total payment revenue
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
            onClick={fetchDashboardData}
            className="btn-outline"
          >
            Refresh Data
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

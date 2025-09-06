'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateTime } from '@/utils/helpers'
import { 
  UserPlusIcon, 
  ShoppingCartIcon, 
  CreditCardIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline'

interface ActivityItem {
  id: string
  type: 'customer' | 'sale' | 'payment'
  title: string
  description: string
  amount?: number
  timestamp: string
  link?: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)

      // Fetch recent customers, sales, and payments
      const [customersResult, salesResult, paymentsResult] = await Promise.all([
        supabase
          .from('customers')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('sales')
          .select(`
            id, 
            total_amount, 
            created_at,
            customers (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('payments')
          .select(`
            id,
            amount,
            created_at,
            sales (
              customers (full_name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const activities: ActivityItem[] = []

      // Add customer registrations
      customersResult.data?.forEach(customer => {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          title: 'New Customer Registered',
          description: customer.full_name,
          timestamp: customer.created_at,
          link: `/customers/${customer.id}`
        })
      })

      // Add sales
      salesResult.data?.forEach(sale => {
        activities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: 'New Sale Created',
          description: (sale.customers as any)?.full_name || 'Unknown Customer',
          amount: sale.total_amount,
          timestamp: sale.created_at,
          link: `/sales/${sale.id}`
        })
      })

      // Add payments
      paymentsResult.data?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: 'Payment Received',
          description: (payment.sales as any)?.customers?.full_name || 'Unknown Customer',
          amount: payment.amount,
          timestamp: payment.created_at,
          link: `/payments`
        })
      })

      // Sort by timestamp and take latest 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(activities.slice(0, 10))

    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <UserPlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'sale':
        return <ShoppingCartIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'payment':
        return <CreditCardIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      default:
        return null
    }
  }

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'sale':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'payment':
        return 'bg-purple-50 dark:bg-purple-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-700/50'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          <button
            onClick={fetchRecentActivity}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="p-0">
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <li key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="relative flex items-center space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityBgColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(activity.timestamp)}
                          {activity.link && (
                            <Link
                              href={activity.link}
                              className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.description}
                        </p>
                        {activity.amount && (
                          <p className="text-sm font-medium text-gray-900 dark:text-white text-currency">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No recent activity found
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/helpers'

interface PaymentData {
  date: string
  amount: number
  count: number
}

export default function PaymentOverview() {
  const [data, setData] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      
      // Get last 7 days of payments
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select('payment_date, amount')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .order('payment_date')

      if (error) {
        console.error('Error fetching payment data:', error)
        return
      }

      // Group payments by date
      const groupedData: Record<string, { amount: number; count: number }> = {}
      
      // Initialize with last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        groupedData[dateStr] = { amount: 0, count: 0 }
      }

      paymentsData?.forEach(payment => {
        const date = payment.payment_date
        if (groupedData[date]) {
          groupedData[date].amount += payment.amount || 0
          groupedData[date].count += 1
        }
      })

      // Convert to chart format
      const chartData: PaymentData[] = Object.entries(groupedData).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Daily Payments (Last 7 Days)</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { weekday: 'short' })
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => {
                    const date = new Date(label as string)
                    return date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === 'amount') {
                      return [formatCurrency(value as number), 'Amount']
                    }
                    return [value, 'Payments Count']
                  }}
                />
                <Bar dataKey="amount" fill="#3B82F6" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
            </p>
            <p className="text-sm text-gray-500">Total Collected</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/utils/helpers'

interface SalesData {
  date: string
  sales: number
  revenue: number
}

export default function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days')

  useEffect(() => {
    fetchSalesData()
  }, [period])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      
      const days = period === '7days' ? 7 : period === '30days' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: salesData, error } = await supabase
        .from('sales')
        .select('sale_date, total_amount')
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .order('sale_date')

      if (error) {
        console.error('Error fetching sales data:', error)
        return
      }

      // Group sales by date
      const groupedData: Record<string, { sales: number; revenue: number }> = {}
      
      salesData?.forEach(sale => {
        const date = sale.sale_date
        if (!groupedData[date]) {
          groupedData[date] = { sales: 0, revenue: 0 }
        }
        groupedData[date].sales += 1
        groupedData[date].revenue += sale.total_amount || 0
      })

      // Convert to chart format
      const chartData: SalesData[] = Object.entries(groupedData).map(([date, data]) => ({
        date,
        sales: data.sales,
        revenue: data.revenue,
      }))

      setData(chartData)
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sales Overview</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>
      <div className="h-64">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6B7280" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => formatDate(label as string)}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value as number), 'Revenue']
                    }
                    return [value, 'Sales Count']
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="sales"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            No sales data available for the selected period
          </div>
        )}
      </div>
    </div>
  )
}

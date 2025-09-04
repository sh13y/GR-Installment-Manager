'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, Sale, Payment, Product } from '@/types'

interface DataContextType {
  // Data
  customers: Customer[]
  sales: Sale[]
  payments: Payment[]
  products: Product[]
  
  // Loading states
  isLoading: boolean
  lastUpdated: Date | null
  
  // Methods
  fetchAllData: () => Promise<void>
  fetchCustomers: () => Promise<void>
  fetchSales: () => Promise<void>
  fetchPayments: () => Promise<void>
  fetchProducts: () => Promise<void>
  invalidateData: (type?: 'customers' | 'sales' | 'payments' | 'products') => void
  
  // Cache utilities
  isDataStale: (maxAge?: number) => boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Cache timeout: 5 minutes
  const CACHE_TIMEOUT = 5 * 60 * 1000

  const isDataStale = (maxAge: number = CACHE_TIMEOUT): boolean => {
    if (!lastUpdated) return true
    return Date.now() - lastUpdated.getTime() > maxAge
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers!customer_id(id, full_name, nic_number, phone),
          product:products!product_id(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          sale:sales!sale_id(
            id,
            customer:customers!customer_id(full_name, nic_number)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchAllData = async () => {
    if (isLoading) return // Prevent multiple simultaneous requests
    
    setIsLoading(true)
    try {
      await Promise.all([
        fetchCustomers(),
        fetchSales(),
        fetchPayments(),
        fetchProducts()
      ])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching all data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const invalidateData = (type?: 'customers' | 'sales' | 'payments' | 'products') => {
    if (type) {
      switch (type) {
        case 'customers':
          fetchCustomers()
          break
        case 'sales':
          fetchSales()
          break
        case 'payments':
          fetchPayments()
          break
        case 'products':
          fetchProducts()
          break
      }
    } else {
      fetchAllData()
    }
  }

  // Initial data load
  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-refresh stale data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDataStale() && !isLoading) {
        fetchAllData()
      }
    }, CACHE_TIMEOUT)

    return () => clearInterval(interval)
  }, [lastUpdated, isLoading])

  const value: DataContextType = {
    customers,
    sales,
    payments,
    products,
    isLoading,
    lastUpdated,
    fetchAllData,
    fetchCustomers,
    fetchSales,
    fetchPayments,
    fetchProducts,
    invalidateData,
    isDataStale
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

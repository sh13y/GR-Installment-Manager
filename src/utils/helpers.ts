import { APP_CONFIG } from './constants'

// Date Formatting
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Currency Formatting
export const formatCurrency = (amount: number): string => {
  return `${APP_CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// String Utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatName = (name: string): string => {
  return name
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

// Validation Utilities
export const validateNIC = (nic: string): boolean => {
  // Sri Lankan NIC validation - basic pattern
  const nicPattern = /^(\d{9}[VXvx]|\d{12})$/
  return nicPattern.test(nic.trim())
}

export const validatePhone = (phone: string): boolean => {
  // Sri Lankan phone number validation
  const phonePattern = /^(\+94|0)?[0-9]{9}$/
  return phonePattern.test(phone.replace(/\s+/g, ''))
}

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email.trim())
}

// Payment Calculations
export const calculateRemainingBalance = (totalAmount: number, paidAmount: number): number => {
  return Math.max(0, totalAmount - paidAmount)
}

export const calculateInstallmentsDue = (remainingBalance: number, dailyInstallment: number): number => {
  return Math.ceil(remainingBalance / dailyInstallment)
}

export const calculateDaysOverdue = (lastPaymentDate: string, dailyInstallment: number): number => {
  const today = new Date()
  const lastPayment = new Date(lastPaymentDate)
  const diffTime = Math.abs(today.getTime() - lastPayment.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Search and Filter Utilities
export const searchFilter = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items
  
  const term = searchTerm.toLowerCase()
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      return value && value.toString().toLowerCase().includes(term)
    })
  )
}

// Array Utilities
export const sortByField = <T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export const groupBy = <T, K extends keyof T>(
  items: T[],
  key: K
): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Number Utilities
export const roundToDecimals = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Local Storage Utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return defaultValue
  }
}

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// Error Handling
export const handleError = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error_description) return error.error_description
  return 'An unexpected error occurred'
}

// Status Badge Utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'defaulted':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// File Utilities
export const downloadAsCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

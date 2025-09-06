// User Management Types
export interface User {
  id: string
  email: string
  role: 'super_admin' | 'data_entry_staff'
  full_name: string
  nic_number: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Customer Types
export interface Customer {
  id: string
  nic_number: string
  full_name: string
  phone: string
  address?: string
  email?: string
  registration_fee_paid: boolean
  registration_date: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: string
  name: string
  cost_price: number
  selling_price: number
  service_charge: number
  daily_installment: number
  max_installments: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Sales Types
export interface Sale {
  id: string
  sale_number: string
  customer_id: string
  product_id: string
  quantity: number
  sale_date: string
  initial_payment: number
  total_amount: number
  remaining_balance: number
  status: 'active' | 'completed' | 'defaulted'
  created_by?: string
  created_at: string
  updated_at: string
  customer?: Customer
  product?: Product
}

// Payment Types
export interface Payment {
  id: string
  sale_id: string
  payment_date: string
  amount: number
  payment_method: string
  notes?: string
  created_by?: string
  created_at: string
}

// Registration Fee Types
export interface RegistrationFee {
  id: string
  customer_id: string
  amount: number
  payment_date: string
  payment_method: string
  created_by?: string
  created_at: string
}

// Inventory Types
export interface Inventory {
  id: string
  product_id: string
  quantity_in_stock: number
  reorder_level: number
  last_restocked?: string
  created_at: string
  updated_at: string
  product?: Product
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalCustomers: number
  totalSales: number
  totalRevenue: number // Only actual money received (payments + registration fees)
  pendingPayments: number // Outstanding balances from active sales
  completedSales: number
  activeSales: number
  todayPayments: number
  monthlyRevenue: number // Only actual money received this month
  registrationRevenue?: number // Total registration fees collected
  paymentsRevenue?: number // Total installment payments collected
  salesRevenue?: number // Total value of all sales (not necessarily collected)
}

export interface SalesChart {
  date: string
  sales: number
  revenue: number
}

export interface PaymentChart {
  date: string
  payments: number
  amount: number
}

// Form Types
export interface CustomerForm {
  nic_number: string
  full_name: string
  phone: string
  address?: string
  email?: string
}

export interface SaleForm {
  customer_id: string
  product_id: string
  quantity: number
  initial_payment: number
}

export interface PaymentForm {
  sale_id: string
  amount: number
  payment_method: string
  notes?: string
}

export interface UserForm {
  email: string
  password: string
  full_name: string
  nic_number: string
  phone?: string
  role: 'super_admin' | 'data_entry_staff'
}

export interface ProductForm {
  name: string
  cost_price: number
  selling_price: number
  service_charge: number
  daily_installment: number
  max_installments: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter Types
export interface CustomerFilter {
  search?: string
  registration_fee_paid?: boolean
  is_active?: boolean
}

export interface SaleFilter {
  search?: string
  status?: 'active' | 'completed' | 'defaulted'
  date_from?: string
  date_to?: string
}

export interface PaymentFilter {
  search?: string
  date_from?: string
  date_to?: string
  payment_method?: string
}

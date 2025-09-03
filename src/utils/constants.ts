// Business Constants
export const BUSINESS_CONSTANTS = {
  REGISTRATION_FEE: 250,
  TIRE_COST_PRICE: 5110,
  TIRE_SELLING_PRICE: 5610,
  TIRE_PROFIT: 500,
  INITIAL_PAYMENT: 610,
  SERVICE_CHARGE: 700,
  DAILY_INSTALLMENT: 57,
  MAX_INSTALLMENTS: 100,
  TOTAL_CUSTOMER_PAYMENT: 5700, // 5000 + 700 service charge
} as const

// App Constants
export const APP_CONFIG = {
  APP_NAME: 'GR Installment Manager',
  COMPANY_NAME: 'GR Installments',
  CURRENCY: 'LKR',
  CURRENCY_SYMBOL: 'Rs. ',
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',
} as const

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  DATA_ENTRY_STAFF: 'data_entry_staff',
} as const

// Sale Status
export const SALE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
} as const

// Table Names
export const TABLES = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  SALES: 'sales',
  PAYMENTS: 'payments',
  REGISTRATION_FEES: 'registration_fees',
  INVENTORY: 'inventory',
  AUDIT_LOG: 'audit_log',
} as const

// Navigation Items
export const NAVIGATION = {
  DASHBOARD: {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'HomeIcon',
  },
  CUSTOMERS: {
    name: 'Customers',
    href: '/customers',
    icon: 'UsersIcon',
  },
  SALES: {
    name: 'Sales',
    href: '/sales',
    icon: 'ShoppingCartIcon',
  },
  PAYMENTS: {
    name: 'Payments',
    href: '/payments',
    icon: 'CreditCardIcon',
  },
  INVENTORY: {
    name: 'Inventory',
    href: '/inventory',
    icon: 'ArchiveBoxIcon',
  },
  REPORTS: {
    name: 'Reports',
    href: '/reports',
    icon: 'ChartBarIcon',
  },
  USERS: {
    name: 'Users',
    href: '/users',
    icon: 'UserGroupIcon',
    adminOnly: true,
  },
} as const

// Validation Rules
export const VALIDATION = {
  NIC_LENGTH: 10,
  PHONE_MIN_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

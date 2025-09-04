'use client'

import { useState, useEffect } from 'react'
import { Customer, Product, Sale, SaleForm as SaleFormType } from '@/types'
import { supabase } from '@/lib/supabase'
import { BUSINESS_CONSTANTS } from '@/utils/constants'
import { formatCurrency } from '@/utils/helpers'
import toast from 'react-hot-toast'

interface SaleFormProps {
  editingSale?: Sale | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function SaleForm({ editingSale, onSubmit, onCancel }: SaleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState<SaleFormType>({
    customer_id: '',
    product_id: '',
    quantity: 1,
    initial_payment: BUSINESS_CONSTANTS.INITIAL_PAYMENT,
  })
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    // Populate form when editing
    if (editingSale) {
      setFormData({
        customer_id: editingSale.customer_id,
        product_id: editingSale.product_id,
        quantity: editingSale.quantity || 1,
        initial_payment: editingSale.initial_payment,
      })
    } else {
      // Reset form for new sale
      setFormData({
        customer_id: '',
        product_id: '',
        quantity: 1,
        initial_payment: BUSINESS_CONSTANTS.INITIAL_PAYMENT,
      })
    }
  }, [editingSale])

  useEffect(() => {
    // Update selected customer
    const customer = customers.find(c => c.id === formData.customer_id)
    setSelectedCustomer(customer || null)
  }, [formData.customer_id, customers])

  useEffect(() => {
    // Update selected product and calculate totals
    const product = products.find(p => p.id === formData.product_id)
    setSelectedProduct(product || null)
  }, [formData.product_id, products])

  const fetchInitialData = async () => {
    try {
      setLoadingData(true)
      
      const [customersResult, productsResult] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .eq('is_active', true)
          .eq('registration_fee_paid', true)
          .order('full_name'),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ])

      if (customersResult.error) {
        toast.error('Error loading customers')
        console.error('Error:', customersResult.error)
        return
      }

      if (productsResult.error) {
        toast.error('Error loading products')
        console.error('Error:', productsResult.error)
        return
      }

      setCustomers(customersResult.data || [])
      setProducts(productsResult.data || [])

      // Auto-select FM Tyre if available
      const fmTyre = productsResult.data?.find(p => p.name === 'FM Tyre')
      if (fmTyre) {
        setFormData(prev => ({ ...prev, product_id: fmTyre.id }))
      }

    } catch (error) {
      toast.error('Error loading data')
      console.error('Error:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer'
    } else if (!selectedCustomer?.registration_fee_paid) {
      newErrors.customer_id = 'Customer must pay registration fee first'
    }

    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product'
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.initial_payment || formData.initial_payment <= 0) {
      newErrors.initial_payment = 'Initial payment must be greater than 0'
    } else if (formData.initial_payment < BUSINESS_CONSTANTS.INITIAL_PAYMENT) {
      newErrors.initial_payment = `Minimum initial payment is ${formatCurrency(BUSINESS_CONSTANTS.INITIAL_PAYMENT)}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      if (!selectedProduct) {
        toast.error('Product not found')
        return
      }

      // Calculate amounts - service charge is fixed Rs. 700 per sale regardless of quantity
      const productTotal = selectedProduct.selling_price * formData.quantity
      const totalAmount = productTotal + selectedProduct.service_charge
      const remainingBalance = totalAmount - formData.initial_payment

      const submitData = {
        customer_id: formData.customer_id,
        product_id: formData.product_id,
        quantity: formData.quantity,
        initial_payment: formData.initial_payment,
        total_amount: totalAmount,
        remaining_balance: remainingBalance,
        status: 'active',
        sale_date: new Date().toISOString().split('T')[0],
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SaleFormType, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Calculate totals for display - service charge is fixed Rs. 700 per sale regardless of quantity
  const productTotal = selectedProduct ? selectedProduct.selling_price * formData.quantity : 0
  const totalAmount = selectedProduct ? productTotal + selectedProduct.service_charge : 0
  const remainingBalance = totalAmount - formData.initial_payment

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label htmlFor="customer_id" className="form-label">
          Customer *
        </label>
        <select
          id="customer_id"
          required
          className={`form-select ${errors.customer_id ? 'border-red-500' : ''}`}
          value={formData.customer_id}
          onChange={(e) => handleInputChange('customer_id', e.target.value)}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.full_name} ({customer.nic_number}) - {customer.phone}
            </option>
          ))}
        </select>
        {errors.customer_id && (
          <p className="form-error">{errors.customer_id}</p>
        )}
        {customers.length === 0 && (
          <p className="text-sm text-yellow-600 mt-1">
            No eligible customers found. Customers must pay registration fee first.
          </p>
        )}
        
        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-1">
          Format: Customer Name (NIC) - Phone Number
        </p>
      </div>

      {/* Product Selection */}
      <div>
        <label htmlFor="product_id" className="form-label">
          Product *
        </label>
        <select
          id="product_id"
          required
          className={`form-select ${errors.product_id ? 'border-red-500' : ''}`}
          value={formData.product_id}
          onChange={(e) => handleInputChange('product_id', e.target.value)}
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - {formatCurrency(product.selling_price)}
            </option>
          ))}
        </select>
        {errors.product_id && (
          <p className="form-error">{errors.product_id}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="quantity" className="form-label">
          Quantity *
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max="10"
          required
          className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
        />
        {errors.quantity && (
          <p className="form-error">{errors.quantity}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Number of products to purchase (1-10)
        </p>
      </div>

      {/* Initial Payment */}
      <div>
        <label htmlFor="initial_payment" className="form-label">
          Initial Payment *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
          <input
            id="initial_payment"
            type="number"
            required
            min="0"
            step="0.01"
            className={`form-input pl-8 ${errors.initial_payment ? 'border-red-500' : ''}`}
            placeholder="Enter initial payment amount"
            value={formData.initial_payment}
            onChange={(e) => handleInputChange('initial_payment', parseFloat(e.target.value) || 0)}
          />
        </div>
        {errors.initial_payment && (
          <p className="form-error">{errors.initial_payment}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Recommended: {formatCurrency(BUSINESS_CONSTANTS.INITIAL_PAYMENT)}
        </p>
      </div>

      {/* Sale Summary */}
      {selectedProduct && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Sale Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price (Each):</span>
              <span className="font-medium">{formatCurrency(selectedProduct.selling_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{formData.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Product Total:</span>
              <span className="font-medium">{formatCurrency(productTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Charge (Fixed):</span>
              <span className="font-medium">{formatCurrency(selectedProduct.service_charge)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Initial Payment:</span>
              <span className="font-medium text-green-600">-{formatCurrency(formData.initial_payment)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Remaining Balance:</span>
              <span className="font-semibold text-red-600">{formatCurrency(remainingBalance)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Daily Installment:</span>
              <span>Rs. {selectedProduct.daily_installment} × {Math.ceil(remainingBalance / selectedProduct.daily_installment)} days</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="btn-primary"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner mr-2"></div>
              {editingSale ? 'Updating Sale...' : 'Creating Sale...'}
            </div>
          ) : (
            editingSale ? 'Update Sale' : 'Create Sale'
          )}
        </button>
      </div>
    </form>
  )
}

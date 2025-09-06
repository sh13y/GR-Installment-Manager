'use client'

import { useState, useEffect } from 'react'
import { Product, ProductForm as ProductFormType } from '@/types'
import { APP_CONFIG } from '@/utils/constants'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductFormType) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  loading?: boolean
}

export default function ProductForm({ product, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormType>({
    name: '',
    cost_price: 0,
    selling_price: 0,
    service_charge: 0,
    daily_installment: 0,
    max_installments: 100,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [profit, setProfit] = useState(0)
  const [totalCustomerPayment, setTotalCustomerPayment] = useState(0)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        service_charge: product.service_charge,
        daily_installment: product.daily_installment,
        max_installments: product.max_installments,
      })
    }
  }, [product])

  useEffect(() => {
    // Calculate profit
    const calculatedProfit = formData.selling_price - formData.cost_price
    setProfit(calculatedProfit)

    // Calculate total customer payment (selling price + service charge)
    const totalPayment = formData.selling_price + formData.service_charge
    setTotalCustomerPayment(totalPayment)
  }, [formData.cost_price, formData.selling_price, formData.service_charge])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = ['cost_price', 'selling_price', 'service_charge', 'daily_installment', 'max_installments'].includes(name) 
      ? parseFloat(value) || 0 
      : value

    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (formData.cost_price <= 0) {
      newErrors.cost_price = 'Cost price must be greater than 0'
    }

    if (formData.selling_price <= 0) {
      newErrors.selling_price = 'Selling price must be greater than 0'
    }

    if (formData.selling_price <= formData.cost_price) {
      newErrors.selling_price = 'Selling price must be greater than cost price'
    }

    if (formData.service_charge < 0) {
      newErrors.service_charge = 'Service charge cannot be negative'
    }

    if (formData.daily_installment <= 0) {
      newErrors.daily_installment = 'Daily installment must be greater than 0'
    }

    if (formData.max_installments <= 0) {
      newErrors.max_installments = 'Max installments must be greater than 0'
    }

    // Check if daily installment makes sense with total amount
    const totalAmount = formData.selling_price + formData.service_charge
    const totalFromInstallments = formData.daily_installment * formData.max_installments
    
    if (totalFromInstallments < totalAmount) {
      newErrors.daily_installment = 'Daily installment × max installments should cover total amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await onSubmit(formData)
    
    if (!result.success) {
      alert('Error: ' + result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Motorcycle Tire 120/80-17"
          disabled={loading}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Price */}
        <div>
          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price * ({APP_CONFIG.CURRENCY_SYMBOL})
          </label>
          <input
            type="number"
            id="cost_price"
            name="cost_price"
            value={formData.cost_price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.cost_price ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.cost_price && <p className="text-red-500 text-sm mt-1">{errors.cost_price}</p>}
        </div>

        {/* Selling Price */}
        <div>
          <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price * ({APP_CONFIG.CURRENCY_SYMBOL})
          </label>
          <input
            type="number"
            id="selling_price"
            name="selling_price"
            value={formData.selling_price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.selling_price ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.selling_price && <p className="text-red-500 text-sm mt-1">{errors.selling_price}</p>}
        </div>
      </div>

      {/* Profit Display */}
      <div className={`p-3 rounded-lg ${profit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-sm font-medium ${profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
          Profit per unit: {APP_CONFIG.CURRENCY_SYMBOL}{profit.toFixed(2)}
        </p>
      </div>

      {/* Service Charge */}
      <div>
        <label htmlFor="service_charge" className="block text-sm font-medium text-gray-700 mb-1">
          Service Charge ({APP_CONFIG.CURRENCY_SYMBOL})
        </label>
        <input
          type="number"
          id="service_charge"
          name="service_charge"
          value={formData.service_charge}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.service_charge ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.service_charge && <p className="text-red-500 text-sm mt-1">{errors.service_charge}</p>}
      </div>

      {/* Total Customer Payment Display */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-800">
          Total Customer Payment: {APP_CONFIG.CURRENCY_SYMBOL}{totalCustomerPayment.toFixed(2)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          (Selling Price + Service Charge)
        </p>
      </div>

      {/* Installment Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Installment */}
        <div>
          <label htmlFor="daily_installment" className="block text-sm font-medium text-gray-700 mb-1">
            Daily Installment * ({APP_CONFIG.CURRENCY_SYMBOL})
          </label>
          <input
            type="number"
            id="daily_installment"
            name="daily_installment"
            value={formData.daily_installment}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.daily_installment ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.daily_installment && <p className="text-red-500 text-sm mt-1">{errors.daily_installment}</p>}
        </div>

        {/* Max Installments */}
        <div>
          <label htmlFor="max_installments" className="block text-sm font-medium text-gray-700 mb-1">
            Max Installments *
          </label>
          <input
            type="number"
            id="max_installments"
            name="max_installments"
            value={formData.max_installments}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.max_installments ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.max_installments && <p className="text-red-500 text-sm mt-1">{errors.max_installments}</p>}
        </div>
      </div>

      {/* Installment Calculation Display */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-800">
          Total from {formData.max_installments} installments: {APP_CONFIG.CURRENCY_SYMBOL}{(formData.daily_installment * formData.max_installments).toFixed(2)}
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Should cover total customer payment of {APP_CONFIG.CURRENCY_SYMBOL}{totalCustomerPayment.toFixed(2)}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

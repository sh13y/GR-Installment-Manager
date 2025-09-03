'use client'

import { useState, useEffect } from 'react'
import { Sale, PaymentForm as PaymentFormType } from '@/types'
import { formatCurrency } from '@/utils/helpers'
import { BUSINESS_CONSTANTS, PAYMENT_METHODS } from '@/utils/constants'

interface PaymentFormProps {
  activeSales: Sale[]
  selectedSale?: Sale | null
  onSubmit: (data: PaymentFormType & { payment_date: string }) => void
  onCancel: () => void
}

export default function PaymentForm({ 
  activeSales, 
  selectedSale, 
  onSubmit, 
  onCancel 
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormType & { payment_date: string }>({
    sale_id: '',
    amount: BUSINESS_CONSTANTS.DAILY_INSTALLMENT,
    payment_method: PAYMENT_METHODS.CASH,
    notes: '',
    payment_date: new Date().toISOString().split('T')[0],
  })
  const [selectedSaleData, setSelectedSaleData] = useState<Sale | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedSale) {
      setFormData(prev => ({ 
        ...prev, 
        sale_id: selectedSale.id,
        amount: Math.min(BUSINESS_CONSTANTS.DAILY_INSTALLMENT, selectedSale.remaining_balance)
      }))
      setSelectedSaleData(selectedSale)
    }
  }, [selectedSale])

  useEffect(() => {
    // Update selected sale data when sale_id changes
    const sale = activeSales.find(s => s.id === formData.sale_id)
    setSelectedSaleData(sale || null)
    
    if (sale) {
      // Suggest amount: either daily installment or remaining balance if less
      const suggestedAmount = Math.min(
        sale.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT,
        sale.remaining_balance
      )
      setFormData(prev => ({ ...prev, amount: suggestedAmount }))
    }
  }, [formData.sale_id, activeSales])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.sale_id) {
      newErrors.sale_id = 'Please select a sale'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Payment amount must be greater than 0'
    } else if (selectedSaleData && formData.amount > selectedSaleData.remaining_balance) {
      newErrors.amount = 'Payment amount cannot exceed remaining balance'
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required'
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleQuickAmount = (multiplier: number) => {
    const baseAmount = selectedSaleData?.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT
    const amount = Math.min(baseAmount * multiplier, selectedSaleData?.remaining_balance || 0)
    handleInputChange('amount', amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sale Selection - Enhanced Display */}
      <div>
        <label htmlFor="sale_id" className="form-label">
          Select Sale *
        </label>
        
        {/* Visual Sale Cards (if not many sales) */}
        {activeSales.length <= 8 && !selectedSale && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {activeSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => handleInputChange('sale_id', sale.id)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  formData.sale_id === sale.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{sale.customer?.full_name}</h4>
                    <p className="text-sm text-gray-600">📞 {sale.customer?.phone}</p>
                    <p className="text-xs text-gray-500">NIC: {sale.customer?.nic_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {formatCurrency(sale.remaining_balance)}
                    </p>
                    <p className="text-xs text-gray-500">outstanding</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Daily: ₹{sale.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT}</span>
                  <span>Total: {formatCurrency(sale.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Fallback Dropdown for many sales or when pre-selected */}
        {(activeSales.length > 8 || selectedSale) && (
          <select
            id="sale_id"
            required
            className={`form-select ${errors.sale_id ? 'border-red-500' : ''}`}
            value={formData.sale_id}
            onChange={(e) => handleInputChange('sale_id', e.target.value)}
            disabled={!!selectedSale}
          >
            <option value="">Choose a sale to record payment for</option>
            {activeSales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {sale.customer?.full_name} ({sale.customer?.nic_number}) - {sale.customer?.phone} | Balance: {formatCurrency(sale.remaining_balance)} | Daily: ₹{sale.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT}
              </option>
            ))}
          </select>
        )}
        
        {errors.sale_id && (
          <p className="form-error">{errors.sale_id}</p>
        )}
        
        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-1">
          {activeSales.length <= 8 && !selectedSale 
            ? "Click on a card above to select a sale" 
            : "Shows: Customer Name (NIC) - Phone | Remaining Balance | Daily Amount"
          }
        </p>
      </div>

      {/* Sale Details */}
      {selectedSaleData && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Sale Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Customer:</span>
              <p className="text-blue-900">{selectedSaleData.customer?.full_name}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Product:</span>
              <p className="text-blue-900">{selectedSaleData.product?.name || 'FM Tyre'}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Total Amount:</span>
              <p className="text-blue-900 font-semibold">{formatCurrency(selectedSaleData.total_amount)}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Remaining Balance:</span>
              <p className="text-blue-900 font-semibold text-red-600">{formatCurrency(selectedSaleData.remaining_balance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Date */}
      <div>
        <label htmlFor="payment_date" className="form-label">
          Payment Date *
        </label>
        <input
          id="payment_date"
          type="date"
          required
          className={`form-input ${errors.payment_date ? 'border-red-500' : ''}`}
          value={formData.payment_date}
          onChange={(e) => handleInputChange('payment_date', e.target.value)}
        />
        {errors.payment_date && (
          <p className="form-error">{errors.payment_date}</p>
        )}
      </div>

      {/* Payment Amount */}
      <div>
        <label htmlFor="amount" className="form-label">
          Payment Amount *
        </label>
        
        {/* Quick Amount Buttons */}
        {selectedSaleData && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline text-xs px-3 py-1"
                onClick={() => handleQuickAmount(1)}
              >
                1 Day (₹{selectedSaleData.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT})
              </button>
              <button
                type="button"
                className="btn-outline text-xs px-3 py-1"
                onClick={() => handleQuickAmount(7)}
              >
                1 Week (₹{(selectedSaleData.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT) * 7})
              </button>
              <button
                type="button"
                className="btn-outline text-xs px-3 py-1"
                onClick={() => handleQuickAmount(30)}
              >
                1 Month (₹{(selectedSaleData.product?.daily_installment || BUSINESS_CONSTANTS.DAILY_INSTALLMENT) * 30})
              </button>
              <button
                type="button"
                className="btn-outline text-xs px-3 py-1"
                onClick={() => handleInputChange('amount', selectedSaleData.remaining_balance)}
              >
                Full Balance ({formatCurrency(selectedSaleData.remaining_balance)})
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          <input
            id="amount"
            type="number"
            required
            min="0"
            step="0.01"
            className={`form-input pl-8 ${errors.amount ? 'border-red-500' : ''}`}
            placeholder="Enter payment amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          />
        </div>
        {errors.amount && (
          <p className="form-error">{errors.amount}</p>
        )}
        
        {selectedSaleData && formData.amount > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            New balance after payment: {formatCurrency(selectedSaleData.remaining_balance - formData.amount)}
            {formData.amount >= selectedSaleData.remaining_balance && (
              <span className="text-green-600 font-medium ml-2">✓ Sale will be completed</span>
            )}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="payment_method" className="form-label">
          Payment Method
        </label>
        <select
          id="payment_method"
          className="form-select"
          value={formData.payment_method}
          onChange={(e) => handleInputChange('payment_method', e.target.value)}
        >
          <option value={PAYMENT_METHODS.CASH}>Cash</option>
          <option value={PAYMENT_METHODS.BANK_TRANSFER}>Bank Transfer</option>
          <option value={PAYMENT_METHODS.CHEQUE}>Cheque</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="form-label">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="form-textarea"
          placeholder="Add any notes about this payment (optional)"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>

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
          disabled={loading || !selectedSaleData}
          className="btn-primary"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner mr-2"></div>
              Recording Payment...
            </div>
          ) : (
            'Record Payment'
          )}
        </button>
      </div>
    </form>
  )
}

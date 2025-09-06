'use client'

import { useState, useEffect } from 'react'
import { Customer, CustomerForm as CustomerFormType } from '@/types'
import { validateNIC, validatePhone, validateEmail } from '@/utils/helpers'
import { BUSINESS_CONSTANTS } from '@/utils/constants'

interface CustomerFormProps {
  customer?: Customer | null
  onSubmit: (data: CustomerFormType) => void
  onCancel: () => void
}

export default function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormType>({
    nic_number: '',
    full_name: '',
    phone: '',
    address: '',
    email: '',
  })
  const [registrationFeePaid, setRegistrationFeePaid] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      setFormData({
        nic_number: customer.nic_number,
        full_name: customer.full_name,
        phone: customer.phone,
        address: customer.address || '',
        email: customer.email || '',
      })
      setRegistrationFeePaid(customer.registration_fee_paid)
    }
  }, [customer])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nic_number.trim()) {
      newErrors.nic_number = 'NIC number is required'
    } else if (!validateNIC(formData.nic_number)) {
      newErrors.nic_number = 'Invalid NIC number format'
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
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
      const submitData = {
        ...formData,
        registration_fee_paid: registrationFeePaid,
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CustomerFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* NIC Number */}
      <div>
        <label htmlFor="nic_number" className="form-label">
          NIC Number *
        </label>
        <input
          id="nic_number"
          type="text"
          required
          className={`form-input ${errors.nic_number ? 'border-red-500' : ''}`}
          placeholder="Enter NIC number (e.g., 123456789V)"
          value={formData.nic_number}
          onChange={(e) => handleInputChange('nic_number', e.target.value)}
        />
        {errors.nic_number && (
          <p className="form-error">{errors.nic_number}</p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="form-label">
          Full Name *
        </label>
        <input
          id="full_name"
          type="text"
          required
          className={`form-input ${errors.full_name ? 'border-red-500' : ''}`}
          placeholder="Enter full name"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
        />
        {errors.full_name && (
          <p className="form-error">{errors.full_name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="form-label">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          required
          className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="Enter phone number (e.g., 0712345678)"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
        {errors.phone && (
          <p className="form-error">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
          placeholder="Enter email address (optional)"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
        {errors.email && (
          <p className="form-error">{errors.email}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="form-label">
          Address
        </label>
        <textarea
          id="address"
          rows={3}
          className="form-textarea"
          placeholder="Enter customer address (optional)"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      {/* Registration Fee */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Registration Fee
            </h4>
            <p className="text-sm text-gray-500">
              One-time fee: ₹{BUSINESS_CONSTANTS.REGISTRATION_FEE}
            </p>
          </div>
          <div className="flex items-center">
            <input
              id="registration_fee_paid"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={registrationFeePaid}
              onChange={(e) => setRegistrationFeePaid(e.target.checked)}
            />
            <label htmlFor="registration_fee_paid" className="ml-2 text-sm text-gray-900">
              Paid
            </label>
          </div>
        </div>
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
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner mr-2"></div>
              {customer ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            customer ? 'Update Customer' : 'Create Customer'
          )}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { User, UserForm as UserFormType } from '@/types'
import { validateNIC, validatePhone, validateEmail } from '@/utils/helpers'
import { USER_ROLES } from '@/utils/constants'

interface UserFormProps {
  user?: User | null
  onSubmit: (data: UserFormType) => void
  onCancel: () => void
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormType>({
    email: '',
    password: '',
    full_name: '',
    nic_number: '',
    phone: '',
    role: 'data_entry_staff',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Don't prefill password for security
        full_name: user.full_name,
        nic_number: user.nic_number,
        phone: user.phone || '',
        role: user.role,
      })
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users'
    } else if (!user && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters'
    }

    if (!formData.nic_number.trim()) {
      newErrors.nic_number = 'NIC number is required'
    } else if (!validateNIC(formData.nic_number)) {
      newErrors.nic_number = 'Invalid NIC number format'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
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

  const handleInputChange = (field: keyof UserFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* New User Notice */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Manual User Creation Required
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Creating new users requires first setting them up in Supabase Authentication. 
                This form is primarily for editing existing user profiles.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            required
            disabled={!!user} // Disable for existing users
            className={`form-input ${errors.email ? 'border-red-500' : ''} ${user ? 'bg-gray-100' : ''}`}
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {errors.email && (
            <p className="form-error">{errors.email}</p>
          )}
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed for existing users
            </p>
          )}
        </div>

        {/* Password */}
        {!user && (
          <div>
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Enter password (min 8 characters)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>
        )}

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

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="Enter phone number (optional)"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          {errors.phone && (
            <p className="form-error">{errors.phone}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="form-label">
            Role *
          </label>
          <select
            id="role"
            required
            className={`form-select ${errors.role ? 'border-red-500' : ''}`}
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <option value="">Select a role</option>
            <option value={USER_ROLES.DATA_ENTRY_STAFF}>Data Entry Staff</option>
            <option value={USER_ROLES.SUPER_ADMIN}>Super Admin</option>
          </select>
          {errors.role && (
            <p className="form-error">{errors.role}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Super Admins have full access. Data Entry Staff have limited permissions.
          </p>
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
                {user ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              user ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


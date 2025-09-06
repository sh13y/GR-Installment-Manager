'use client'

import { useState, useEffect } from 'react'
import { Inventory, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface StockUpdateFormProps {
  item?: Inventory | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function StockUpdateForm({ item, onSubmit, onCancel }: StockUpdateFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_in_stock: 0,
    reorder_level: 10,
    last_restocked: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (item) {
      setFormData({
        product_id: item.product_id,
        quantity_in_stock: item.quantity_in_stock,
        reorder_level: item.reorder_level,
        last_restocked: item.last_restocked || new Date().toISOString().split('T')[0],
      })
    }
  }, [item])

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        toast.error('Error loading products')
        console.error('Error:', error)
        return
      }

      setProducts(data || [])
    } catch (error) {
      toast.error('Error loading products')
      console.error('Error:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product'
    }

    if (formData.quantity_in_stock < 0) {
      newErrors.quantity_in_stock = 'Stock quantity cannot be negative'
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = 'Reorder level cannot be negative'
    }

    if (!formData.last_restocked) {
      newErrors.last_restocked = 'Last restocked date is required'
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

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={!!item} // Disable if editing existing item
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - Cost: ₹{product.cost_price}
            </option>
          ))}
        </select>
        {errors.product_id && (
          <p className="form-error">{errors.product_id}</p>
        )}
        {item && (
          <p className="text-sm text-gray-500 mt-1">
            Product cannot be changed when updating existing inventory
          </p>
        )}
      </div>

      {/* Current Stock */}
      <div>
        <label htmlFor="quantity_in_stock" className="form-label">
          Current Stock Quantity *
        </label>
        <input
          id="quantity_in_stock"
          type="number"
          required
          min="0"
          className={`form-input ${errors.quantity_in_stock ? 'border-red-500' : ''}`}
          placeholder="Enter current stock quantity"
          value={formData.quantity_in_stock}
          onChange={(e) => handleInputChange('quantity_in_stock', parseInt(e.target.value) || 0)}
        />
        {errors.quantity_in_stock && (
          <p className="form-error">{errors.quantity_in_stock}</p>
        )}
      </div>

      {/* Reorder Level */}
      <div>
        <label htmlFor="reorder_level" className="form-label">
          Reorder Level *
        </label>
        <input
          id="reorder_level"
          type="number"
          required
          min="0"
          className={`form-input ${errors.reorder_level ? 'border-red-500' : ''}`}
          placeholder="Enter minimum stock level for alerts"
          value={formData.reorder_level}
          onChange={(e) => handleInputChange('reorder_level', parseInt(e.target.value) || 0)}
        />
        {errors.reorder_level && (
          <p className="form-error">{errors.reorder_level}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          You'll get alerts when stock falls below this level
        </p>
      </div>

      {/* Last Restocked Date */}
      <div>
        <label htmlFor="last_restocked" className="form-label">
          Last Restocked Date *
        </label>
        <input
          id="last_restocked"
          type="date"
          required
          className={`form-input ${errors.last_restocked ? 'border-red-500' : ''}`}
          value={formData.last_restocked}
          onChange={(e) => handleInputChange('last_restocked', e.target.value)}
        />
        {errors.last_restocked && (
          <p className="form-error">{errors.last_restocked}</p>
        )}
      </div>

      {/* Summary */}
      {selectedProduct && formData.quantity_in_stock > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Inventory Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unit Cost:</span>
              <span className="font-medium">₹{selectedProduct.cost_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock Quantity:</span>
              <span className="font-medium">{formData.quantity_in_stock} units</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Total Value:</span>
              <span className="font-semibold">₹{(formData.quantity_in_stock * selectedProduct.cost_price).toLocaleString()}</span>
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
              {item ? 'Updating...' : 'Adding...'}
            </div>
          ) : (
            item ? 'Update Stock' : 'Add to Inventory'
          )}
        </button>
      </div>
    </form>
  )
}

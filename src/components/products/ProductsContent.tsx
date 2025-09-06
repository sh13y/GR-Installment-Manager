'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import ProductForm from './ProductForm'
import ProductsTable from './ProductsTable'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (productData: any) => {
    try {
      setFormLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()
      
      if (error) throw error
      
      setProducts(prev => [data, ...prev])
      setShowForm(false)
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating product:', error)
      return { success: false, error: error.message }
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateProduct = async (id: string, productData: any) => {
    try {
      setFormLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setProducts(prev => prev.map(p => p.id === id ? data : p))
      setEditingProduct(null)
      setShowForm(false)
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      // First check if product is used in any sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (salesError) throw salesError

      if (salesData && salesData.length > 0) {
        alert('Cannot delete product as it is being used in sales records. You can deactivate it instead.')
        return
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      console.error('Error deleting product:', error)
      alert('Error deleting product: ' + error.message)
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', id)
      
      if (error) throw error
      
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_active: !isActive } : p
      ))
    } catch (error: any) {
      console.error('Error updating product status:', error)
      alert('Error updating product status: ' + error.message)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog with pricing and installment settings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? 
            (data: any) => handleUpdateProduct(editingProduct.id, data) : 
            handleCreateProduct
          }
          onCancel={closeForm}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}

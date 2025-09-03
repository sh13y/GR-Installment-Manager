'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import UsersTable from './UsersTable'
import UserForm from './UserForm'
import Modal from '@/components/ui/Modal'
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { USER_ROLES } from '@/utils/constants'
import toast from 'react-hot-toast'

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { userProfile } = useAuth()

  // Check if current user is super admin
  const isSuperAdmin = userProfile?.role === USER_ROLES.SUPER_ADMIN

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error fetching users')
        console.error('Error:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this user?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) {
        toast.error('Error updating user status')
        console.error('Error:', error)
        return
      }

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            nic_number: formData.nic_number,
            phone: formData.phone,
            role: formData.role,
          })
          .eq('id', editingUser.id)

        if (error) {
          toast.error('Error updating user')
          console.error('Error:', error)
          return
        }

        toast.success('User updated successfully')
      } else {
        // Create new user - this is complex with Supabase Auth
        // For now, show a message about manual creation
        toast.error('New user creation requires manual setup in Supabase Auth. Please see documentation.')
        return
      }

      setIsModalOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  // Access control for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="card border-red-200 bg-red-50">
          <div className="card-body">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Access Denied
                </h3>
                <p className="text-sm text-red-700">
                  Only Super Administrators can manage user accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            User Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their permissions
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleCreateUser}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* User Creation Notice */}
      <div className="card border-blue-200 bg-blue-50">
        <div className="card-body">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Creating New Users
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                To create new users, you need to first create them in Supabase Authentication dashboard, 
                then add their profile information here. See the documentation for detailed steps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <span className="text-2xl font-bold text-blue-600">
                    {users.length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-50">
                  <span className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.is_active).length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-purple-50">
                  <span className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === USER_ROLES.SUPER_ADMIN).length}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Super Admins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
      />

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingUser(null)
          }}
        />
      </Modal>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState({
    connection: 'checking',
    auth: 'checking',
    database: 'checking',
    users: []
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const results = {
      connection: 'failed',
      auth: 'failed', 
      database: 'failed',
      users: []
    }

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('products').select('count').limit(1)
      if (!error) {
        results.connection = 'success'
      }

      // Test 2: Check if auth is working
      const { data: session } = await supabase.auth.getSession()
      results.auth = session ? 'has-session' : 'no-session'

      // Test 3: Check users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, role, full_name')
        .limit(10)
      
      if (!usersError && usersData) {
        results.database = 'success'
        results.users = usersData
      }

    } catch (error) {
      console.error('Connection test error:', error)
    }

    setStatus(results)
  }

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@fmtire.com',
        password: 'password123'
      })

      if (error) {
        alert(`Login Error: ${error.message}`)
      } else {
        alert('Login Success!')
        testConnection() // Refresh status
      }
    } catch (error) {
      alert(`Unexpected Error: ${error}`)
    }
  }

  const resetTestData = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL customers, sales, and payments data!\n\nAre you sure you want to reset the database?')) {
      return
    }

    if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
      return
    }

    try {
      // Delete in correct order to respect foreign keys
      const operations = [
        { name: 'payments', query: supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000') },
        { name: 'registration_fees', query: supabase.from('registration_fees').delete().neq('id', '00000000-0000-0000-0000-000000000000') },
        { name: 'sales', query: supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000') },
        { name: 'customers', query: supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000') }
      ]

      for (const operation of operations) {
        const { error } = await operation.query
        if (error) {
          alert(`Error deleting ${operation.name}: ${error.message}`)
          return
        }
      }

      alert('✅ Database reset successfully!\n\nAll test data has been removed.')
      testConnection() // Refresh status
    } catch (error) {
      alert(`Reset Error: ${error}`)
    }
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Environment Variables</h3>
          <div className="mt-2 text-sm">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
            <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
            <p>URL Preview: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium">Connection Status</h3>
          <div className="mt-2 text-sm space-y-1">
            <p>Database Connection: <span className={status.connection === 'success' ? 'text-green-600' : 'text-red-600'}>{status.connection}</span></p>
            <p>Auth Status: <span className={status.auth === 'has-session' ? 'text-green-600' : 'text-yellow-600'}>{status.auth}</span></p>
            <p>Users Table: <span className={status.database === 'success' ? 'text-green-600' : 'text-red-600'}>{status.database}</span></p>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium">Users in Database ({status.users.length})</h3>
          {status.users.length > 0 ? (
            <div className="mt-2 text-sm">
              {status.users.map((user, index) => (
                <p key={index}>{user.email} - {user.role} - {user.full_name}</p>
              ))}
            </div>
          ) : (
            <p className="text-red-600 text-sm mt-2">No users found in database</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Test
          </button>
          <button 
            onClick={testLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Login
          </button>
          <button 
            onClick={resetTestData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ⚠️ Reset Test Data
          </button>
        </div>
      </div>
    </div>
  )
}

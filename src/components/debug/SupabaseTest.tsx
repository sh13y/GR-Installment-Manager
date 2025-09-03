'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  email: string
  role: string
  full_name: string
}

interface Status {
  connection: string
  auth: string
  database: string
  users: User[]
}

export default function SupabaseTest() {
  const [status, setStatus] = useState<Status>({
    connection: 'checking',
    auth: 'checking',
    database: 'checking',
    users: []
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    console.log('🔍 Starting connection test...')
    
    const results: Status = {
      connection: 'testing...',
      auth: 'testing...',
      database: 'testing...',
      users: []
    }
    
    // Update UI to show testing state
    setStatus(results)

    try {
      // Test 1: Basic connection with timeout
      console.log('📡 Testing basic connection...')
      
      const connectionPromise = supabase.from('users').select('count').limit(1)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
      
      try {
        const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any
        if (!error) {
          results.connection = 'success'
          console.log('✅ Basic connection: SUCCESS')
        } else {
          console.error('❌ Connection error:', error)
          results.connection = `failed: ${error.message}`
        }
      } catch (connError: any) {
        console.error('❌ Connection timeout or error:', connError)
        results.connection = `failed: ${connError.message}`
      }
      setStatus({...results})

      // Test 2: Auth session check
      console.log('🔐 Checking auth session...')
      try {
        const { data: session } = await supabase.auth.getSession()
        results.auth = session?.session ? 'has-session' : 'no-session'
        console.log('🔐 Auth status:', results.auth)
      } catch (authError: any) {
        console.error('❌ Auth error:', authError)
        results.auth = `failed: ${authError.message}`
      }
      setStatus({...results})

      // Test 3: Users table check
      console.log('👥 Testing users table...')
      try {
        const usersPromise = supabase
          .from('users')
          .select('email, role, full_name, is_active')
          .limit(10)
        
        const usersTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Users query timeout')), 10000)
        )
        
        const { data: usersData, error: usersError } = await Promise.race([usersPromise, usersTimeoutPromise]) as any
        
        if (!usersError && usersData) {
          results.database = 'success'
          results.users = usersData
          console.log('✅ Users found:', usersData.length)
        } else {
          console.error('❌ Users table error:', usersError)
          results.database = `failed: ${usersError?.message || 'Unknown error'}`
        }
      } catch (dbError: any) {
        console.error('❌ Database timeout or error:', dbError)
        results.database = `failed: ${dbError.message}`
      }

    } catch (error: any) {
      console.error('💥 Connection test error:', error)
      results.connection = `failed: ${error.message || error}`
      results.auth = 'failed'
      results.database = 'failed'
    }

    console.log('📊 Final results:', results)
    setStatus(results)
  }

  const testLogin = async () => {
    const password = prompt('Enter your admin password:')
    if (!password) return

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'eworks.rajapaksha@gmail.com',
        password: password
      })

      if (error) {
        alert(`Login Error: ${error.message}`)
        console.error('Login error:', error)
      } else {
        alert('Login Success!')
        console.log('Login successful:', data)
        testConnection() // Refresh status
      }
    } catch (error) {
      alert(`Unexpected Error: ${error}`)
      console.error('Unexpected login error:', error)
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
            🔄 Refresh Test
          </button>
          <button 
            onClick={async () => {
              console.log('🧪 Manual simple test...')
              try {
                setStatus(prev => ({...prev, connection: 'testing simple...'}))
                
                // Test 1: Auth check with timeout
                console.log('Testing auth.users first...')
                const authPromise = supabase.auth.getUser()
                const authTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Auth timeout')), 5000)
                )
                
                try {
                  const authTest = await Promise.race([authPromise, authTimeout])
                  console.log('Auth test result:', authTest)
                } catch (authErr: any) {
                  console.log('Auth test failed:', authErr.message)
                }
                
                // Test 2: Simple count query with timeout
                console.log('Testing simple count query...')
                const countPromise = supabase.from('users').select('*', { count: 'exact', head: true })
                const countTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Count timeout')), 5000)
                )
                
                try {
                  const countResult = await Promise.race([countPromise, countTimeout])
                  console.log('Count result:', countResult)
                } catch (countErr: any) {
                  console.log('Count test failed:', countErr.message)
                }
                
                // Test 3: Actual data query with timeout
                console.log('Testing actual data query...')
                const dataPromise = supabase.from('users').select('*').limit(5)
                const dataTimeout = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Data timeout')), 5000)
                )
                
                const result = await Promise.race([dataPromise, dataTimeout]) as any
                console.log('Data query result:', result)
                
                if (result.error) {
                  setStatus(prev => ({...prev, connection: `error: ${result.error.message}`, database: `error: ${result.error.message}`}))
                  alert(`❌ Error: ${result.error.message}`)
                } else if (result.data) {
                  setStatus(prev => ({...prev, connection: 'simple success', database: 'simple success', users: result.data || []}))
                  alert(`✅ Success! Found ${result.data?.length || 0} users`)
                } else {
                  alert(`⚠️ Unexpected result format`)
                }
              } catch (err: any) {
                console.error('Simple test error:', err)
                setStatus(prev => ({...prev, connection: `exception: ${err.message}`, database: `exception: ${err.message}`}))
                alert(`❌ Exception: ${err.message}`)
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            🧪 Simple Test
          </button>

          <button 
            onClick={async () => {
              console.log('🌐 Testing raw connectivity...')
              try {
                // Test 1: Check if we can reach the Supabase URL
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                console.log('Testing URL:', supabaseUrl)
                
                const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                  method: 'GET',
                  headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
                  }
                })
                
                console.log('Raw response status:', response.status)
                console.log('Raw response headers:', Object.fromEntries(response.headers.entries()))
                
                if (response.ok) {
                  alert(`✅ Raw connectivity SUCCESS! Status: ${response.status}`)
                } else {
                  const errorText = await response.text()
                  alert(`❌ Raw connectivity FAILED! Status: ${response.status}, Error: ${errorText}`)
                }
              } catch (err: any) {
                console.error('Raw connectivity error:', err)
                alert(`❌ Raw connectivity EXCEPTION: ${err.message}`)
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🌐 Raw Test
          </button>
          <button 
            onClick={testLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔐 Test Login
          </button>
          <button 
            onClick={async () => {
              console.log('🌐 Testing basic Supabase connection...')
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
                  headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                  }
                })
                console.log('🌐 Basic HTTP response:', response.status, response.statusText)
                alert(`Basic connection test: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'} (${response.status})`)
              } catch (error) {
                console.error('🌐 Basic connection error:', error)
                alert(`Basic connection test: ❌ FAILED - ${error}`)
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            🌐 Test Basic Connection
          </button>
          <button 
            onClick={() => {
              console.log('🔧 Environment check:')
              console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
              console.log('Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
              console.log('Key preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
              alert('Check browser console (F12) for environment details')
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            🔧 Check Environment
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

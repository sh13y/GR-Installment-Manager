'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { checkSupabaseHealth } from '@/lib/supabase'
import { APP_CONFIG } from '@/utils/constants'
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking')
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check connection health on mount
    const checkConnection = async () => {
      const isHealthy = await checkSupabaseHealth()
      setConnectionStatus(isHealthy ? 'healthy' : 'unhealthy')
    }
    
    checkConnection()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    // Check connection before attempting login
    if (connectionStatus === 'unhealthy') {
      toast.error('Connection issue detected. Please check your internet connection.')
      const isHealthy = await checkSupabaseHealth()
      setConnectionStatus(isHealthy ? 'healthy' : 'unhealthy')
      if (!isHealthy) return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error(error)
        
        // Re-check connection if login failed
        const isHealthy = await checkSupabaseHealth()
        setConnectionStatus(isHealthy ? 'healthy' : 'unhealthy')
        return
      }

      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('An unexpected error occurred')
      
      // Re-check connection on unexpected error
      const isHealthy = await checkSupabaseHealth()
      setConnectionStatus(isHealthy ? 'healthy' : 'unhealthy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">GR</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white text-shadow">
            {APP_CONFIG.APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-medium" onSubmit={handleSubmit}>
          {/* Connection Status Indicator */}
          <div className={`flex items-center text-sm px-3 py-2 rounded-md ${
            connectionStatus === 'checking' ? 'bg-yellow-50 text-yellow-700' :
            connectionStatus === 'healthy' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {connectionStatus === 'checking' && (
              <>
                <div className="loading-spinner-small mr-2"></div>
                Checking connection...
              </>
            )}
            {connectionStatus === 'healthy' && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </>
            )}
            {connectionStatus === 'unhealthy' && (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Connection issue - check your internet
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Default login: eworks.rajapaksha@gmail.com / [your_password]
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

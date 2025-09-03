'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as AppUser } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (userData: Partial<AppUser> & { password?: string }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session with retry logic
    const getInitialSession = async (retryCount = 0) => {
      const maxRetries = 3
      
      try {
        console.log('🔍 Getting initial session...', { attempt: retryCount + 1 })
        
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        console.log('📋 Session status:', session ? 'found' : 'none')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error: any) {
        console.error('❌ Session error:', error, { attempt: retryCount + 1 })
        
        if (retryCount < maxRetries) {
          console.log('🔄 Retrying session check...', { nextAttempt: retryCount + 2 })
          setTimeout(() => getInitialSession(retryCount + 1), 2000)
        } else {
          console.error('❌ Max retries exceeded for session check')
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { event, hasSession: !!session })
        
        try {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setUserProfile(null)
          }
          
          setLoading(false)
        } catch (error) {
          console.error('❌ Error handling auth state change:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3
    
    try {
      console.log('👤 Fetching user profile...', { userId: userId.substring(0, 8) + '***', attempt: retryCount + 1 })
      
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error fetching user profile:', error, { attempt: retryCount + 1 })
        
        if (retryCount < maxRetries && (error.message.includes('timeout') || error.message.includes('network'))) {
          console.log('🔄 Retrying profile fetch...', { nextAttempt: retryCount + 2 })
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000)
          return
        }
        
        return
      }

      console.log('✅ User profile fetched successfully')
      setUserProfile(data)
    } catch (error: any) {
      console.error('❌ Unexpected error fetching user profile:', error, { attempt: retryCount + 1 })
      
      if (retryCount < maxRetries) {
        console.log('🔄 Retrying profile fetch...', { nextAttempt: retryCount + 2 })
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Starting sign in process...', { email: email.substring(0, 3) + '***' })
      
      // Add connection timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout - check your internet connection')), 15000)
      )
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any
      
      if (error) {
        console.error('❌ Auth error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please check your credentials.' }
        } else if (error.message.includes('Network')) {
          return { error: 'Network error. Please check your internet connection and try again.' }
        } else if (error.message.includes('timeout')) {
          return { error: 'Connection timeout. Please check your internet connection and try again.' }
        }
        
        return { error: error.message }
      }
      
      if (!data.user) {
        console.error('❌ No user data returned from auth')
        return { error: 'Authentication failed - no user data received' }
      }
      
      console.log('✅ Sign in successful', { userId: data.user.id })
      return { error: null }
    } catch (error: any) {
      console.error('❌ Unexpected sign in error:', error)
      
      if (error.message.includes('timeout')) {
        return { error: 'Connection timeout. Please check your internet connection and try again.' }
      }
      
      return { error: 'An unexpected error occurred. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: Partial<AppUser> & { password?: string }) => {
    try {
      setLoading(true)

      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password as string,
      })

      if (authError) {
        return { error: authError.message }
      }

      if (!authData.user) {
        return { error: 'Failed to create user account' }
      }

      // Then create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            nic_number: userData.nic_number,
            phone: userData.phone,
            role: userData.role || 'data_entry_staff',
          },
        ])

      if (profileError) {
        return { error: profileError.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    try {
      if (!user) {
        return { error: 'No user logged in' }
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh user profile
      await fetchUserProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

console.log('🔧 Initializing Supabase client...', { 
  url: supabaseUrl.substring(0, 30) + '***',
  hasKey: !!supabaseAnonKey 
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'gr-installment-manager@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Add connection health check
let connectionHealthy = true
let lastHealthCheck = Date.now()

export const checkSupabaseHealth = async () => {
  try {
    const now = Date.now()
    
    // Only check health every 30 seconds to avoid spam
    if (now - lastHealthCheck < 30000 && connectionHealthy) {
      return connectionHealthy
    }
    
    console.log('🩺 Checking Supabase connection health...')
    const healthPromise = supabase.from('users').select('count').limit(1)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), 5000)
    )
    
    await Promise.race([healthPromise, timeoutPromise])
    
    connectionHealthy = true
    lastHealthCheck = now
    console.log('✅ Supabase connection healthy')
    return true
  } catch (error) {
    console.error('❌ Supabase connection unhealthy:', error)
    connectionHealthy = false
    lastHealthCheck = Date.now()
    return false
  }
}

export default supabase

import SupabaseTest from '@/components/debug/SupabaseTest'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Debug & Setup Page</h1>
        
        <div className="space-y-8">
          <SupabaseTest />
          
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>
            <div className="prose max-w-none">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="text-blue-600">supabase.com</a></li>
                <li>Go to Settings → API and copy your Project URL and Anon key</li>
                <li>Create a <code>.env.local</code> file in your project root with:
                  <pre className="bg-gray-100 p-2 mt-2 rounded text-sm">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`}
                  </pre>
                </li>
                <li>In Supabase SQL Editor, run the schema from <code>database/schema.sql</code></li>
                <li>In Authentication → Users, create user with email: admin@fmtire.com, password: password123</li>
                <li>Copy the User ID and run this in SQL Editor:
                  <pre className="bg-gray-100 p-2 mt-2 rounded text-sm">
{`INSERT INTO users (id, email, password_hash, role, full_name, nic_number, phone, is_active) 
VALUES ('USER_ID_HERE', 'admin@fmtire.com', 'managed_by_supabase_auth', 'super_admin', 'System Administrator', '123456789V', '0771234567', true);`}
                  </pre>
                </li>
                <li>Restart your dev server and test the connection above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


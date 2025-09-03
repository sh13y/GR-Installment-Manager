import LoginForm from '@/components/auth/LoginForm'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

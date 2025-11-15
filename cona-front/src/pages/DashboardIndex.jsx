import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

export default function DashboardIndex() {
  const { user } = useAuth()
  if (!user) return null
  const path = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/employee'
  return <Navigate to={path} replace />
}

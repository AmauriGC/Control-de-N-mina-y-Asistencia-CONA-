import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!roles.includes(role)) {
    const to = role === 'ADMIN' ? '/admin' : '/employee'
    return <Navigate to={to} replace />
  }
  return children
}

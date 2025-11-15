"use client"

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const roleHome = (role) => (role === 'admin' ? '/dashboard/admin' : role === 'employee' ? '/dashboard/employee' : '/dashboard')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      navigate(roleHome(user.role), { replace: true })
    }
  }, [isAuthenticated, user, allowedRoles, navigate])

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) return null
  return <>{children}</>
}

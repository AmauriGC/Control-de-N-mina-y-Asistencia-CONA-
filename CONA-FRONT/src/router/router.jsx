import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import AdminHome from '../pages/admin/AdminHome'
import EmployeeHome from '../pages/employee/EmployeeHome'
import DashboardLayout from '../layouts/DashboardLayout'
import RequireRole from './RequireRole'
import { useAuth } from '../context/AuthContext'

function RootRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={role === 'ADMIN' ? '/admin' : '/employee'} replace />
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <RequireRole roles={['ADMIN']}>
        <DashboardLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <AdminHome /> },
    ],
  },
  {
    path: '/employee',
    element: (
      <RequireRole roles={['EMPLOYEE']}>
        <DashboardLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <EmployeeHome /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router


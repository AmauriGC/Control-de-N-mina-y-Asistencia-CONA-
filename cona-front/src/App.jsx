import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import Login from '@/pages/Login'
import ClockIn from '@/pages/ClockIn'
import DashboardAdmin from '@/pages/DashboardAdmin'
import DashboardEmployee from '@/pages/DashboardEmployee'
import Attendance from '@/pages/Attendance'
import Employees from '@/pages/Employees'
import JustificationsAdmin from '@/pages/JustificationsAdmin'
import JustificationsEmployee from '@/pages/JustificationsEmployee'
import VacationsAdmin from '@/pages/VacationsAdmin'
import VacationsEmployee from '@/pages/VacationsEmployee'
import Config from '@/pages/Config'
import DashboardLayout from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import DashboardIndex from '@/pages/DashboardIndex'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clock-in" element={<ClockIn />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardAdmin /></ProtectedRoute>} />
            <Route path="employee" element={<ProtectedRoute allowedRoles={["employee"]}><DashboardEmployee /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute allowedRoles={["admin"]}><Employees /></ProtectedRoute>} />
            <Route path="justifications/admin" element={<ProtectedRoute allowedRoles={["admin"]}><JustificationsAdmin /></ProtectedRoute>} />
            <Route path="justifications/employee" element={<ProtectedRoute allowedRoles={["employee"]}><JustificationsEmployee /></ProtectedRoute>} />
            <Route path="vacations/admin" element={<ProtectedRoute allowedRoles={["admin"]}><VacationsAdmin /></ProtectedRoute>} />
            <Route path="vacations/employee" element={<ProtectedRoute allowedRoles={["employee"]}><VacationsEmployee /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={["employee"]}><Attendance /></ProtectedRoute>} />
            <Route path="config" element={<ProtectedRoute allowedRoles={["admin"]}><Config /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

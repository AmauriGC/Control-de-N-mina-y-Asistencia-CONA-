import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, AlertTriangle, FileText, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'
import { useState, useEffect } from 'react'
import { employeeService } from '@/admin/pages/employees/service/employeeService'
import { alertConfig } from '@/lib/alert-config'
import { attendanceService } from '../service/attendanceService'
import { payrollService } from '../service/payrollService'
import { formatISODateLocal } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

export default function DashboardEmployee() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [recentAttendance, setRecentAttendance] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [latestPayroll, setLatestPayroll] = useState(null)
  const [payrollLoading, setPayrollLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const response = await employeeService.getByUserId(user.id)
      if (response.success) {
        setProfile(response.data)
        // Cargar asistencia reciente y nómina
        loadRecentAttendance(response.data.id)
        loadLatestPayroll(response.data.id)
      } else {
        if (response.message) {
          alertConfig.toastError({ title: "Error", text: response.message })
        }
      }
    } catch (error) {
      alertConfig.toastError({ title: "Error", text: "No se pudo cargar el perfil" })
    } finally {
      setProfileLoading(false)
    }
  }
  const loadRecentAttendance = async (employeeId) => {
    try {
      setAttendanceLoading(true)
      const res = await attendanceService.getRecentEmployeeAttendance(employeeId, 4)
      if (res.success) {
        setRecentAttendance(res.data || [])
      }
    } catch (e) {
      // opcional: toast
    } finally {
      setAttendanceLoading(false)
    }
  }

  const loadLatestPayroll = async (employeeId) => {
    try {
      setPayrollLoading(true)
      console.log('Loading payroll for employee:', employeeId)
      const res = await payrollService.getLatestPayroll(employeeId)
      console.log('Payroll response:', res)
      if (res.success) {
        setLatestPayroll(res.data)
        console.log('Payroll data set:', res.data)
      } else {
        console.error('Payroll error:', res.message)
        alertConfig.toastError({ title: "Error", text: res.message })
      }
    } catch (e) {
      console.error('Payroll exception:', e)
      alertConfig.toastError({ title: "Error", text: "No se pudo cargar la nómina" })
    } finally {
      setPayrollLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Mi Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Días Trabajados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Días de Vacaciones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retardos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Nómina */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Mi Última Nómina
          </CardTitle>
          <CardDescription>
            {latestPayroll ? payrollService.formatPayrollPeriod(latestPayroll.periodStart, latestPayroll.periodEnd) : 'Información de nómina'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payrollLoading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando nómina...</div>
          ) : latestPayroll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Días Trabajados</p>
                <p className="text-2xl font-bold text-green-600">{latestPayroll.normalDaysWorked}</p>
                <p className="text-xs text-muted-foreground">{payrollService.formatCurrency(latestPayroll.normalDaysSalary)}</p>
              </div>
              
              {latestPayroll.vacationDays > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Días de Vacaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{latestPayroll.vacationDays}</p>
                  <p className="text-xs text-muted-foreground">{payrollService.formatCurrency(latestPayroll.vacationDaysSalary)}</p>
                </div>
              )}
              
              {latestPayroll.lateDays > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Días con Retardo</p>
                  <p className="text-2xl font-bold text-yellow-600">{latestPayroll.lateDays}</p>
                  <p className="text-xs text-muted-foreground">{payrollService.formatCurrency(latestPayroll.lateDaysSalary)}</p>
                </div>
              )}
              
              {latestPayroll.absentDays > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Días de Falta</p>
                  <p className="text-2xl font-bold text-red-600">{latestPayroll.absentDays}</p>
                  <p className="text-xs text-muted-foreground">Sin pago</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No hay información de nómina disponible</div>
          )}
          
          {latestPayroll && (
            <div className="mt-6 pt-4 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Salario Base:</span>
                <span className="text-lg font-semibold">{payrollService.formatCurrency(latestPayroll.baseSalary)}</span>
              </div>
              
              {latestPayroll.latePenaltyDeduction > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span className="font-medium">Descuento por Retardos:</span>
                  <span className="text-lg font-semibold">-{payrollService.formatCurrency(latestPayroll.latePenaltyDeduction)}</span>
                </div>
              )}
              
              {latestPayroll.bonus > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-medium">Bono:</span>
                  <span className="text-lg font-semibold">+{payrollService.formatCurrency(latestPayroll.bonus)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{payrollService.formatCurrency(latestPayroll.totalSalary)}</span>
              </div>
              
              {latestPayroll.hasBonusPenalties && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Este período tuvo faltas o retardos, por lo que no se aplicó el bono completo.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mi Asistencia Reciente</CardTitle>
          <CardDescription>Últimos 4 registros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceLoading ? (
              <div className="text-center py-2 text-muted-foreground">Cargando asistencia...</div>
            ) : recentAttendance.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground">Sin registros recientes</div>
            ) : (
              recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{formatISODateLocal(record.date)}</p>
                    <p className="text-sm text-muted-foreground">Entrada: {record.checkInTime || '-'} | Salida: {record.checkOutTime || '-'}</p>
                  </div>
                  <Badge variant={record.status === 'LATE' ? 'destructive' : 'secondary'}>
                    {record.status === 'LATE' ? 'Retardo' : 'A tiempo'}
                  </Badge>
                </div>
              ))
            )}
          </div>
          <Link to="/dashboard/attendance">
            <Button variant="outline" className="w-full mt-4">Ver historial completo</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link to="/dashboard/justifications/employee">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Justificar Falta
              </CardTitle>
              <CardDescription>Sube documentos para justificar ausencias</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link to="/dashboard/vacations/employee">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Solicitar Vacaciones
              </CardTitle>
              <CardDescription>Programa tus días de descanso</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </CardTitle>
          <CardDescription>Información personal y laboral</CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="text-center py-4">Cargando perfil...</div>
          ) : profile ? (
            <div className="space-y-2">
              <p><strong>Nombre:</strong> {profile.fullName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Puesto:</strong> {profile.position}</p>
              <p><strong>RFC:</strong> {profile.rfc}</p>
              <p><strong>Pago por Hora:</strong> ${profile.hourlyRate}</p>
              <p><strong>Tipo de Contrato:</strong> {profile.contractType === 'FULL_TIME' ? 'Tiempo Completo' : profile.contractType === 'PART_TIME' ? 'Medio Tiempo' : 'Contratista'}</p>
              <p><strong>Fecha Inicio:</strong> {profile.contractStartDate}</p>
              <p><strong>Estado:</strong> <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'secondary'}>{profile.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</Badge></p>
            </div>
          ) : (
            <div className="text-center py-4">No se pudo cargar el perfil</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

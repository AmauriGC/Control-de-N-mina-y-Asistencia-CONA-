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
  const [monthlyStats, setMonthlyStats] = useState({ totalDays: 0, presentDays: 0, lateDays: 0, absentDays: 0, vacationDays: 0 })
  const [statsLoading, setStatsLoading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

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
        
        // Cargar asistencia reciente, nómina y estadísticas
        loadRecentAttendance(response.data.id)
        loadLatestPayroll(response.data.id)
        loadMonthlyStats(response.data.id)
      } else {
        console.error('Failed to load profile:', response.message)
        if (response.message) {
          alertConfig.toastError({ title: "Error", text: response.message, error: response })
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error)
      alertConfig.toastError({ title: "Error", text: "No se pudo cargar el perfil" })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleDownloadPayrollPdf = async () => {
    if (!profile?.id || !latestPayroll) return
    try {
      setDownloadingPdf(true)
      const res = await payrollService.downloadLatestPayrollPdf(profile.id)
      if (!res.success) {
        throw new Error(res.message || 'No se pudo descargar el PDF')
      }
      const blob = res.data?.data instanceof Blob ? res.data.data : new Blob([res.data?.data || res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const start = latestPayroll?.periodStart || ''
      const end = latestPayroll?.periodEnd || ''
      a.href = url
      a.download = `nomina_${start}_a_${end}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alertConfig.toastError({ title: 'Error', text: e.message || 'Error al descargar PDF', error: e })
    } finally {
      setDownloadingPdf(false)
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
      const res = await payrollService.getLatestPayroll(employeeId)
      if (res.success) {
        setLatestPayroll(res.data)
      } else {
        console.warn('No payroll data available:', res.message)
        // No mostrar error si simplemente no hay datos de nómina
        setLatestPayroll(null)
      }
    } catch (e) {
      console.warn('Payroll not available:', e.message)
      // Solo mostrar error si es un error real, no falta de datos
      setLatestPayroll(null)
    } finally {
      setPayrollLoading(false)
    }
  }

  const loadMonthlyStats = async (employeeId) => {
    try {
      setStatsLoading(true)
      // Obtener estadísticas del mes actual
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const res = await attendanceService.getEmployeeStats(employeeId, firstDayOfMonth, lastDayOfMonth)
      if (res.success) {
        setMonthlyStats(res.data)
      }
    } catch (e) {
      console.error('Stats error:', e)
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Mi Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name}
          {profile && <span> (ID Empleado: {profile.id})</span>}
        </p>
      </div>

      {profileLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Cargando información del empleado...
            </div>
          </CardContent>
        </Card>
      ) : !profile ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No se pudo cargar la información del empleado.</p>
              <p className="text-sm mt-2">Por favor, contacte al administrador del sistema.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {profile && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Días Trabajados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '-' : (monthlyStats.presentDays + monthlyStats.lateDays)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Días de Vacaciones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '-' : monthlyStats.vacationDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retardos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? '-' : monthlyStats.lateDays}
            </div>
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
          {latestPayroll && (
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleDownloadPayrollPdf} disabled={downloadingPdf}>
                {downloadingPdf ? 'Descargando…' : 'Descargar PDF'}
              </Button>
            </div>
          )}
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
              <div className="flex justify-between items-center text-red-600">
                  <span className="font-medium">Descuento por IMSS:</span>
                  <span className="text-lg font-semibold">-{payrollService.formatCurrency(latestPayroll.imssDeduction)}</span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                  <span className="font-medium">Descuento por ISR:</span>
                  <span className="text-lg font-semibold">-{payrollService.formatCurrency(latestPayroll.isrDeduction)}</span>
              </div>
              
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
                  <Badge variant={
                    record.status === 'LATE' ? 'destructive' : 
                    record.status === 'ABSENT' ? 'destructive' : 
                    record.status === 'VACATION' ? 'outline' :
                    record.status === 'JUSTIFIED_ABSENCE' ? 'secondary' :
                    record.status === 'HOLIDAY' ? 'default' :
                    record.status === 'NON_WORKING_DAY' ? 'secondary' : 'default'
                  }>
                    {record.status === 'LATE' ? 'Retardo' : 
                     record.status === 'ABSENT' ? 'Falta' :
                     record.status === 'VACATION' ? 'Vacaciones' :
                     record.status === 'JUSTIFIED_ABSENCE' ? 'Justificado' :
                     record.status === 'HOLIDAY' ? 'Día festivo' :
                     record.status === 'NON_WORKING_DAY' ? 'Día no laboral' : 'A tiempo'}
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
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { attendanceService } from '../service/attendanceService'
import { employeeService } from '@/admin/pages/employees/service/employeeService'
import { alertConfig } from '@/lib/alert-config'
import { formatISODateLocal } from '@/lib/utils'

export default function AttendancePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, lateDays: 0, absentDays: 0 })
  const [loading, setLoading] = useState(true)
  const [effectiveEmployeeId, setEffectiveEmployeeId] = useState(null)

  const statusLabels = {
    'PRESENT': 'A tiempo',
    'LATE': 'Retardo', 
    'ABSENT': 'Falta',
    'JUSTIFIED_ABSENCE': 'Justificado',
    'VACATION': 'Vacaciones'
  }

  const statusVariants = {
    'PRESENT': 'default',
    'LATE': 'destructive',
    'ABSENT': 'destructive', 
    'JUSTIFIED_ABSENCE': 'secondary',
    'VACATION': 'outline'
  }

  useEffect(() => {
    const init = async () => {
      if (!user) return
      // Si ya viene employeeId desde el token/usuario, úsalo
      if (user.employeeId) {
        setEffectiveEmployeeId(user.employeeId)
        await loadAttendanceData(user.employeeId)
        return
      }
      // De lo contrario, obtén el empleado por userId
      try {
        const res = await employeeService.getByUserId(user.id)
        if (res?.success && res.data?.id) {
          setEffectiveEmployeeId(res.data.id)
          await loadAttendanceData(res.data.id)
        }
      } catch (e) {
        // opcional: alerta silenciosa
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAttendanceData = async (empIdParam) => {
    const empId = empIdParam ?? effectiveEmployeeId ?? user?.employeeId
    if (!empId) return

    setLoading(true)
    try {
      // Obtener los últimos 30 días
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [attendanceResult, statsResult] = await Promise.all([
        attendanceService.getEmployeeAttendanceRange(empId, startDate, endDate),
        attendanceService.getEmployeeStats(empId, startDate, endDate)
      ])

      if (attendanceResult.success) {
        setAttendance(attendanceResult.data)
      } else {
        alertConfig.error(attendanceResult.message)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      alertConfig.error('Error al cargar los datos de asistencia')
    } finally {
      setLoading(false)
    }
  }

  const filtered = attendance.filter((r) => {
    const dateStr = typeof r.date === 'string' ? r.date : String(r.date ?? '')
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Mi Asistencia</h1>
        <p className="text-muted-foreground">Historial completo de registros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{loading ? '-' : stats.presentDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retardos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{loading ? '-' : stats.lateDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{loading ? '-' : stats.absentDays}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar por fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Cargando registros de asistencia...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'No se encontraron registros' : 'No hay registros de asistencia aún'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record?.date ? formatISODateLocal(record.date) : '-'}
                    </TableCell>
                    <TableCell>{record.checkInTime || '-'}</TableCell>
                    <TableCell>{record.checkOutTime || '-'}</TableCell>
                    <TableCell>
                      {record.hoursWorked 
                        ? `${Math.floor(record.hoursWorked)}h ${Math.round((record.hoursWorked % 1) * 60)}m`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.dailySalary !== null && record.dailySalary !== undefined
                        ? (() => {
                            const val = typeof record.dailySalary === 'number' 
                              ? record.dailySalary 
                              : parseFloat(record.dailySalary)
                            return isNaN(val) ? '-' : `$${val.toLocaleString()}`
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[record.status]}>
                        {statusLabels[record.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        if (record.status !== 'ABSENT' || !record?.date) return null
                        const today = new Date()
                        const recDate = new Date(record.date)
                        const diffDays = Math.floor((today - recDate) / (1000 * 60 * 60 * 24))
                        const withinWindow = diffDays >= 0 && diffDays <= 2
                        return withinWindow ? (
                          <Button size="sm" variant="outline" onClick={() => window.location.assign('/dashboard/justifications/employee')}>
                            Justificar
                          </Button>
                        ) : null
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

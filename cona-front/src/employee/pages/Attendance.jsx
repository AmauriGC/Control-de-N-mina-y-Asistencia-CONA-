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
import { useBackendErrors, useFieldValidation, rulesLib, makeRules } from '@/components/criteria/use-validation'
import FieldError from '@/components/criteria/FieldError'

export default function AttendancePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, lateDays: 0, absentDays: 0 })
  const [loading, setLoading] = useState(true)
  const [effectiveEmployeeId, setEffectiveEmployeeId] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 15

  const statusLabels = {
    'PRESENT': 'A tiempo',
    'LATE': 'Retardo', 
    'ABSENT': 'Falta',
    'JUSTIFIED_ABSENCE': 'Justificado',
    'VACATION': 'Vacaciones',
    'NON_WORKING_DAY': 'Día no laboral',
    'HOLIDAY': 'Día festivo'
  }

  const statusVariants = {
    'PRESENT': 'default',
    'LATE': 'destructive',
    'ABSENT': 'destructive', 
    'JUSTIFIED_ABSENCE': 'secondary',
    'VACATION': 'outline',
    'NON_WORKING_DAY': 'secondary',
    'HOLIDAY': 'default'
  }

  const be = useBackendErrors()
  const todayStr = new Date().toISOString().split('T')[0]
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startDateField = useFieldValidation(thirtyDaysAgoStr, makeRules(rulesLib.isValidDate()), (v) => v)
  const endDateField = useFieldValidation(todayStr, makeRules(rulesLib.isValidDate(), rulesLib.dateAfter(startDateField.value)), (v) => v)

  useEffect(() => {
    const init = async () => {
      if (!user) {
        return
      }
      
      
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
        } else {
          alertConfig.error('No se encontró un empleado asociado a este usuario')
        }
      } catch (e) {
        console.error('Error fetching employee:', e)
        alertConfig.error('Error al buscar información del empleado: ' + e.message)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAttendanceData = async (empIdParam, page = 0) => {
    const empId = empIdParam ?? effectiveEmployeeId ?? user?.employeeId
    if (!empId) return

    setLoading(true)
    try {
      const startDate = startDateField.value
      const endDate = endDateField.value

      let attendanceResult
      try {
        attendanceResult = await attendanceService.getEmployeeAttendancePaginated(empId, page, pageSize, startDate, endDate)
      } catch (error) {
        // Fallback al endpoint por rango
        const rangeRes = await attendanceService.getEmployeeAttendanceRange(empId, startDate, endDate)
        if (!rangeRes.success) {
          be.setFromList(rangeRes.errors)
          alertConfig.error(rangeRes.message)
          throw new Error(rangeRes.message)
        }
        const allData = rangeRes.data || []
        const startIndex = page * pageSize
        const endIndex = startIndex + pageSize
        const paginatedData = allData.slice(startIndex, endIndex)
        attendanceResult = {
          success: true,
          data: {
            content: paginatedData,
            totalPages: Math.ceil(allData.length / pageSize),
            totalElements: allData.length,
            number: page
          },
          message: 'Asistencia cargada'
        }
      }

      const statsResult = await attendanceService.getEmployeeStats(empId, startDate, endDate)

      if (attendanceResult.success) {
        setAttendance(attendanceResult.data.content || [])
        setTotalPages(attendanceResult.data.totalPages || 0)
        setTotalElements(attendanceResult.data.totalElements || 0)
        setCurrentPage(page)
      } else {
        be.setFromList(attendanceResult.errors || [])
        alertConfig.error(attendanceResult.message)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      alertConfig.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadAttendanceData(null, newPage)
    }
  }

  const filtered = attendance.filter((r) => {
    if (!searchTerm) return true
    const dateStr = typeof r.date === 'string' ? r.date : String(r.date ?? '')
    return dateStr.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Mi Asistencia</h1>
        <p className="text-muted-foreground">
          Historial completo de registros
          {effectiveEmployeeId && <span> (Empleado ID: {effectiveEmployeeId})</span>}
        </p>
      </div>

      {!effectiveEmployeeId && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No se pudo identificar su información de empleado.</p>
              <p className="text-sm mt-2">Por favor, contacte al administrador del sistema.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {effectiveEmployeeId && (
        <>
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
              <CardDescription>
                {totalElements > 0 ? `${totalElements} registros encontrados` : 'Historial completo'}
                {currentPage < totalPages - 1 && ` (Página ${currentPage + 1} de ${totalPages})`}
              </CardDescription>
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
                        ? record.hoursWorked % 1 === 0 
                          ? `${Math.floor(record.hoursWorked)}h`
                          : `${Math.floor(record.hoursWorked)}h ${Math.round((record.hoursWorked % 1) * 60)}m`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.dailySalary !== null && record.dailySalary !== undefined
                        ? (() => {
                            const val = typeof record.dailySalary === 'number' 
                              ? record.dailySalary 
                              : parseFloat(record.dailySalary)
                            if (isNaN(val) || val === 0) return '-'
                            // Formatear sin decimales si es un número entero
                            return `$${val % 1 === 0 ? val.toLocaleString() : val.toFixed(2)}`
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
          
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage * pageSize) + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm px-3 py-1 bg-muted rounded">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}

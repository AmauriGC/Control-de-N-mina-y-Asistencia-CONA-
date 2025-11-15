"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { alertConfig } from '@/lib/alert-config'

const mockVacationRequests = [
  {
    id: '1',
    employeeId: 'E002',
    employeeName: 'María Empleada',
    startDate: '2024-02-15',
    endDate: '2024-02-19',
    totalDays: 5,
    vacationPay: 12600,
    payrollDeduction: 200,
    status: 'pending',
    requestedAt: '2024-01-18 10:30',
  },
  {
    id: '2',
    employeeId: 'E003',
    employeeName: 'Juan Pérez',
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    totalDays: 6,
    vacationPay: 16500,
    payrollDeduction: 200,
    status: 'approved',
    requestedAt: '2024-01-15 14:20',
  },
]

export default function VacationsAdmin() {
  const [vacationRequests, setVacationRequests] = useState(mockVacationRequests)
  const [filterStatus, setFilterStatus] = useState('all')
  

  const filteredRequests = vacationRequests.filter((v) => filterStatus === 'all' || v.status === filterStatus)
  const handleApprove = async (id) => {
    const ok = await alertConfig.confirm({ title: '¿Aprobar solicitud?', text: 'Se descontarán los días correspondientes.' })
    if (!ok) return
    setVacationRequests((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'approved' } : v)))
    await alertConfig.toastSuccess({ title: 'Vacaciones aprobadas', text: 'La solicitud ha sido aprobada' })
  }
  const handleReject = async (id) => {
    const ok = await alertConfig.confirm({ title: '¿Rechazar solicitud?', text: 'El empleado será notificado.' })
    if (!ok) return
    setVacationRequests((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'rejected' } : v)))
    await alertConfig.toastInfo({ title: 'Solicitud rechazada', text: 'Se notificó al empleado' })
  }
  const pendingCount = vacationRequests.filter((v) => v.status === 'pending').length

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Vacaciones</h1>
          <p className="text-muted-foreground">Revisa y aprueba las solicitudes del personal</p>
        </div>
        {pendingCount > 0 && <Badge variant="destructive" className="text-lg px-4 py-2">{pendingCount} Pendientes</Badge>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Solicitudes" value={vacationRequests.length} />
        <StatCard title="Pendientes" value={<span className="text-destructive">{vacationRequests.filter((v) => v.status === 'pending').length}</span>} />
        <StatCard title="Aprobadas" value={<span className="text-primary">{vacationRequests.filter((v) => v.status === 'approved').length}</span>} />
        <StatCard title="Total Días Solicitados" value={vacationRequests.reduce((sum, v) => sum + v.totalDays, 0)} />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes de Vacaciones</CardTitle>
              <CardDescription>Todas las solicitudes del personal</CardDescription>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Pago Vacacional</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vacation.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{vacation.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vacation.startDate}</TableCell>
                    <TableCell>{vacation.endDate}</TableCell>
                    <TableCell>{vacation.totalDays} días</TableCell>
                    <TableCell className="text-primary font-semibold">${vacation.vacationPay.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">${vacation.payrollDeduction}</TableCell>
                    <TableCell>
                      <Badge variant={vacation.status === 'approved' ? 'default' : vacation.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {vacation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {vacation.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {vacation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {vacation.status === 'pending' ? 'Pendiente' : vacation.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vacation.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(vacation.id)}><CheckCircle className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(vacation.id)}><XCircle className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  )
}

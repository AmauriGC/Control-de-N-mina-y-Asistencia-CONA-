"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const mockAttendance = [
  { id: '1', date: '2024-01-18', entry: '08:58', exit: '17:32', hours: 8.5, status: 'on-time' },
  { id: '2', date: '2024-01-17', entry: '08:50', exit: '17:25', hours: 8.5, status: 'on-time' },
  { id: '3', date: '2024-01-16', entry: '09:10', exit: '17:35', hours: 8.4, status: 'late' },
  { id: '4', date: '2024-01-15', entry: '08:55', exit: '17:30', hours: 8.5, status: 'on-time' },
  { id: '5', date: '2024-01-12', entry: '-', exit: '-', hours: 0, status: 'absent' },
  { id: '6', date: '2024-01-11', entry: '09:05', exit: '17:28', hours: 8.4, status: 'late' },
  { id: '7', date: '2024-01-10', entry: '08:52', exit: '17:35', hours: 8.7, status: 'on-time' },
]

export default function AttendancePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  const statusLabels = {
    'on-time': 'A tiempo',
    'late': 'Retardo',
    'absent': 'Falta',
    'justified': 'Justificado',
  }

  const statusVariants = {
    'on-time': 'secondary',
    'late': 'destructive',
    'absent': 'destructive',
    'justified': 'default',
  }

  const filtered = mockAttendance.filter((r) =>
    r.date.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retardos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
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
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>{record.entry}</TableCell>
                  <TableCell>{record.exit}</TableCell>
                  <TableCell>{record.hours}h</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.status === 'absent' && (
                      <Button size="sm" variant="outline">Justificar</Button>
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

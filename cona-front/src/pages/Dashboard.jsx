"use client"

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, DollarSign, AlertTriangle, FileText, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Link } from 'react-router-dom'

const attendanceData = [
  { day: 'Lun', present: 45, late: 5, absent: 2 },
  { day: 'Mar', present: 47, late: 3, absent: 2 },
  { day: 'Mié', present: 46, late: 4, absent: 2 },
  { day: 'Jue', present: 48, late: 2, absent: 2 },
  { day: 'Vie', present: 44, late: 6, absent: 2 },
]

const overtimeData = [
  { week: 'Sem 1', hours: 24 },
  { week: 'Sem 2', hours: 32 },
  { week: 'Sem 3', hours: 28 },
  { week: 'Sem 4', hours: 36 },
]

const pendingJustifications = [
  { id: '1', employee: 'María Empleada', date: '2024-01-15', daysLeft: 1 },
  { id: '2', employee: 'Juan Pérez', date: '2024-01-16', daysLeft: 0 },
  { id: '3', employee: 'Ana García', date: '2024-01-14', daysLeft: 2 },
]

const contractAlerts = [
  { id: '1', employee: 'Carlos Martínez', endDate: '2024-02-15', daysLeft: 15, priority: 'high' },
  { id: '2', employee: 'Laura Rodríguez', endDate: '2024-02-28', daysLeft: 28, priority: 'medium' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'employee') {
    return <EmployeeDashboard />
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52</div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48/52</div>
            <p className="text-xs text-muted-foreground mt-1">92.3% de asistencia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nómina Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$285,400</div>
            <p className="text-xs text-muted-foreground mt-1">MXN para 52 empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">3 justificaciones, 2 contratos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Justificaciones Pendientes</CardTitle>
                <CardDescription>Requieren revisión urgente</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingJustifications.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.employee}</p>
                  <p className="text-sm text-muted-foreground">Falta del {item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.daysLeft === 0 ? 'destructive' : 'secondary'}>
                    {item.daysLeft === 0 ? 'Último día' : `${item.daysLeft} días`}
                  </Badge>
                  <Link to="/dashboard/justifications">
                    <Button size="sm">Revisar</Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link to="/dashboard/justifications">
              <Button variant="outline" className="w-full">Ver todas las justificaciones</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contratos por Vencer</CardTitle>
                <CardDescription>Atención requerida</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.employee}</p>
                  <p className="text-sm text-muted-foreground">Vence el {item.endDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                    {item.daysLeft} días
                  </Badge>
                  <Link to="/dashboard/employees">
                    <Button size="sm">Ver</Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link to="/dashboard/employees">
              <Button variant="outline" className="w-full">Ver todos los empleados</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
            <CardDescription>Comparación de asistencia, retardos y faltas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="rgb(112, 148, 134)" name="Presentes" />
                <Bar dataKey="late" fill="rgb(145, 168, 173)" name="Retardos" />
                <Bar dataKey="absent" fill="rgb(220, 38, 38)" name="Faltas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas Extra Mensuales</CardTitle>
            <CardDescription>Tendencia de horas extra por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="rgb(112, 148, 134)" strokeWidth={2} name="Horas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmployeeDashboard() {
  const { user } = useAuth()

  const myAttendance = [
    { date: '2024-01-15', entry: '08:55', exit: '17:30', status: 'on-time' },
    { date: '2024-01-16', entry: '09:10', exit: '17:35', status: 'late' },
    { date: '2024-01-17', entry: '08:50', exit: '17:25', status: 'on-time' },
    { date: '2024-01-18', entry: '08:58', exit: '17:32', status: 'on-time' },
  ]

  return (
    <div className="p-8 space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle>Mi Asistencia Reciente</CardTitle>
          <CardDescription>Últimos 4 días de registro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myAttendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{record.date}</p>
                  <p className="text-sm text-muted-foreground">Entrada: {record.entry} | Salida: {record.exit}</p>
                </div>
                <Badge variant={record.status === 'late' ? 'destructive' : 'secondary'}>
                  {record.status === 'late' ? 'Retardo' : 'A tiempo'}
                </Badge>
              </div>
            ))}
          </div>
          <Link to="/dashboard/attendance">
            <Button variant="outline" className="w-full mt-4">Ver historial completo</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link to="/dashboard/justifications">
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
          <Link to="/dashboard/vacations">
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
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, AlertTriangle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'

export default function DashboardEmployee() {
  const { user } = useAuth()
  const myAttendance = [
    { date: '2024-01-15', entry: '08:55', exit: '17:30', status: 'on-time' },
    { date: '2024-01-16', entry: '09:10', exit: '17:35', status: 'late' },
    { date: '2024-01-17', entry: '08:50', exit: '17:25', status: 'on-time' },
    { date: '2024-01-18', entry: '08:58', exit: '17:32', status: 'on-time' },
  ]

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
    </div>
  )
}

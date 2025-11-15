"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { alertConfig } from '@/lib/alert-config'

const mockVacationRequests = [
  {
    id: '1',
    startDate: '2024-02-15',
    endDate: '2024-02-19',
    totalDays: 5,
    vacationPay: 12600,
    payrollDeduction: 200,
    status: 'pending',
    requestedAt: '2024-01-18 10:30',
  },
]

export default function VacationsEmployee() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const myVacations = mockVacationRequests
  const availableDays = 12

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Mis Vacaciones</h1>
          <p className="text-muted-foreground">Solicita y administra tus días de descanso</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Solicitar Vacaciones
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Solicitud de Vacaciones</DialogTitle>
              <DialogDescription>Selecciona las fechas para tu periodo vacacional</DialogDescription>
            </DialogHeader>
            <VacationRequestForm availableDays={availableDays} weeklySalary={4200} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-primary">Días Disponibles</CardTitle>
              <CardDescription>Tu saldo actual de vacaciones</CardDescription>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-primary">{availableDays}</div>
          <p className="text-sm text-muted-foreground mt-2">días de vacaciones disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cómo Funcionan las Vacaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem icon={DollarSign} title="Pago Vacacional" text={`Recibirás 3 veces tu salario semanal como pago vacacional ($${(4200 * 3).toLocaleString()} MXN).`} />
          <InfoItem icon={AlertCircle} title="Descuento en Nómina" text="Se aplicará un descuento de $200 MXN en tu próxima nómina." />
          <InfoItem icon={Clock} title="Días Descontados" text="Los días solicitados se descuentan de tu saldo una vez aprobados." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Solicitudes</CardTitle>
          <CardDescription>Historial de solicitudes de vacaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Pago Vacacional</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myVacations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No tienes solicitudes de vacaciones aún</TableCell>
                  </TableRow>
                ) : (
                  myVacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                      <TableCell className="font-medium">{vacation.startDate}</TableCell>
                      <TableCell>{vacation.endDate}</TableCell>
                      <TableCell>{vacation.totalDays} días</TableCell>
                      <TableCell className="text-primary font-semibold">+${vacation.vacationPay.toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">-${vacation.payrollDeduction}</TableCell>
                      <TableCell>
                        <Badge variant={vacation.status === 'approved' ? 'default' : vacation.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {vacation.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {vacation.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {vacation.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {vacation.status === 'pending' ? 'Pendiente' : vacation.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                        </Badge>
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

function VacationRequestForm({ availableDays, weeklySalary, onClose }) {
  const [formData, setFormData] = useState({ startDate: '', endDate: '' })

  const calculateDays = (start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    const diff = e.getTime() - s.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days : 0
  }
  const totalDays = calculateDays(formData.startDate, formData.endDate)
  const vacationPay = weeklySalary * 3
  const payrollDeduction = 200

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate) {
      await alertConfig.toastError({ title: 'Fechas requeridas', text: 'Selecciona fechas de inicio y fin' })
      return
    }
    if (totalDays > availableDays) {
      await alertConfig.toastError({ title: 'Límite excedido', text: `Solo tienes ${availableDays} días disponibles` })
      return
    }
    if (totalDays < 1) {
      await alertConfig.toastError({ title: 'Rango inválido', text: 'La fecha de fin debe ser posterior a la de inicio' })
      return
    }
    await alertConfig.toastSuccess({ title: 'Solicitud enviada', text: `Tu solicitud de ${totalDays} días ha sido enviada para aprobación` })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de Inicio *</Label>
          <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de Fin *</Label>
          <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate || new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      {totalDays > 0 && (
        <Card className={totalDays > availableDays ? 'border-destructive' : 'border-primary'}>
          <CardContent className="pt-6 space-y-3">
            <Row label="Total días solicitados:" value={<span className="text-2xl font-bold">{totalDays} días</span>} />
            <Row label="Días disponibles:" value={<span className={`font-semibold ${totalDays > availableDays ? 'text-destructive' : 'text-primary'}`}>{availableDays} días</span>} />
            <div className="pt-3 border-t space-y-2">
              <Row label="Pago vacacional:" value={<span className="font-semibold text-primary">+${vacationPay.toLocaleString()} MXN</span>} />
              <Row label="Descuento nómina:" value={<span className="font-semibold text-destructive">-${payrollDeduction} MXN</span>} />
            </div>
            {totalDays > availableDays && <p className="text-sm text-destructive font-medium">No tienes suficientes días disponibles</p>}
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={totalDays < 1 || totalDays > availableDays}>Enviar Solicitud</Button>
      </div>
    </form>
  )
}

function InfoItem({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><Icon className="h-4 w-4 text-primary" /></div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span>{value}</div>
}

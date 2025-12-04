"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { alertConfig } from '@/lib/alert-config'
import { vacationsService } from '../service/vacationsService.js'
import { useBackendErrors, useFieldValidation, makeRules, rulesLib } from '@/components/criteria/use-validation'
import FieldError from '@/components/criteria/FieldError'
import FieldHint from '@/components/criteria/FieldHint'
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function VacationsEmployee() {
  const be = useBackendErrors()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [myVacations, setMyVacations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVacation, setSelectedVacation] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const availableDays = 12

  const today = new Date().toISOString().split('T')[0]
  const startField = useFieldValidation(today, makeRules(rulesLib.isValidDate()), (v) => v)
  const endField = useFieldValidation(today, makeRules(rulesLib.isValidDate(), rulesLib.dateAfter(startField.value)), (v) => v)
  const reasonField = useFieldValidation('', makeRules(rulesLib.optional(rulesLib.textGeneral())))

  useEffect(() => {
    loadMyRequests()
  }, [])

  const loadMyRequests = async () => {
    try {
      setLoading(true)
      const response = await vacationsService.getMyRequests()
      setMyVacations(response.data)
    } catch (error) {
      console.error('Error loading requests:', error)
      await alertConfig.toastError({ 
        title: 'Error', 
        text: error.message || 'No se pudieron cargar las solicitudes' 
      })
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!startField.isValid || !endField.isValid) {
      startField.onBlur(); endField.onBlur();
      alertConfig.error(startField.error || endField.error)
      return
    }
    const payload = {
      startDate: startField.value,
      endDate: endField.value,
      type: 'VACATION',
      reason: reasonField.value || ''
    }
    const res = await vacationsService.createRequest(payload)
    if (res.success) {
      alertConfig.success(res.message)
      be.reset()
    } else {
      be.setFromList(res.errors || [])
      alertConfig.error(res.message)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Mis Permisos</h1>
          <p className="text-muted-foreground">Solicita y administra tus permisos y vacaciones</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Solicitar Permiso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Solicitar Permiso</DialogTitle>
              <DialogDescription>Completa la información para tu solicitud de permiso</DialogDescription>
            </DialogHeader>
            <VacationRequestForm 
              availableDays={availableDays} 
              weeklySalary={4200} 
              onClose={() => {
                setIsDialogOpen(false)
                loadMyRequests() // Refresh the list
              }}
              loadMyRequests={loadMyRequests}
            />
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
          <InfoItem icon={DollarSign} title="Pago Vacacional" text={`Recibirás aproximadamente 3 veces tu salario semanal como pago vacacional.`} />
          <InfoItem icon={Calendar} title="Tipos de Permisos" text="Puedes solicitar vacaciones, incapacidades médicas o permisos personales." />
          <InfoItem icon={Clock} title="Proceso de Aprobación" text="Las solicitudes requieren aprobación del administrador. Recibirás una notificación con la decisión." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Solicitudes</CardTitle>
          <CardDescription>Historial de solicitudes de permisos y vacaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Fecha Inicio</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha Fin</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Días</TableHead>
                  <TableHead className="hidden lg:table-cell">Pago Vacacional</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Cargando solicitudes...</TableCell>
                  </TableRow>
                ) : myVacations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No tienes solicitudes de permisos aún</TableCell>
                  </TableRow>
                ) : (
                  myVacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                      <TableCell className="hidden sm:table-cell font-medium">{vacation.startDate}</TableCell>
                      <TableCell className="hidden sm:table-cell">{vacation.endDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <Badge variant="outline" className="w-fit">
                            {vacation.type === 'VACATION' ? 'Vacación' : vacation.type === 'SICK_LEAVE' ? 'Incapacidad' : 'Personal'}
                          </Badge>
                          <div className="sm:hidden text-xs text-muted-foreground">
                            {vacation.startDate} - {vacation.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-semibold">{vacation.totalDays}</span>
                        <span className="text-muted-foreground ml-1">días</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-primary font-semibold">
                        {vacation.vacationPay ? `$${vacation.vacationPay.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={vacation.status === 'APPROVED' ? 'default' : vacation.status === 'REJECTED' ? 'destructive' : 'secondary'} className="w-fit">
                            {vacation.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                            {vacation.status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {vacation.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                            {vacation.status === 'PENDING' ? 'Pendiente' : vacation.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                          </Badge>
                          <div className="md:hidden text-xs text-muted-foreground">
                            {vacation.totalDays} días
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="max-w-32 lg:max-w-48">
                          {vacation.reason ? (
                            <p className="text-sm text-muted-foreground truncate" title={vacation.reason}>
                              {vacation.reason}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedVacation(vacation);
                            setIsDetailsOpen(true);
                          }}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      {selectedVacation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-lg mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Detalles de la Solicitud</DialogTitle>
              <DialogDescription>
                {selectedVacation.employeeName ? (
                  <span className="inline-flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{selectedVacation.employeeName}</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">ID #{selectedVacation.id}</span>
                  </span>
                ) : (
                  `${selectedVacation.startDate} - ${selectedVacation.endDate} • ${selectedVacation.totalDays} días`
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border bg-muted/10">
                  <p className="text-xs text-muted-foreground">Rango de fechas</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedVacation.startDate}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{selectedVacation.endDate}</span>
                  </div>
                </div>
                <div className="p-3 rounded-md border bg-muted/10">
                  <p className="text-xs text-muted-foreground">Días solicitados</p>
                  <div className="mt-1 text-sm font-semibold">{selectedVacation.totalDays} días</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border bg-muted/10">
                  <p className="text-xs text-muted-foreground">Tipo de solicitud</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="w-fit text-xs">
                      {selectedVacation.type === 'VACATION' ? 'Vacaciones' :
                       selectedVacation.type === 'SICK_LEAVE' ? 'Incapacidad Médica' :
                       'Permiso Personal'}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-md border bg-muted/10">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <div className="mt-1">
                    <Badge variant={selectedVacation.status === 'APPROVED' ? 'default' : selectedVacation.status === 'REJECTED' ? 'destructive' : 'secondary'} className="w-fit text-xs">
                      {selectedVacation.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                      {selectedVacation.status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {selectedVacation.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                      {selectedVacation.status === 'PENDING' ? 'Pendiente' : selectedVacation.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md border bg-muted/10">
                <p className="text-xs text-muted-foreground">Motivo de la solicitud</p>
                <div className="mt-1 text-sm">
                  {selectedVacation.reason ? (
                    <p className="text-muted-foreground">{selectedVacation.reason}</p>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Sin motivo especificado</span>
                  )}
                </div>
              </div>

              {selectedVacation.vacationPay && (
                <div className="p-3 rounded-md border bg-green-50">
                  <p className="text-xs text-muted-foreground">Pago vacacional</p>
                  <div className="mt-1 text-sm font-semibold text-primary">
                    ${selectedVacation.vacationPay.toLocaleString()}
                  </div>
                </div>
              )}

              {selectedVacation.reviewComments && (
                <div className="p-3 rounded-md border bg-blue-50">
                  <p className="text-xs text-muted-foreground">Comentarios del administrador</p>
                  <div className="mt-1 text-sm">{selectedVacation.reviewComments}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function VacationRequestForm({ availableDays, weeklySalary, onClose, loadMyRequests }) {
  const [formData, setFormData] = useState({ 
    startDate: '', 
    endDate: '', 
    type: 'VACATION',
    reason: '' 
  })
  const [submitting, setSubmitting] = useState(false)
  const be = useBackendErrors()
  const today = new Date().toISOString().split('T')[0]
  const startField = useFieldValidation(today, makeRules(rulesLib.isValidDate()), (v) => v)
  const endField = useFieldValidation(today, makeRules(rulesLib.isValidDate(), rulesLib.dateAfter(startField.value)), (v) => v)
  const reasonField = useFieldValidation('', makeRules(
    rulesLib.required('El motivo es obligatorio'),
    rulesLib.textGeneral('Caracteres no permitidos'),
    rulesLib.maxLength(500, 'Máximo 500 caracteres')
  ))

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
    if (!formData.type) {
      await alertConfig.toastError({ title: 'Tipo requerido', text: 'Selecciona el tipo de permiso' })
      return
    }
    if (formData.type === 'VACATION' && totalDays > availableDays) {
      await alertConfig.toastError({ title: 'Límite excedido', text: `Solo tienes ${availableDays} días disponibles` })
      return
    }
    if (totalDays < 1) {
      await alertConfig.toastError({ title: 'Rango inválido', text: 'La fecha de fin debe ser posterior a la de inicio' })
      return
    }
    if (!reasonField.isValid || reasonField.value.trim().length === 0) {
      reasonField.onBlur()
      await alertConfig.toastError({ title: 'Motivo inválido', text: reasonField.error || 'El motivo es obligatorio' })
      return
    }

    try {
      setSubmitting(true)
      const requestData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        reason: formData.reason
      }
      const res = await vacationsService.createRequest(requestData)
      if (res.success) {
        await alertConfig.toastSuccess({ title: 'Solicitud enviada', text: res.message })
        await loadMyRequests()
        onClose()
      } else {
        be.setFromList(res.errors || res.data || [])
        await alertConfig.toastError({
          title: 'Error',
          text: res.message,
          error: res,
        })
      }
    } catch (error) {
      await alertConfig.toastError({ title: 'Error', text: error.message, error })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Permiso *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VACATION">Vacación</SelectItem>
              <SelectItem value="SICK_LEAVE">Incapacidad</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio *</Label>
            <CalendarComponent
              value={formData.startDate}
              onChange={(dateObj, isoLocal) => {
                setFormData({ ...formData, startDate: isoLocal });
                startField.onChange({ target: { value: isoLocal } });
              }}
              minDate={new Date()}
              className="mt-1"
            />
            {startField.showError && (<FieldError error={startField.error} backendError={be.getFieldError('startDate')} />)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de Fin *</Label>
            <CalendarComponent
              value={formData.endDate}
              onChange={(dateObj, isoLocal) => {
                setFormData({ ...formData, endDate: isoLocal });
                endField.onChange({ target: { value: isoLocal } });
              }}
              minDate={formData.startDate ? formData.startDate : new Date()}
              className="mt-1"
            />
            {endField.showError && (<FieldError error={endField.error} backendError={be.getFieldError('endDate')} />)}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo *</Label>
          <Textarea
            id="reason"
            placeholder="Describe el motivo de tu solicitud..."
            value={reasonField.rawValue}
            onChange={(e) => {
              reasonField.onChange(e);
              setFormData({ ...formData, reason: e.target.value });
            }}
            onBlur={reasonField.onBlur}
            rows={3}
            aria-invalid={reasonField.showError && !!reasonField.error}
          />
          <FieldError error={reasonField.error} backendError={be.getFieldError('reason')} />
          <FieldHint value={reasonField.rawValue} max={500} />
        </div>
      </div>
      {totalDays > 0 && (
        <Card className={formData.type === 'VACATION' && totalDays > availableDays ? 'border-destructive' : 'border-primary'}>
          <CardContent className="pt-6 space-y-3">
            <Row label="Total días solicitados:" value={<span className="text-2xl font-bold">{totalDays} días</span>} />
            {formData.type === 'VACATION' && (
              <>
                <Row label="Días disponibles:" value={<span className={`font-semibold ${totalDays > availableDays ? 'text-destructive' : 'text-primary'}`}>{availableDays} días</span>} />
                <div className="pt-3 border-t space-y-2">
                  <Row label="Pago vacacional estimado:" value={<span className="font-semibold text-primary">${vacationPay.toLocaleString()} MXN</span>} />
                  <p className="text-xs text-muted-foreground">
                    * El pago vacacional es aproximado (3x salario semanal)
                  </p>
                </div>
                {totalDays > availableDays && <p className="text-sm text-destructive font-medium">No tienes suficientes días disponibles</p>}
              </>
            )}
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button 
          type="submit" 
          disabled={submitting || totalDays < 1 || (formData.type === 'VACATION' && totalDays > availableDays) || !reasonField.isValid || reasonField.value.trim().length === 0}
        >
          {submitting ? 'Enviando...' : 'Enviar Solicitud'}
        </Button>
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

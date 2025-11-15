"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'
import { alertConfig } from '@/lib/alert-config'

const mockAbsences = [
  { id: '1', date: '2024-01-15', status: 'absent', daysLeft: 1 },
  { id: '2', date: '2024-01-12', status: 'absent', daysLeft: 0 },
]

const mockJustifications = [
  {
    id: '1',
    employeeId: 'E002',
    employeeName: 'María Empleada',
    attendanceId: 'A001',
    date: '2024-01-16',
    documentType: 'Certificado Médico',
    documentUrl: '/documents/cert-001.pdf',
    comments: 'Cita médica programada',
    status: 'pending',
    submittedAt: '2024-01-17 10:30',
  },
  {
    id: '2',
    employeeId: 'E003',
    employeeName: 'Juan Pérez',
    attendanceId: 'A002',
    date: '2024-01-16',
    documentType: 'Permiso Personal',
    documentUrl: '/documents/permit-002.pdf',
    comments: 'Asunto familiar urgente',
    status: 'pending',
    submittedAt: '2024-01-17 09:15',
  },
  {
    id: '3',
    employeeId: 'E004',
    employeeName: 'Ana García',
    attendanceId: 'A003',
    date: '2024-01-14',
    documentType: 'Certificado Médico',
    documentUrl: '/documents/cert-003.pdf',
    comments: 'Gripe',
    status: 'approved',
    submittedAt: '2024-01-15 14:20',
    reviewedAt: '2024-01-15 16:00',
    reviewedBy: 'Admin Sistema',
  },
]

export default function JustificationsPage() {
  const { user } = useAuth()
  if (user?.role === 'employee') return <EmployeeJustifications />
  return <AdminJustifications />
}

function EmployeeJustifications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAbsence, setSelectedAbsence] = useState(null)
  

  const myJustifications = mockJustifications.filter((j) => j.employeeId === 'E002')

  const handleJustify = (absence) => {
    setSelectedAbsence(absence)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Justificaciones</h1>
        <p className="text-muted-foreground">Justifica tus ausencias subiendo documentos</p>
      </div>

      {mockAbsences.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Faltas Pendientes de Justificar</CardTitle>
                <CardDescription>Tienes {mockAbsences.length} falta(s) que requieren justificación</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAbsences.map((absence) => (
              <div key={absence.id} className="flex items-center justify-between p-4 bg-background border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Falta del {absence.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {absence.daysLeft === 0 ? (
                      <span className="text-destructive font-semibold">Último día para justificar</span>
                    ) : (
                      `Te quedan ${absence.daysLeft} días para justificar`
                    )}
                  </p>
                </div>
                <Button onClick={() => handleJustify(absence)} variant={absence.daysLeft === 0 ? 'destructive' : 'default'}>
                  Justificar Ahora
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Justificaciones</CardTitle>
          <CardDescription>Todas tus justificaciones enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha de Falta</TableHead>
                <TableHead>Tipo de Documento</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comentarios Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myJustifications.map((just) => (
                <TableRow key={just.id}>
                  <TableCell className="font-medium">{just.date}</TableCell>
                  <TableCell>{just.documentType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{just.submittedAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        just.status === 'approved' ? 'default' : just.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {just.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {just.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {just.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {just.status === 'pending' ? 'Pendiente' : just.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{just.reviewComments || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificar Falta</DialogTitle>
            <DialogDescription>Falta del {selectedAbsence?.date} - Sube tu documento de justificación</DialogDescription>
          </DialogHeader>
          <JustificationForm absence={selectedAbsence} onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function JustificationForm({ absence, onClose }) {
  const [formData, setFormData] = useState({ documentType: '', comments: '', file: null })

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.documentType || !formData.file) {
      await alertConfig.toastError({ title: 'Campos requeridos', text: 'Completa todos los campos y sube un documento' })
      return
    }
    await alertConfig.toastSuccess({ title: 'Justificación enviada', text: 'Tu justificación ha sido enviada para revisión' })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documentType">Tipo de Documento *</Label>
        <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical">Certificado Médico</SelectItem>
            <SelectItem value="personal">Permiso Personal</SelectItem>
            <SelectItem value="emergency">Emergencia Familiar</SelectItem>
            <SelectItem value="official">Trámite Oficial</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Documento *</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
          <input type="file" id="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
          <label htmlFor="file" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {formData.file ? (
              <p className="text-sm font-medium">{formData.file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium">Click para subir archivo</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (máx. 5MB)</p>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comentarios</Label>
        <Textarea id="comments" placeholder="Agrega detalles adicionales..." value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows={3} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!formData.documentType || !formData.file}>Enviar Justificación</Button>
      </div>
    </form>
  )
}

function AdminJustifications() {
  const [justifications, setJustifications] = useState(mockJustifications)
  const [selectedJustification, setSelectedJustification] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  

  const filteredJustifications = justifications.filter((j) => filterStatus === 'all' || j.status === filterStatus)

  const handleReview = (justification) => {
    setSelectedJustification(justification)
    setIsReviewDialogOpen(true)
  }

  const handleApprove = async (id, comments) => {
    const ok = await alertConfig.confirm({ title: '¿Aprobar justificación?', text: 'Esta acción marcará la falta como justificada.' })
    if (!ok) return
    setJustifications((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: 'Admin Sistema', reviewComments: comments } : j))
    )
    await alertConfig.toastSuccess({ title: 'Justificación aprobada', text: 'Marcada como justificada' })
    setIsReviewDialogOpen(false)
  }

  const handleReject = async (id, comments) => {
    const ok = await alertConfig.confirm({ title: '¿Rechazar justificación?', text: 'No se justificará la falta.' })
    if (!ok) return
    setJustifications((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: 'Admin Sistema', reviewComments: comments } : j))
    )
    await alertConfig.toastInfo({ title: 'Justificación rechazada', text: 'La falta permanece sin justificar' })
    setIsReviewDialogOpen(false)
  }

  const pendingCount = justifications.filter((j) => j.status === 'pending').length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Justificaciones</h1>
          <p className="text-muted-foreground">Revisa y aprueba las justificaciones del personal</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {pendingCount} Pendientes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{justifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{justifications.filter((j) => j.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{justifications.filter((j) => j.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{justifications.filter((j) => j.status === 'rejected').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Justificaciones</CardTitle>
              <CardDescription>Todas las solicitudes de justificación</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha Falta</TableHead>
                <TableHead>Tipo Documento</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJustifications.map((just) => (
                <TableRow key={just.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{just.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{just.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{just.date}</TableCell>
                  <TableCell>{just.documentType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{just.submittedAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        just.status === 'approved' ? 'default' : just.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {just.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {just.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {just.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {just.status === 'pending' ? 'Pendiente' : just.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant={just.status === 'pending' ? 'default' : 'outline'} onClick={() => handleReview(just)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {just.status === 'pending' ? 'Revisar' : 'Ver'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {selectedJustification && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Revisar Justificación</DialogTitle>
              <DialogDescription>
                {selectedJustification.employeeName} - Falta del {selectedJustification.date}
              </DialogDescription>
            </DialogHeader>
            <ReviewJustificationForm
              justification={selectedJustification}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => setIsReviewDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ReviewJustificationForm({ justification, onApprove, onReject, onClose }) {
  const [comments, setComments] = useState('')

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 rounded-lg border border-border bg-gradient-to-br from-primary/10 via-background to-background shadow-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Documento</p>
            <p className="font-medium">{justification.documentType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Envío</p>
            <p className="font-medium">{justification.submittedAt}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Comentarios del Empleado</p>
          <p className="font-medium">{justification.comments || 'Sin comentarios'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Documento Adjunto</p>
          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Ver Documento
          </Button>
        </div>
      </div>

      {justification.status === 'pending' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="adminComments">Comentarios de Revisión *</Label>
            <Textarea id="adminComments" placeholder="Agrega comentarios sobre tu decisión..." value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => onReject(justification.id, comments)} disabled={!comments.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button onClick={() => onApprove(justification.id, comments)} disabled={!comments.trim()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">Revisado por: {justification.reviewedBy}</p>
          <p className="text-sm text-muted-foreground">Fecha: {justification.reviewedAt}</p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{justification.reviewComments}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}

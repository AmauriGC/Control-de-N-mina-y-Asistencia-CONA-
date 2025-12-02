"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { alertConfig } from "@/lib/alert-config";
import { useBackendErrors, useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";
import { presets } from "@/components/criteria/criteria";
import { useAuth } from '@/auth/context/AuthContext'
import { attendanceService } from '@/employee/service/attendanceService'
import { justificationService } from '@/admin/pages/justification/service/justificationService'
import { employeeService } from '@/admin/pages/employees/service/employeeService'
import FieldError from '@/components/criteria/FieldError'
import FieldHint from '@/components/criteria/FieldHint'

export default function JustificationsEmployee() {
  const { user } = useAuth()
  const be = useBackendErrors()
  const reasonField = useFieldValidation('', presets.justifications.reason)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [absences, setAbsences] = useState([])
  const [myJustifications, setMyJustifications] = useState([])
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(null)
  const [file, setFile] = useState(null)

  const loadData = async () => {
    // Resolver employeeId (fallback si no viene en el token)
    let empId = user?.employeeId
    if (!empId && user?.id) {
      try {
        const res = await employeeService.getByUserId(user.id)
        if (res?.success && res.data?.id) empId = res.data.id
      } catch {}
    }
    if (!empId) return 
    setResolvedEmployeeId(empId)

    // rango: últimos 3 días para ventana de 2 días
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0]
    const [attRange, myJusts] = await Promise.all([
      attendanceService.getEmployeeAttendanceRange(empId, startDate, endDate),
      justificationService.listByEmployee(empId)
    ])
    if (attRange.success) {
      const today = new Date()
      const myJ = (myJusts.success ? (myJusts.data || []) : [])
      const hasActiveJust = (attendanceId) => {
        const j = myJ.find(j => j.attendanceId === attendanceId)
        if (!j) return false
        const st = typeof j.status === 'string' ? j.status.toLowerCase() : j.status
        return st !== 'rejected' // excluir pendientes y aprobados
      }
      const pending = (attRange.data || [])
        .filter(r => r.status === 'ABSENT')
        .filter(r => !hasActiveJust(r.id))
        .map(r => {
          const recDate = parseLocalDate(r.date)
          const diffDays = Math.floor((today - recDate) / (1000*60*60*24))
          return { id: r.id, date: r.date, diffDays }
        })
        .filter(x => x.diffDays >= 0 && x.diffDays <= 2)
        .map(x => ({ id: x.id, date: x.date, daysLeft: 2 - x.diffDays }))
      setAbsences(pending)
    }
    if (myJusts.success) setMyJustifications(myJusts.data || [])
  }

  useEffect(() => { loadData() }, [user])

  const handleJustify = (absence) => {
    setSelectedAbsence(absence);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
  }

  const validateFile = () => {
    if (!file) return true
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      alertConfig.error('Tipo de archivo no permitido. Solo PDF/JPG/PNG')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      alertConfig.error('El archivo excede el tamaño máximo (5MB)')
      return false
    }
    return true
  }

  const submitJustification = async () => {
    if (!reasonField.isValid) {
      reasonField.onBlur()
      alertConfig.error(reasonField.error)
      return
    }
    if (!validateFile()) return

    // TODO: obtener employeeId y attendanceId del contexto/listado
    alertConfig.error('Falta implementar envío: obtener employeeId y attendanceId en esta vista')
  }

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Justificaciones</h1>
        <p className="text-muted-foreground">Justifica tus ausencias subiendo documentos</p>
      </div>

      {absences.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Faltas Pendientes de Justificar</CardTitle>
                <CardDescription>Tienes {absences.length} falta(s) que requieren justificación</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {absences.map((absence) => (
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
                <Button
                  onClick={() => handleJustify(absence)}
                  variant={absence.daysLeft === 0 ? "destructive" : "default"}
                >
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
                {myJustifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      no se encontraron registros
                    </TableCell>
                  </TableRow>
                ) : myJustifications.map((just) => (
                  <TableRow key={just.id}>
                    <TableCell className="font-medium">{just.date}</TableCell>
                    <TableCell>{just.documentType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{just.createdAt ? new Date(just.createdAt).toLocaleString('es-MX') : '-'}</TableCell>
                    <TableCell>
                      {(() => {
                        const st = typeof just.status === 'string' ? just.status.toLowerCase() : just.status
                        return (
                          <Badge
                            variant={
                              st === "approved"
                                ? "default"
                                : st === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {st === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {st === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {st === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {st === "pending" ? "Pendiente" : st === "approved" ? "Aprobado" : "Rechazado"}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-sm">{just.reviewComments || "-"}</TableCell>
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
            <DialogDescription>
              Falta del {selectedAbsence?.date} - Sube tu documento de justificación
            </DialogDescription>
          </DialogHeader>
          <JustificationForm absence={selectedAbsence} employeeId={resolvedEmployeeId} onClose={() => setIsDialogOpen(false)} onSubmitted={loadData} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JustificationForm({ absence, employeeId, onClose, onSubmitted }) {
  const [formData, setFormData] = useState({ documentType: "", comments: "", file: null });
  const { user } = useAuth()
  const be = useBackendErrors()

  const commentField = useFieldValidation(formData.comments, [
    rulesLib.optional(rulesLib.minLength(5, "Mínimo 5 caracteres")),
    rulesLib.optional(rulesLib.maxLength(300, "Máximo 300 caracteres")),
    rulesLib.optional(rulesLib.textGeneral("Caracteres no permitidos")),
  ]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024;
      if (!allowed.includes(f.type)) {
        alertConfig.toastError({ title: "Formato no permitido", text: "Solo PDF, JPG o PNG" });
        return;
      }
      if (f.size > maxSize) {
        alertConfig.toastError({ title: "Archivo demasiado grande", text: "Máximo 5MB" });
        return;
      }
      setFormData({ ...formData, file: f });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentType || !formData.file) {
      await alertConfig.toastError({ title: "Campos requeridos", text: "Completa todos los campos y sube un documento" });
      return;
    }
    if (commentField.value.trim().length > 0 && !commentField.isValid) {
      await alertConfig.toastError({ title: "Comentarios inválidos", text: commentField.error });
      return;
    }
    const payload = {
      employeeId: employeeId || user?.employeeId,
      attendanceId: absence?.id,
      documentType: mapDocType(formData.documentType),
      reason: formData.comments || ''
    }
    const res = await justificationService.submit(payload, formData.file)
    if (res.success) {
      await alertConfig.toastSuccess({ title: "Justificación enviada", text: res.message })
      onClose()
      if (typeof onSubmitted === 'function') { try { await onSubmitted() } catch {} }
    } else {
      be.setFromList(res.errors || [])
      await alertConfig.toastError({ title: 'Error', text: res.message })
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documentType">Tipo de Documento *</Label>
        <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEDICAL_CERTIFICATE">Certificado Médico</SelectItem>
            <SelectItem value="INVOICE">Comprobante/Factura</SelectItem>
            <SelectItem value="OTHER">Otro</SelectItem>
          </SelectContent>
        </Select>
        <FieldError backendError={be.getFieldError('documentType')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Documento *</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
          <input type="file" id="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
          <label htmlFor="file" className="cursor-pointer">
            {formData.file ? (
              <p className="text-sm font-medium">{formData.file.name}</p>
            ) : (
              <p className="text-sm font-medium">Selecciona archivo (PDF, JPG, PNG)</p>
            )}
          </label>
        </div>
        <FieldError backendError={be.getFieldError('file')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comentarios (opcional)</Label>
        <Textarea id="comments" placeholder="Agrega detalles adicionales..." value={commentField.value} onChange={(e) => { commentField.onChange(e); setFormData({ ...formData, comments: e.target.value }); }} onBlur={commentField.onBlur} rows={3} />
        <FieldError error={commentField.error} backendError={be.getFieldError('reason')} />
        <FieldHint value={commentField.value} max={300} />
      </div>

      {be.getGeneralError() && <div className="text-sm text-destructive">{be.getGeneralError()}</div>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={!formData.documentType || !formData.file || (commentField.value.trim().length > 0 && !commentField.isValid)}>
          Enviar Justificación
        </Button>
      </div>
    </form>
  );
}

function mapDocType(v) {
  if (!v) return 'OTHER'
  return v
}

function parseLocalDate(isoDate) {
  // Expect YYYY-MM-DD; construct local date to avoid timezone shifts
  try {
    const [y, m, d] = String(isoDate).split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  } catch {
    return new Date(isoDate)
  }
}

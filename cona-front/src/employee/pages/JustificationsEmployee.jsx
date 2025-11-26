"use client";

import { useState, useEffect } from "react";
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
import { useFieldValidation } from "@/components/criteria/use-validation";
import { rulesLib } from "@/components/criteria/criteria";
import { justificationService } from "../../admin/pages/justification/service/justificationService";
import { useToast } from "@/lib/use-toast";

export default function JustificationsEmployee() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock data para faltas pendientes (esto debería venir de API de asistencias)
  const mockAbsences = [
    { id: "1", date: "2024-01-15", status: "absent", daysLeft: 1 },
    { id: "2", date: "2024-01-12", status: "absent", daysLeft: 0 },
  ];

  // Cargar justificaciones del empleado actual
  const loadMyJustifications = async () => {
    try {
      setLoading(true);
      const response = await justificationService.getMyJustifications();
      setJustifications(response.content || []);
    } catch (error) {
      console.error('Error cargando justificaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las justificaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyJustifications();
  }, []);

  const handleJustify = (absence) => {
    setSelectedAbsence(absence);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6 min-h-screen">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando justificaciones...
                    </TableCell>
                  </TableRow>
                ) : justifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No has enviado justificaciones aún
                    </TableCell>
                  </TableRow>
                ) : (
                  justifications.map((just) => (
                    <TableRow key={just.id}>
                      <TableCell className="font-medium">{just.date}</TableCell>
                      <TableCell>{just.documentType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {just.createdAt ? new Date(just.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            just.status === "APPROVED"
                              ? "default"
                              : just.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {just.status === "PENDING" && <Clock className="h-3 w-3 mr-1" />}
                          {just.status === "APPROVED" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {just.status === "REJECTED" && <XCircle className="h-3 w-3 mr-1" />}
                          {just.status === "PENDING"
                            ? "Pendiente"
                            : just.status === "APPROVED"
                            ? "Aprobado"
                            : "Rechazado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{just.adminComments || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
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
          <JustificationForm 
            absence={selectedAbsence} 
            onClose={() => setIsDialogOpen(false)}
            onSuccess={loadMyJustifications}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JustificationForm({ absence, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ documentType: "", reason: "", file: null });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const reasonField = useFieldValidation(formData.reason, [
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
      await alertConfig.toastError({
        title: "Campos requeridos",
        text: "Completa todos los campos y sube un documento",
      });
      return;
    }
    if (reasonField.value.trim().length > 0 && !reasonField.isValid) {
      await alertConfig.toastError({ title: "Razón inválida", text: reasonField.error });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const justificationData = {
        date: absence.date,
        reason: formData.reason || null,
        documentType: formData.documentType,
        documentFile: formData.file
      };
      
      await justificationService.create(justificationData);
      
      await alertConfig.toastSuccess({
        title: "Justificación enviada",
        text: "Tu justificación ha sido enviada para revisión",
      });
      onSuccess(); // Reload justifications
      onClose();
    } catch (error) {
      console.error('Error enviando justificación:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la justificación. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documentType">Tipo de Documento *</Label>
        <Select
          value={formData.documentType}
          onValueChange={(value) => setFormData({ ...formData, documentType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEDICAL_CERTIFICATE">Certificado Médico</SelectItem>
            <SelectItem value="PERSONAL_PERMIT">Permiso Personal</SelectItem>
            <SelectItem value="FAMILY_EMERGENCY">Emergencia Familiar</SelectItem>
            <SelectItem value="OFFICIAL_PROCEDURE">Trámite Oficial</SelectItem>
            <SelectItem value="OTHER">Otro</SelectItem>
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
        <Label htmlFor="reason">Razón de la Justificación (opcional)</Label>
        <Textarea
          id="reason"
          placeholder="Explica brevemente la razón de tu ausencia..."
          value={reasonField.value}
          onChange={(e) => {
            reasonField.onChange(e);
            setFormData({ ...formData, reason: e.target.value });
          }}
          onBlur={reasonField.onBlur}
          rows={3}
        />
        {reasonField.showError && <p className="text-xs text-destructive">{reasonField.error}</p>}
        {reasonField.value.trim().length > 0 && !reasonField.showError && (
          <p className="text-xs text-muted-foreground">{reasonField.value.trim().length}/300</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            submitting || !formData.documentType || !formData.file || (reasonField.value.trim().length > 0 && !reasonField.isValid)
          }
        >
          {submitting ? "Enviando..." : "Enviar Justificación"}
        </Button>
      </div>
    </form>
  );
}

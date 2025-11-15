"use client";

import { useState } from "react";
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

const mockAbsences = [
  { id: "1", date: "2024-01-15", status: "absent", daysLeft: 1 },
  { id: "2", date: "2024-01-12", status: "absent", daysLeft: 0 },
];

const mockJustifications = [
  {
    id: "1",
    employeeId: "E002",
    employeeName: "María Empleada",
    date: "2024-01-16",
    documentType: "Certificado Médico",
    comments: "Cita médica programada",
    status: "pending",
    submittedAt: "2024-01-17 10:30",
  },
];

export default function JustificationsEmployee() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  const myJustifications = mockJustifications;

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
                {myJustifications.map((just) => (
                  <TableRow key={just.id}>
                    <TableCell className="font-medium">{just.date}</TableCell>
                    <TableCell>{just.documentType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{just.submittedAt}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          just.status === "approved"
                            ? "default"
                            : just.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {just.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {just.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {just.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                        {just.status === "pending"
                          ? "Pendiente"
                          : just.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                      </Badge>
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
          <JustificationForm absence={selectedAbsence} onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JustificationForm({ absence, onClose }) {
  const [formData, setFormData] = useState({ documentType: "", comments: "", file: null });

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
      await alertConfig.toastError({
        title: "Campos requeridos",
        text: "Completa todos los campos y sube un documento",
      });
      return;
    }
    if (commentField.value.trim().length > 0 && !commentField.isValid) {
      await alertConfig.toastError({ title: "Comentarios inválidos", text: commentField.error });
      return;
    }
    await alertConfig.toastSuccess({
      title: "Justificación enviada",
      text: "Tu justificación ha sido enviada para revisión",
    });
    onClose();
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
        <Label htmlFor="comments">Comentarios (opcional)</Label>
        <Textarea
          id="comments"
          placeholder="Agrega detalles adicionales..."
          value={commentField.value}
          onChange={(e) => {
            commentField.onChange(e);
            setFormData({ ...formData, comments: e.target.value });
          }}
          onBlur={commentField.onBlur}
          rows={3}
        />
        {commentField.showError && <p className="text-xs text-destructive">{commentField.error}</p>}
        {commentField.value.trim().length > 0 && !commentField.showError && (
          <p className="text-xs text-muted-foreground">{commentField.value.trim().length}/300</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            !formData.documentType || !formData.file || (commentField.value.trim().length > 0 && !commentField.isValid)
          }
        >
          Enviar Justificación
        </Button>
      </div>
    </form>
  );
}

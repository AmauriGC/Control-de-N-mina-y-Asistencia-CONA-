"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, XCircle, FileText, Eye, RefreshCw } from "lucide-react";
import { alertConfig } from "@/lib/alert-config";
import { useFieldValidation } from "@/components/criteria/use-validation";
import { justificationReviewRules } from "@/components/criteria/criteria";
import { justificationService } from "./service/justificationService";
import { useToast } from "@/lib/use-toast";

export default function JustificationsAdmin() {
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Cargar justificaciones del servidor
  const loadJustifications = async () => {
    try {
      setLoading(true);
      const response = await justificationService.list();
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
    loadJustifications();
  }, []);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const pendingCount = justifications.filter((j) => j.status === "PENDING").length;

  const handleReview = (j) => {
    setSelected(j);
    setOpen(true);
  };

  const handleApprove = async (id, comments) => {
    const ok = await alertConfig.confirm({
      title: "¿Aprobar justificación?",
      text: "Esta acción marcará la falta como justificada.",
    });
    if (!ok) return;
    
    try {
      setProcessing(true);
      await justificationService.processJustification(id, {
        approved: true,
        comments
      });
      await alertConfig.toastSuccess({ title: "Justificación aprobada", text: "Marcada como justificada" });
      setOpen(false);
      loadJustifications(); // Recargar lista
    } catch (error) {
      console.error('Error aprobando:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la justificación",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id, comments) => {
    const ok = await alertConfig.confirm({
      title: "¿Rechazar justificación?",
      text: "La falta se mantendrá sin justificar.",
    });
    if (!ok) return;
    
    try {
      setProcessing(true);
      await justificationService.processJustification(id, {
        approved: false,
        comments
      });
      await alertConfig.toastInfo({ title: "Justificación rechazada", text: "La falta permanece sin justificar" });
      setOpen(false);
      loadJustifications(); // Recargar lista
    } catch (error) {
      console.error('Error rechazando:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la justificación",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-screen">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Justificaciones</CardTitle>
              <CardDescription>Todas las solicitudes de justificación</CardDescription>
            </div>
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
                {justifications.map((just) => (
                  <TableRow key={just.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{just.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{just.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{just.date}</TableCell>
                    <TableCell>{just.documentType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{just.createdAt ? new Date(just.createdAt).toLocaleDateString() : ''}</TableCell>
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
                    <TableCell>
                      <Button
                        size="sm"
                        variant={just.status === "PENDING" ? "default" : "outline"}
                        onClick={() => handleReview(just)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {just.status === "PENDING" ? "Revisar" : "Ver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Revisar Justificación</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selected.employeeName} - Falta del {selected.date}
              </p>
            </DialogHeader>
            <ReviewForm
              justification={selected}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReviewForm({ justification, onApprove, onReject, onClose }) {
  const [comments, setComments] = useState("");
  const commentsField = useFieldValidation(comments, justificationReviewRules);
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
            <p className="font-medium">{justification.createdAt ? new Date(justification.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Razón de la Justificación</p>
          <p className="font-medium">{justification.reason || "Sin razón especificada"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Documento Adjunto</p>
          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Ver Documento
          </Button>
        </div>
      </div>

      {justification.status === "PENDING" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="adminComments">Comentarios de Revisión *</Label>
            <Textarea
              id="adminComments"
              placeholder="Agrega comentarios sobre tu decisión..."
              value={commentsField.value}
              onChange={(e) => {
                setComments(e.target.value);
                commentsField.onChange(e);
              }}
              onBlur={commentsField.onBlur}
              aria-invalid={commentsField.showError && !!commentsField.error}
              rows={3}
            />
            {commentsField.showError && commentsField.error && (
              <p className="text-xs text-destructive">{commentsField.error}</p>
            )}
            {!commentsField.showError && commentsField.value.trim().length > 0 && (
              <p className="text-xs text-muted-foreground">{commentsField.value.trim().length}/300</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(justification.id, commentsField.value)}
              disabled={!commentsField.isValid}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button onClick={() => onApprove(justification.id, commentsField.value)} disabled={!commentsField.isValid}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">Revisado</p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{justification.adminComments || "Sin comentarios del administrador"}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}

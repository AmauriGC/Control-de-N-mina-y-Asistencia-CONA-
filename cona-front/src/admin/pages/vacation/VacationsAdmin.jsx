"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { alertConfig } from "@/lib/alert-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useFieldValidation } from "@/components/criteria/use-validation";
import { rulesLib } from "@/components/criteria/criteria";

const mockVacationRequests = [
  {
    id: "1",
    employeeId: "E002",
    employeeName: "María Empleada",
    startDate: "2024-02-15",
    endDate: "2024-02-19",
    totalDays: 5,
    vacationPay: 12600,
    payrollDeduction: 200,
    status: "pending",
    requestedAt: "2024-01-18 10:30",
  },
  {
    id: "2",
    employeeId: "E003",
    employeeName: "Juan Pérez",
    startDate: "2024-03-01",
    endDate: "2024-03-08",
    totalDays: 6,
    vacationPay: 16500,
    payrollDeduction: 200,
    status: "approved",
    requestedAt: "2024-01-15 14:20",
  },
];

export default function VacationsAdmin() {
  const [vacationRequests, setVacationRequests] = useState(mockVacationRequests);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openReview, setOpenReview] = useState(false);

  const filteredRequests = vacationRequests.filter((v) => filterStatus === "all" || v.status === filterStatus);
  const handleApprove = async (id, comments) => {
    const ok = await alertConfig.confirm({
      title: "¿Aprobar solicitud?",
      text: "Se descontarán los días correspondientes.",
    });
    if (!ok) return;
    setVacationRequests((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "approved", reviewComments: comments } : v))
    );
    await alertConfig.toastSuccess({ title: "Vacaciones aprobadas", text: "La solicitud ha sido aprobada" });
    setOpenReview(false);
    setSelectedRequest(null);
  };
  const handleReject = async (id, comments) => {
    const ok = await alertConfig.confirm({ title: "¿Rechazar solicitud?", text: "El empleado será notificado." });
    if (!ok) return;
    setVacationRequests((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "rejected", reviewComments: comments } : v))
    );
    await alertConfig.toastInfo({ title: "Solicitud rechazada", text: "Se notificó al empleado" });
    setOpenReview(false);
    setSelectedRequest(null);
  };
  const pendingCount = vacationRequests.filter((v) => v.status === "pending").length;

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Vacaciones</h1>
          <p className="text-muted-foreground">Revisa y aprueba las solicitudes del personal</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {pendingCount} Pendientes
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Solicitudes" value={vacationRequests.length} />
        <StatCard
          title="Pendientes"
          value={
            <span className="text-destructive">{vacationRequests.filter((v) => v.status === "pending").length}</span>
          }
        />
        <StatCard
          title="Aprobadas"
          value={<span className="text-primary">{vacationRequests.filter((v) => v.status === "approved").length}</span>}
        />
        <StatCard title="Total Días Solicitados" value={vacationRequests.reduce((sum, v) => sum + v.totalDays, 0)} />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes de Vacaciones</CardTitle>
              <CardDescription>Todas las solicitudes del personal</CardDescription>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Pago Vacacional</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vacation.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{vacation.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vacation.startDate}</TableCell>
                    <TableCell>{vacation.endDate}</TableCell>
                    <TableCell>{vacation.totalDays} días</TableCell>
                    <TableCell className="text-primary font-semibold">
                      ${vacation.vacationPay.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-destructive">${vacation.payrollDeduction}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vacation.status === "approved"
                            ? "default"
                            : vacation.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {vacation.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {vacation.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {vacation.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                        {vacation.status === "pending"
                          ? "Pendiente"
                          : vacation.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vacation.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest({ action: "approve", ...vacation });
                              setOpenReview(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest({ action: "reject", ...vacation });
                              setOpenReview(true);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">{vacation.reviewComments || "-"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedRequest && (
        <Dialog open={openReview} onOpenChange={setOpenReview}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.action === "approve" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedRequest.employeeName} - {selectedRequest.startDate} a {selectedRequest.endDate}
              </p>
            </DialogHeader>
            <VacationReviewForm
              request={selectedRequest}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => {
                setOpenReview(false);
                setSelectedRequest(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function VacationReviewForm({ request, onApprove, onReject, onClose }) {
  const [comments, setComments] = useState("");
  const commentsField = useFieldValidation(comments, [
    request.action === "reject"
      ? rulesLib.required("Comentario requerido para rechazo")
      : rulesLib.optional(rulesLib.minLength(0)),
    rulesLib.optional(rulesLib.minLength(5, "Mínimo 5 caracteres")),
    rulesLib.optional(rulesLib.maxLength(300, "Máximo 300 caracteres")),
    rulesLib.optional(rulesLib.textGeneral("Caracteres no permitidos")),
  ]);

  const canSubmit = request.action === "reject" ? commentsField.isValid : commentsField.isValid;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Resumen</p>
        <div className="text-xs text-muted-foreground">
          <p>Días: {request.totalDays}</p>
          <p>Pago Vacacional: ${request.vacationPay.toLocaleString()}</p>
          <p>Descuento Nómina: ${request.payrollDeduction}</p>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="vacationComments" className="text-sm font-medium">
          Comentarios {request.action === "reject" ? "*" : "(opcional)"}
        </label>
        <Textarea
          id="vacationComments"
          placeholder={
            request.action === "approve"
              ? "Opcional: agrega una nota para el empleado"
              : "Explica el motivo del rechazo"
          }
          value={commentsField.value}
          onChange={(e) => {
            setComments(e.target.value);
            commentsField.onChange(e);
          }}
          onBlur={commentsField.onBlur}
          rows={3}
          aria-invalid={commentsField.showError && !!commentsField.error}
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
        {request.action === "reject" ? (
          <Button variant="destructive" onClick={() => onReject(request.id, commentsField.value)} disabled={!canSubmit}>
            <XCircle className="h-4 w-4 mr-2" /> Rechazar
          </Button>
        ) : (
          <Button onClick={() => onApprove(request.id, commentsField.value)} disabled={!canSubmit}>
            <CheckCircle className="h-4 w-4 mr-2" /> Aprobar
          </Button>
        )}
      </div>
    </div>
  );
}

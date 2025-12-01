"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {CheckCircle, Clock, Eye, XCircle} from "lucide-react";
import {alertConfig} from "@/lib/alert-config";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {makeRules, rulesLib, useBackendErrors, useFieldValidation} from '@/components/criteria/use-validation'
import {vacationService} from "./service/vacationService.js";
import FieldError from '@/components/criteria/FieldError'

export default function VacationsAdmin() {
    const [vacationRequests, setVacationRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openReview, setOpenReview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [employeeNameFilter, setEmployeeNameFilter] = useState("");
    const [pagination, setPagination] = useState({page: 0, size: 10, totalElements: 0});
    const be = useBackendErrors()
    const [formData, setFormData] = useState({startDate: '', endDate: '', type: 'VACATION', reason: ''})
    const startField = useFieldValidation(formData.startDate, makeRules(rulesLib.isValidDate('Fecha inválida')))
    const endField = useFieldValidation(formData.endDate, makeRules(rulesLib.isValidDate('Fecha inválida'), rulesLib.dateAfter(formData.startDate, 'Debe ser posterior a inicio')))
    const reasonField = useFieldValidation(formData.reason, makeRules(
        rulesLib.required('El motivo es obligatorio'),
        rulesLib.textGeneral('Caracteres no permitidos'),
        rulesLib.maxLength(500, 'Máximo 500 caracteres')
    ))

    useEffect(() => {
        loadRequests();
    }, [pagination.page, filterStatus, employeeNameFilter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await vacationService.getAllRequests(
                pagination.page,
                pagination.size,
                filterStatus,
                employeeNameFilter || null
            );
            setVacationRequests(response.data.content);
            setPagination(prev => ({
                ...prev,
                totalElements: response.data.totalElements
            }));
        } catch (error) {
            console.error('Error loading requests:', error);
            await alertConfig.toastError({
                title: 'Error',
                text: error.message || 'No se pudieron cargar las solicitudes'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = vacationRequests;
    const handleApprove = async (id, comments) => {
        const ok = await alertConfig.confirm({
            title: "¿Aprobar solicitud?",
            text: "Se descontarán los días correspondientes.",
        });
        if (!ok) return;

        try {
            const res = await vacationService.reviewRequest(id, true, comments);
            if (res.success) {
                await alertConfig.toastSuccess({
                    title: "Solicitud aprobada",
                    text: res.message
                });
                be.reset();
                await loadRequests();
                setOpenReview(false);
                setSelectedRequest(null);
            } else {
                be.setFromList(res.errors || res.data || [])
                await alertConfig.toastError({title: 'Error', text: res.message})
            }
        } catch (error) {
            await alertConfig.toastError({title: 'Error', text: error.message})
        }
    };
    const handleReject = async (id, comments) => {
        const ok = await alertConfig.confirm({
            title: "¿Rechazar solicitud?",
            text: "El empleado será notificado.",
        });
        if (!ok) return;

        try {
            const res = await vacationService.reviewRequest(id, false, comments);
            if (res.success) {
                await alertConfig.toastInfo({
                    title: "Solicitud rechazada",
                    text: res.message
                });
                be.reset();
                await loadRequests();
                setOpenReview(false);
                setSelectedRequest(null);
            } else {
                be.setFromList(res.errors || res.data || [])
                await alertConfig.toastError({title: 'Error', text: res.message})
            }
        } catch (error) {
            await alertConfig.toastError({title: 'Error', text: error.message})
        }
    };
    const createRequest = async () => {
        if (!startField.isValid || !endField.isValid) {
            startField.onBlur();
            endField.onBlur();
            alertConfig.toastError({title: 'Fechas inválidas', text: startField.error || endField.error})
            return
        }
        const payload = {
            startDate: startField.value,
            endDate: endField.value,
            type: formData.type,
            reason: reasonField.value || ''
        }
        const res = await vacationService.create(payload)
        if (res.success) {
            alertConfig.toastSuccess({title: 'Permiso', text: res.message})
            be.reset()
            setFormData({startDate: '', endDate: '', type: 'VACATION', reason: ''})
            await loadRequests()
        } else {
            be.setFromList(res.errors || res.data || [])
            alertConfig.toastError({title: 'Error', text: res.message})
        }
    }
    const pendingCount = vacationRequests.filter((v) => v.status === "PENDING").length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">Gestión de Permisos</h1>
                    <p className="text-muted-foreground">Revisa y aprueba las solicitudes de permisos y vacaciones</p>
                </div>
                {pendingCount > 0 && (
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                        {pendingCount} Pendientes
                    </Badge>
                )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Solicitudes" value={vacationRequests.length}/>
                <StatCard
                    title="Pendientes"
                    value={
                        <span
                            className="text-destructive">{vacationRequests.filter((v) => v.status === "PENDING").length}</span>
                    }
                />
                <StatCard
                    title="Aprobadas"
                    value={<span
                        className="text-primary">{vacationRequests.filter((v) => v.status === "APPROVED").length}</span>}
                />
                <StatCard title="Total Días Solicitados"
                          value={vacationRequests.reduce((sum, v) => sum + v.totalDays, 0)}/>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Solicitudes de Permisos</CardTitle>
                            <CardDescription>Todas las solicitudes de permisos y vacaciones del
                                personal</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Buscar empleado..."
                                value={employeeNameFilter}
                                onChange={(e) => {
                                    setEmployeeNameFilter(e.target.value);
                                    setPagination(prev => ({...prev, page: 0}));
                                }}
                                className="px-3 py-2 border rounded-md text-sm flex-1 sm:flex-none sm:w-48"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPagination(prev => ({...prev, page: 0}));
                                }}
                                className="px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="all">Todas</option>
                                <option value="PENDING">Pendientes</option>
                                <option value="APPROVED">Aprobadas</option>
                                <option value="REJECTED">Rechazadas</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead className="hidden sm:table-cell">Fechas</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="hidden md:table-cell">Días</TableHead>
                                    <TableHead className="hidden lg:table-cell">Pago Vacacional</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="hidden xl:table-cell">Descripción</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                            Cargando solicitudes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                            No se encontraron solicitudes
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((vacation) => (
                                        <TableRow key={vacation.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{vacation.employeeName}</p>
                                                    <p className="text-xs text-muted-foreground">{vacation.employeeKey}</p>
                                                    <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                                        {vacation.startDate} - {vacation.endDate} • {vacation.totalDays}d
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="text-sm">
                                                    <div className="font-medium">{vacation.startDate}</div>
                                                    <div className="text-muted-foreground">{vacation.endDate}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {vacation.type === 'VACATION' ? 'Vacación' : vacation.type === 'SICK_LEAVE' ? 'Incapacidad' : 'Personal'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="font-semibold">{vacation.totalDays}</span>
                                                <span className="text-muted-foreground text-sm ml-1">días</span>
                                            </TableCell>
                                            <TableCell
                                                className="hidden lg:table-cell text-primary font-semibold text-sm">
                                                {vacation.vacationPay ? `$${vacation.vacationPay.toLocaleString()}` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        vacation.status === "APPROVED"
                                                            ? "default"
                                                            : vacation.status === "REJECTED"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {vacation.status === "PENDING" && <Clock className="h-3 w-3 mr-1"/>}
                                                    {vacation.status === "APPROVED" &&
                                                        <CheckCircle className="h-3 w-3 mr-1"/>}
                                                    {vacation.status === "REJECTED" &&
                                                        <XCircle className="h-3 w-3 mr-1"/>}
                                                    {vacation.status === "PENDING"
                                                        ? "Pendiente"
                                                        : vacation.status === "APPROVED"
                                                            ? "Aprobado"
                                                            : "Rechazado"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                <div className="max-w-32">
                                                    {vacation.reason ? (
                                                        <p className="text-sm text-muted-foreground truncate"
                                                           title={vacation.reason}>
                                                            {vacation.reason}
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {vacation.status === "PENDING" ? (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setSelectedRequest({action: "approve", ...vacation});
                                                                setOpenReview(true);
                                                            }}
                                                            title="Aprobar"
                                                        >
                                                            <CheckCircle className="h-4 w-4"/>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setSelectedRequest({action: "reject", ...vacation});
                                                                setOpenReview(true);
                                                            }}
                                                            title="Rechazar"
                                                        >
                                                            <XCircle className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setSelectedRequest({action: "view", ...vacation});
                                                            setOpenReview(true);
                                                        }}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {selectedRequest && (
                <Dialog open={openReview} onOpenChange={setOpenReview}>
                    <DialogContent className="max-w-xl mx-4 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedRequest.action === "approve"
                                    ? "Aprobar Solicitud"
                                    : selectedRequest.action === "reject"
                                        ? "Rechazar Solicitud"
                                        : "Detalles de la Solicitud"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{selectedRequest.employeeName}</Badge>
                              <span>•</span>
                              <span className="text-xs">ID #{selectedRequest.id}</span>
                            </span>
                            </p>
                        </DialogHeader>
                        <VacationReviewForm
                            request={selectedRequest}
                            backendErrors={be}
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

function StatCard({title, value}) {
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

function VacationReviewForm({request, onApprove, onReject, onClose, backendErrors}) {
    const [comments, setComments] = useState("");
    const commentsField = useFieldValidation(comments, [
        request.action === "reject"
            ? rulesLib.required("Comentario requerido para rechazo")
            : rulesLib.optional(rulesLib.minLength(0)),
        rulesLib.optional(rulesLib.minLength(5, "Mínimo 5 caracteres")),
        rulesLib.optional(rulesLib.maxLength(300, "Máximo 300 caracteres")),
        rulesLib.optional(rulesLib.textGeneral("Caracteres no permitidos")),
    ]);

    const hasText = commentsField.value && commentsField.value.trim().length > 0
    const canSubmit = commentsField.isValid && hasText

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border bg-muted/10">
                    <p className="text-xs text-muted-foreground">Rango de fechas</p>
                    <div className="mt-1 text-sm font-medium">{request.startDate} → {request.endDate}</div>
                </div>
                <div className="p-3 rounded-md border bg-muted/10">
                    <p className="text-xs text-muted-foreground">Días solicitados</p>
                    <div className="mt-1 text-sm font-semibold">{request.totalDays} días</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border bg-muted/10">
                    <p className="text-xs text-muted-foreground">Tipo de solicitud</p>
                    <div className="mt-1">
                        <Badge variant="outline" className="w-fit text-xs">
                            {request.type === 'VACATION' ? 'Vacaciones' : request.type === 'SICK_LEAVE' ? 'Incapacidad Médica' : 'Permiso Personal'}
                        </Badge>
                    </div>
                </div>
                <div className="p-3 rounded-md border bg-muted/10">
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <div className="mt-1">
                        <Badge
                            variant={request.status === 'APPROVED' ? 'default' : request.status === 'REJECTED' ? 'destructive' : 'secondary'}
                            className="w-fit text-xs">
                            {request.status === 'PENDING' ? 'Pendiente' : request.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-md border bg-muted/10">
                <p className="text-xs text-muted-foreground">Motivo de la solicitud</p>
                <div className="mt-1 text-sm">
                    {request.reason ? (
                        <p className="text-muted-foreground">{request.reason}</p>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Sin motivo especificado</span>
                    )}
                </div>
            </div>

            {request.vacationPay && (
                <div className="p-3 rounded-md border bg-green-50">
                    <p className="text-xs text-muted-foreground">Pago vacacional</p>
                    <div className="mt-1 text-sm font-semibold text-primary">
                        ${request.vacationPay.toLocaleString()}
                    </div>
                </div>
            )}

            {request.action === "view" ? (
                <div className="p-3 rounded-md border bg-muted/10">
                    <p className="text-xs text-muted-foreground">Comentarios del administrador</p>
                    <div className="mt-1 text-sm min-h-[60px]">
                        {request.reviewComments || 'Sin comentarios del administrador'}
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <label htmlFor="vacationComments" className="text-sm font-medium">
                        Comentarios {request.action === "reject" ? "*" : "(opcional)"}
                    </label>
                    <Textarea
                        id="vacationComments"
                        placeholder={request.action === "approve" ? "Opcional: agrega una nota para el empleado" : "Explica el motivo del rechazo"}
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
                    {/* Error del backend por campo */}
                    <FieldError backendError={backendErrors?.getFieldError?.('reviewComments')}/>
                    {!commentsField.showError && commentsField.value.trim().length > 0 && (
                        <p className="text-xs text-muted-foreground">{commentsField.value.trim().length}/300</p>
                    )}
                </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>
                    {request.action === "view" ? "Cerrar" : "Cancelar"}
                </Button>
                {request.action === "view" ? null : request.action === "reject" ? (
                    <Button variant="destructive" onClick={() => onReject(request.id, commentsField.value)}
                            disabled={!canSubmit}>
                        <XCircle className="h-4 w-4 mr-2"/> Rechazar
                    </Button>
                ) : (
                    <Button onClick={() => onApprove(request.id, commentsField.value)} disabled={!canSubmit}>
                        <CheckCircle className="h-4 w-4 mr-2"/> Aprobar
                    </Button>
                )}
            </div>
        </div>
    );
}

"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {TimePicker} from "@/components/ui/time-picker";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Calendar as CalendarIcon, Clock, DollarSign, Plus, Save, SquarePen, Trash2} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {alertConfig} from "@/lib/alert-config";
import {makeRules, rulesLib, useBackendErrors, useFieldValidation} from "@/components/criteria/use-validation";
import {systemConfigService} from "./service/configService";
import { formatISODateLocal } from '@/lib/utils'
import FieldError from '@/components/criteria/FieldError'

const initialConfig = {
    // Solo campos que maneja PayrollConfig en el backend
    isrFixed: 0,
    imssFixed: 0,
    bonoPuntualidad: 0,
    descuentoRetardo: 0,
};

export default function ConfigPage() {
    const [config, setConfig] = useState(initialConfig);
    const [holidays, setHolidays] = useState([]);
    const [workSchedules, setWorkSchedules] = useState([]);
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
    const [isWorkScheduleDialogOpen, setIsWorkScheduleDialogOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [editingWorkSchedule, setEditingWorkSchedule] = useState(null);
    const be = useBackendErrors()
    const beWorkSchedule = useBackendErrors()
    const beHoliday = useBackendErrors()

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await systemConfigService.payrollConfig.get();
                if (response.success) {
                    setConfig((prev) => ({
                        ...prev,
                        isrFixed: response.data.isrFixed,
                        imssFixed: response.data.imssFixed,
                        descuentoRetardo: response.data.latePenalty,
                        bonoPuntualidad: response.data.bonusAmount || 0,
                    }));
                } else {
                    alertConfig.toastError({title: 'Error', text: response.message})
                }
            } catch (error) {
                alertConfig.toastError({title: 'Error', text: error.message})
            }
        };

        const loadHolidays = async () => {
            try {
                const response = await systemConfigService.holidays.getAll();
                if (response.success) {
                    setHolidays(response.data);
                }
            } catch (error) {
                console.error("Error loading holidays:", error);
                alertConfig.toastError({title: "Error", text: "No se pudieron cargar los días festivos"});
            }
        };

        const loadWorkSchedules = async () => {
            try {
                const response = await systemConfigService.workSchedules.getAll();
                if (response.success) {
                    setWorkSchedules(response.data);
                }
            } catch (error) {
                console.error("Error loading work schedules:", error);
                alertConfig.toastError({title: "Error", text: "No se pudieron cargar los horarios de trabajo"});
            }
        };

        loadConfig();
        loadHolidays();
        loadWorkSchedules();
    }, []);

    const handleConfigChange = (field, value) => {
        setConfig((prev) => ({...prev, [field]: value}));
        setHasChanges(true);
    };
    // Solo validaciones para campos de PayrollConfig
    const bonoPuntualidadField = useFieldValidation(String(config.bonoPuntualidad), makeRules(
        rulesLib.required("Requerido"),
        rulesLib.positiveNumber("Debe ser positivo")
    ));
    const descuentoRetardoField = useFieldValidation(String(config.descuentoRetardo), makeRules(
        rulesLib.required("Requerido"),
        rulesLib.positiveNumber("Debe ser positivo")
    ));
    const isrField = useFieldValidation(String(config.isrFixed), makeRules(
        rulesLib.required("Requerido"),
        rulesLib.positiveNumber("Debe ser positivo")
    ));
    const imssField = useFieldValidation(String(config.imssFixed), makeRules(
        rulesLib.required("Requerido"),
        rulesLib.positiveNumber("Debe ser positivo")
    ));

    // Sync field values when backend config loads
    useEffect(() => {
        try {
            isrField.setValue(String(config.isrFixed ?? 0));
            imssField.setValue(String(config.imssFixed ?? 0));
            bonoPuntualidadField.setValue(String(config.bonoPuntualidad ?? 0));
            descuentoRetardoField.setValue(String(config.descuentoRetardo ?? 0));
        } catch {}
    }, [config.isrFixed, config.imssFixed, config.bonoPuntualidad, config.descuentoRetardo]);

    const numericInvalid = [
        bonoPuntualidadField,
        descuentoRetardoField,
        isrField,
        imssField,
    ].some((f) => !f.isValid);

    const firstNumericError = [bonoPuntualidadField, descuentoRetardoField, isrField, imssField].find(f => !f.isValid)?.error || null

    const handleSaveConfig = async () => {
        if (numericInvalid) {
            // Mostrar el primer error local
            const firstError = [bonoPuntualidadField, descuentoRetardoField, isrField, imssField].find(f => !f.isValid)?.error
            alertConfig.toastError({title: 'Errores de validación', text: firstError || 'Corrige los campos marcados'})
            return;
        }
        try {
            const payrollData = {
                isrFixed: config.isrFixed,
                imssFixed: config.imssFixed,
                latePenalty: config.descuentoRetardo,
                bonusAmount: config.bonoPuntualidad,
            };
            const res = await systemConfigService.payrollConfig.update(payrollData);
            if (res.success) {
                alertConfig.toastSuccess({title: 'Configuración guardada', text: res.message})
                setHasChanges(false);
            } else {
                be.setFromList(res.errors || [])
                alertConfig.toastError({title: 'Error', text: res.message})
            }
        } catch (error) {
            alertConfig.toastError({title: 'Error', text: error.message})
        }
    };
    const handleDeleteHoliday = async (id) => {
        try {
            await systemConfigService.holidays.delete(id);
            setHolidays((prev) => prev.filter((h) => h.id !== id));
            alertConfig.toastInfo({title: "Día festivo eliminado", text: "El día festivo ha sido removido"});
        } catch (error) {
            console.error("Error deleting holiday:", error);
            alertConfig.toastError({title: "Error", text: "No se pudo eliminar el día festivo"});
        }
    };

    const handleEditHoliday = (holiday) => {
        setEditingHoliday(holiday);
        setIsHolidayDialogOpen(true);
    };

    const handleEditWorkSchedule = (workSchedule) => {
        setEditingWorkSchedule(workSchedule);
        setIsWorkScheduleDialogOpen(true);
    };

    const handleCloseHolidayDialog = () => {
        setIsHolidayDialogOpen(false);
        setEditingHoliday(null);
    };

    const handleCloseWorkScheduleDialog = () => {
        setIsWorkScheduleDialogOpen(false);
        setEditingWorkSchedule(null);
    };

    const handleToggleWorkScheduleStatus = async (id) => {
        try {
            const response = await systemConfigService.workSchedules.toggleStatus(id);
            if (response.success) {
                setWorkSchedules((prev) => prev.map(ws => ws.id === id ? {...ws, active: response.data.active} : ws));
                alertConfig.toastSuccess({title: 'Estado cambiado', text: response.message})
            } else {
                alertConfig.toastError({title: 'Error', text: response.message})
            }
        } catch (error) {
            alertConfig.toastError({title: 'Error', text: error.message})
        }
    };

    return (
        <div className="p-8 space-y-6 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">Configuración del Sistema</h1>
                    <p className="text-muted-foreground">Administra los parámetros generales</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-primary"/>
                            <div>
                                <CardTitle>Parámetros de Nómina</CardTitle>
                                <CardDescription>Configuración de pagos y descuentos</CardDescription>
                            </div>
                        </div>
                        <Button onClick={handleSaveConfig} className="gap-2" disabled={numericInvalid || !hasChanges}>
                            <Save className="h-4 w-4"/>
                            Guardar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {numericInvalid && firstNumericError && (
                        <div
                            className="p-3 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                            {firstNumericError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="ISR fijo (MXN)" helper="Monto fijo de ISR que se descuenta de la nómina">
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={isrField.value}
                                onChange={(e) => {
                                    isrField.onChange(e);
                                    handleConfigChange('isrFixed', parseFloat(e.target.value || '0'));
                                }}
                                onBlur={isrField.onBlur}
                                aria-invalid={isrField.showError && !!isrField.error}
                            />
                            {isrField.showError &&
                                <FieldError error={isrField.error} backendError={be.getFieldError('isrFixed')}/>}
                        </Field>

                        <Field label="IMSS fijo (MXN)" helper="Monto fijo de IMSS que se descuenta de la nómina">
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={imssField.value}
                                onChange={(e) => {
                                    imssField.onChange(e);
                                    handleConfigChange('imssFixed', parseFloat(e.target.value || '0'));
                                }}
                                onBlur={imssField.onBlur}
                                aria-invalid={imssField.showError && !!imssField.error}
                            />
                            {imssField.showError &&
                                <FieldError error={imssField.error} backendError={be.getFieldError('imssFixed')}/>}
                        </Field>

                        <Field label="Bono de Puntualidad (MXN)"
                               helper="Bono que se otorga por no tener faltas ni retardos">
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={bonoPuntualidadField.value}
                                onChange={(e) => {
                                    bonoPuntualidadField.onChange(e);
                                    handleConfigChange('bonoPuntualidad', parseFloat(e.target.value || '0'));
                                }}
                                onBlur={bonoPuntualidadField.onBlur}
                                aria-invalid={bonoPuntualidadField.showError && !!bonoPuntualidadField.error}
                            />
                            {bonoPuntualidadField.showError && <FieldError error={bonoPuntualidadField.error}
                                                                           backendError={be.getFieldError('bonusAmount')}/>}
                        </Field>

                        <Field label="Descuento por Retardo (MXN)"
                               helper="Monto que se descuenta por cada día de retardo">
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={descuentoRetardoField.value}
                                onChange={(e) => {
                                    descuentoRetardoField.onChange(e);
                                    handleConfigChange('descuentoRetardo', parseFloat(e.target.value || '0'));
                                }}
                                onBlur={descuentoRetardoField.onBlur}
                                aria-invalid={descuentoRetardoField.showError && !!descuentoRetardoField.error}
                            />
                            {descuentoRetardoField.showError && <FieldError error={descuentoRetardoField.error}
                                                                            backendError={be.getFieldError('latePenalty')}/>}
                        </Field>
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-primary"/>
                            <div>
                                <CardTitle>Días Festivos</CardTitle>
                                <CardDescription>Días inhábiles del año</CardDescription>
                            </div>
                        </div>
                        <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4"/>
                                    Agregar Festivo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingHoliday ? "Editar Día Festivo" : "Agregar Día Festivo"}</DialogTitle>
                                    <DialogDescription>{editingHoliday ? "Modifica la información del día festivo" : "Define un nuevo día festivo"}</DialogDescription>
                                </DialogHeader>
                                <HolidayForm
                                    editingHoliday={editingHoliday}
                                    backendErrors={beHoliday}
                                    onClose={handleCloseHolidayDialog}
                                    onSave={async (holidayData) => {
                                        try {
                                            let response;
                                            if (editingHoliday) {
                                                response = await systemConfigService.holidays.update(editingHoliday.id, holidayData);
                                                if (response.success) {
                                                    setHolidays((prev) => prev.map(h => h.id === editingHoliday.id ? response.data : h));
                                                    alertConfig.toastSuccess({
                                                        title: 'Día festivo actualizado',
                                                        text: response.message
                                                    })
                                                    handleCloseHolidayDialog();
                                                } else {
                                                    beHoliday.setFromList(response.errors || [])
                                                    alertConfig.toastError({title: 'Error', text: response.message})
                                                }
                                            } else {
                                                response = await systemConfigService.holidays.create(holidayData);
                                                if (response.success) {
                                                    setHolidays((prev) => [...prev, response.data]);
                                                    alertConfig.toastSuccess({
                                                        title: 'Día festivo agregado',
                                                        text: response.message
                                                    })
                                                    handleCloseHolidayDialog();
                                                } else {
                                                    beHoliday.setFromList(response.errors || [])
                                                    alertConfig.toastError({title: 'Error', text: response.message})
                                                }
                                            }
                                        } catch (error) {
                                            alertConfig.toastError({title: 'Error', text: error.message})
                                        }
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holidays.map((holiday) => (
                                    <TableRow key={holiday.id}>
                                        <TableCell className="font-medium">{holiday.name}</TableCell>
                                        <TableCell>
                                            {formatISODateLocal(holiday?.date, 'es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={holiday.type === "OBLIGATORY" ? "default" : "secondary"}>
                                                {holiday.type === "OBLIGATORY" ? "Obligatorio" : "Opcional"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{holiday.description || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size=""
                                                        onClick={() => handleEditHoliday(holiday)}>
                                                    <SquarePen className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleDeleteHoliday(holiday.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary"/>
                            <div>
                                <CardTitle>Horarios de Trabajo</CardTitle>
                                <CardDescription>Define horarios de entrada y salida para diferentes
                                    turnos</CardDescription>
                            </div>
                        </div>
                        <Dialog open={isWorkScheduleDialogOpen} onOpenChange={setIsWorkScheduleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4"/>
                                    Agregar Horario
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingWorkSchedule ? "Editar Horario de Trabajo" : "Agregar Horario de Trabajo"}</DialogTitle>
                                    <DialogDescription>{editingWorkSchedule ? "Modifica la información del horario" : "Define un nuevo horario de trabajo"}</DialogDescription>
                                </DialogHeader>
                                <WorkScheduleForm
                                    editingWorkSchedule={editingWorkSchedule}
                                    backendErrors={beWorkSchedule}
                                    onClose={handleCloseWorkScheduleDialog}
                                    onSave={async (workScheduleData) => {
                                        try {
                                            let response;
                                            if (editingWorkSchedule) {
                                                response = await systemConfigService.workSchedules.update(editingWorkSchedule.id, workScheduleData);
                                                if (response.success) {
                                                    setWorkSchedules((prev) => prev.map(ws =>
                                                        ws.id === editingWorkSchedule.id ? response.data : ws
                                                    ));
                                                    alertConfig.toastSuccess({
                                                        title: "Horario actualizado",
                                                        text: response.message
                                                    });
                                                    handleCloseWorkScheduleDialog();
                                                } else {
                                                    beWorkSchedule.setFromList(response.errors || [])
                                                    alertConfig.toastError({title: 'Error', text: response.message})
                                                }
                                            } else {
                                                response = await systemConfigService.workSchedules.create(workScheduleData);
                                                if (response.success) {
                                                    setWorkSchedules((prev) => [...prev, response.data]);
                                                    alertConfig.toastSuccess({
                                                        title: "Horario agregado",
                                                        text: response.message
                                                    });
                                                    handleCloseWorkScheduleDialog();
                                                } else {
                                                    beWorkSchedule.setFromList(response.errors || [])
                                                    alertConfig.toastError({title: 'Error', text: response.message})
                                                }
                                            }
                                        } catch (error) {
                                            alertConfig.toastError({title: "Error", text: error.message})
                                        }
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Entrada</TableHead>
                                    <TableHead>Salida</TableHead>
                                    <TableHead>Tolerancia (min)</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workSchedules.map((ws) => (
                                    <TableRow key={ws.id}>
                                        <TableCell className="font-medium">{ws.name}</TableCell>
                                        <TableCell>{ws.entryTime}</TableCell>
                                        <TableCell>{ws.exitTime}</TableCell>
                                        <TableCell>{ws.toleranceMinutes || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={ws.active ? "default" : "secondary"}>
                                                {ws.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{ws.description || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm"
                                                        onClick={() => handleEditWorkSchedule(ws)}>
                                                    <SquarePen className="h-6 w-4"/>
                                                </Button>
                                                <Switch
                                                    checked={ws.active}
                                                    onCheckedChange={() => handleToggleWorkScheduleStatus(ws.id)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({label, helper, children}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        </div>
    );
}

function HolidayForm({editingHoliday, onClose, onSave, backendErrors}) {
    const [formData, setFormData] = useState({
        name: editingHoliday?.name || "",
        holidayDate: editingHoliday?.date || "",
        type: editingHoliday?.type || "OBLIGATORY",
        description: editingHoliday?.description || ""
    });
    const nameField = useFieldValidation(formData.name, makeRules(
        rulesLib.required("El nombre es obligatorio"),
        rulesLib.minLength(2, "Debe tener al menos 2 caracteres"),
        rulesLib.maxLength(100, "Máximo 100 caracteres")
    ));
    const dateField = useFieldValidation(formData.holidayDate, makeRules(
        rulesLib.required("La fecha es obligatoria"),
        rulesLib.isValidDate("Fecha inválida")
    ));

    // Cargar datos cuando se está editando
    useEffect(() => {
        if (editingHoliday) {
            const initialData = {
                name: editingHoliday.name || "",
                holidayDate: editingHoliday.date || "",
                type: editingHoliday.type || "OBLIGATORY",
                description: editingHoliday.description || ""
            };
            setFormData(initialData);
            nameField.onChange({target: {value: initialData.name}});
            dateField.onChange({target: {value: initialData.holidayDate}});
        }
    }, [editingHoliday]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nameField.isValid || !dateField.isValid) {
            await alertConfig.toastError({title: "Campos incompletos", text: "Completa todos los campos requeridos"});
            return;
        }
        const holidayData = {
            name: nameField.value,
            holidayDate: dateField.value,
            type: formData.type,
            description: formData.description,
        };
        onSave(holidayData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre del Festivo *">
                <Input
                    placeholder="Ej: Día de la Independencia"
                    value={nameField.value}
                    onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        nameField.onChange(e);
                    }}
                    onBlur={nameField.onBlur}
                    aria-invalid={nameField.showError && !!nameField.error}
                />
                {nameField.showError && nameField.error &&
                    <p className="text-[12px] text-destructive">{nameField.error}</p>}
                {backendErrors?.getFieldError && (
                    <FieldError backendError={backendErrors.getFieldError('name')}/>
                )}
            </Field>
            <Field label="Fecha *">
                {/* Sustituido Input tipo date por Calendar */}
                <CalendarComponent
                    value={dateField.value}
                    onChange={(dateObj, isoLocal) => {
                        setFormData({ ...formData, holidayDate: isoLocal });
                        // Mantener la integración con el hook de validación
                        dateField.onChange({ target: { value: isoLocal } });
                    }}
                    minDate={undefined}
                    maxDate={undefined}
                    disabled={false}
                    className="mt-1"
                />
                {dateField.showError && dateField.error &&
                    <p className="text-[12px] text-destructive">{dateField.error}</p>}
                {backendErrors?.getFieldError && (
                    <FieldError backendError={backendErrors.getFieldError('holidayDate')}/>
                )}
            </Field>
            <Field label="Tipo *">
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="OBLIGATORY">Obligatorio</SelectItem>
                        <SelectItem value="OPTIONAL">Opcional</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="Descripción">
                <Input
                    placeholder="Descripción"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </Field>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!nameField.isValid || !dateField.isValid}>
                    {editingHoliday ? "Actualizar Festivo" : "Agregar Festivo"}
                </Button>
            </div>
        </form>
    );
}

function WorkScheduleForm({editingWorkSchedule, onClose, onSave, backendErrors}) {
    const [formData, setFormData] = useState({
        name: editingWorkSchedule?.name || "",
        entryTime: editingWorkSchedule?.entryTime || "",
        exitTime: editingWorkSchedule?.exitTime || "",
        toleranceMinutes: editingWorkSchedule?.toleranceMinutes?.toString() || "",
        description: editingWorkSchedule?.description || ""
    });
    const nameField = useFieldValidation(formData.name, makeRules(
        rulesLib.required("El nombre es obligatorio"),
        rulesLib.minLength(2, "Debe tener al menos 2 caracteres"),
        rulesLib.maxLength(100, "Máximo 100 caracteres")
    ));
    const entryTimeField = useFieldValidation(formData.entryTime, makeRules(
        rulesLib.required("La hora de entrada es obligatoria"),
        rulesLib.timeHHmm("Formato HH:mm inválido")
    ));
    const exitTimeField = useFieldValidation(formData.exitTime, makeRules(
        rulesLib.required("La hora de salida es obligatoria"),
        rulesLib.timeHHmm("Formato HH:mm inválido")
    ));
    const toleranceMinutesField = useFieldValidation(formData.toleranceMinutes, makeRules(
        rulesLib.required("Requerido"),
        rulesLib.integerRange(0, 60, "0-60 minutos")
    ));

    // Cargar datos cuando se está editando
    useEffect(() => {
        if (editingWorkSchedule) {
            const initialData = {
                name: editingWorkSchedule.name || "",
                entryTime: editingWorkSchedule.entryTime || "",
                exitTime: editingWorkSchedule.exitTime || "",
                toleranceMinutes: editingWorkSchedule.toleranceMinutes?.toString() || "",
                description: editingWorkSchedule.description || ""
            };
            setFormData(initialData);
            nameField.onChange({target: {value: initialData.name}});
            entryTimeField.onChange({target: {value: initialData.entryTime}});
            exitTimeField.onChange({target: {value: initialData.exitTime}});
            toleranceMinutesField.onChange({target: {value: initialData.toleranceMinutes}});
        }
    }, [editingWorkSchedule]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nameField.isValid || !entryTimeField.isValid || !exitTimeField.isValid || !toleranceMinutesField.isValid) {
            await alertConfig.toastError({title: "Campos incompletos", text: "Completa todos los campos requeridos"});
            return;
        }
        const workScheduleData = {
            name: nameField.value,
            entryTime: entryTimeField.value,
            exitTime: exitTimeField.value,
            toleranceMinutes: parseInt(toleranceMinutesField.value),
            description: formData.description,
        };
        onSave(workScheduleData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre del Horario *">
                <Input
                    placeholder="Ej: Turno Matutino"
                    value={nameField.value}
                    onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        nameField.onChange(e);
                    }}
                    onBlur={nameField.onBlur}
                    aria-invalid={nameField.showError && !!nameField.error}
                />
                {nameField.showError && nameField.error &&
                    <p className="text-[12px] text-destructive">{nameField.error}</p>}
                {/* Error del backend por campo */}
                {backendErrors?.getFieldError && (
                    <FieldError backendError={backendErrors.getFieldError('name')}/>
                )}
            </Field>
            <Field label="Hora de Entrada *">
                <TimePicker
                    value={formData.entryTime}
                    onChange={(v) => {
                        setFormData({...formData, entryTime: v});
                        entryTimeField.onChange({target: {value: v}});
                    }}
                    onBlur={entryTimeField.onBlur}
                    aria-invalid={entryTimeField.showError && !!entryTimeField.error}
                />
                {entryTimeField.showError && entryTimeField.error &&
                    <p className="text-[12px] text-destructive">{entryTimeField.error}</p>}
            </Field>
            <Field label="Hora de Salida *">
                <TimePicker
                    value={formData.exitTime}
                    onChange={(v) => {
                        setFormData({...formData, exitTime: v});
                        exitTimeField.onChange({target: {value: v}});
                    }}
                    onBlur={exitTimeField.onBlur}
                    aria-invalid={exitTimeField.showError && !!exitTimeField.error}
                />
                {exitTimeField.showError && exitTimeField.error &&
                    <p className="text-[12px] text-destructive">{exitTimeField.error}</p>}
            </Field>
            <Field label="Tolerancia (min) *" helper="Minutos de tolerancia para entrada y salida">
                <Input
                    type="number"
                    value={toleranceMinutesField.value}
                    min={0}
                    max={60}
                    onChange={(e) => {
                        toleranceMinutesField.onChange(e);
                        setFormData({...formData, toleranceMinutes: e.target.value});
                    }}
                    onBlur={toleranceMinutesField.onBlur}
                    aria-invalid={toleranceMinutesField.showError && !!toleranceMinutesField.error}
                />
                {toleranceMinutesField.showError && toleranceMinutesField.error && (
                    <p className="text-xs text-destructive">{toleranceMinutesField.error}</p>
                )}
            </Field>
            <Field label="Descripción">
                <Input
                    placeholder="Descripción"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </Field>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="submit"
                        disabled={!nameField.isValid || !entryTimeField.isValid || !exitTimeField.isValid || !toleranceMinutesField.isValid}>
                    {editingWorkSchedule ? "Actualizar Horario" : "Agregar Horario"}
                </Button>
            </div>
        </form>
    );
}

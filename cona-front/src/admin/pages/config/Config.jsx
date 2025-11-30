"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, DollarSign, Calendar, Plus, Trash2, Save, SquarePen  } from "lucide-react";
import { alertConfig } from "@/lib/alert-config";
import { useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";
import { systemConfigService } from "./service/configService";

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
        } else if (response.status === 422) {
          // No config set, use initial
        } else {
          alertConfig.toastError({ title: "Error", text: "No se pudo cargar la configuración de nómina" });
        }
      } catch (error) {
        console.error("Error loading payroll config:", error);
        if (error.response?.status !== 422) {
          alertConfig.toastError({ title: "Error", text: "No se pudo cargar la configuración de nómina" });
        }
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
        alertConfig.toastError({ title: "Error", text: "No se pudieron cargar los días festivos" });
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
        alertConfig.toastError({ title: "Error", text: "No se pudieron cargar los horarios de trabajo" });
      }
    };

    loadConfig();
    loadHolidays();
    loadWorkSchedules();
  }, []);

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
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

  const numericInvalid = [
    bonoPuntualidadField,
    descuentoRetardoField,
    isrField,
    imssField,
  ].some((f) => !f.isValid);

  const handleSaveConfig = async () => {
    if (numericInvalid) {
      alertConfig.toastError({ title: "Errores de validación", text: "Corrige los campos marcados" });
      return;
    }
    try {
      const payrollData = {
        isrFixed: config.isrFixed,
        imssFixed: config.imssFixed,
        latePenalty: config.descuentoRetardo,
        bonusAmount: config.bonoPuntualidad,
      };
      await systemConfigService.payrollConfig.update(payrollData);
      alertConfig.toastSuccess({ title: "Configuración guardada", text: "Los cambios han sido aplicados" });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving config:", error);
      alertConfig.toastError({ title: "Error", text: "No se pudo guardar la configuración" });
    }
  };
  const handleDeleteHoliday = async (id) => {
    try {
      await systemConfigService.holidays.delete(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      alertConfig.toastInfo({ title: "Día festivo eliminado", text: "El día festivo ha sido removido" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      alertConfig.toastError({ title: "Error", text: "No se pudo eliminar el día festivo" });
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
        setWorkSchedules((prev) => prev.map(ws => 
          ws.id === id ? { ...ws, active: response.data.active } : ws
        ));
        const statusText = response.data.active ? "activado" : "desactivado";
        alertConfig.toastSuccess({ title: "Estado cambiado", text: `El horario ha sido ${statusText}` });
      }
    } catch (error) {
      console.error("Error toggling work schedule status:", error);
      alertConfig.toastError({ title: "Error", text: "No se pudo cambiar el estado del horario" });
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra los parámetros generales</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveConfig} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Parámetros de Nómina</CardTitle>
                <CardDescription>Configuración de pagos y descuentos</CardDescription>
              </div>
            </div>
            <Button onClick={handleSaveConfig} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="ISR fijo (MXN)" helper="Monto fijo de ISR que se descuenta de la nómina">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={isrField.value}
                onChange={(e) => {
                  isrField.onChange(e);
                  handleConfigChange("isrFixed", parseFloat(e.target.value || "0"));
                }}
                onBlur={isrField.onBlur}
                aria-invalid={isrField.showError && !!isrField.error}
              />
              {isrField.showError && isrField.error && (
                <p className="text-xs text-destructive">{isrField.error}</p>
              )}
            </Field>
            
            <Field label="IMSS fijo (MXN)" helper="Monto fijo de IMSS que se descuenta de la nómina">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={imssField.value}
                onChange={(e) => {
                  imssField.onChange(e);
                  handleConfigChange("imssFixed", parseFloat(e.target.value || "0"));
                }}
                onBlur={imssField.onBlur}
                aria-invalid={imssField.showError && !!imssField.error}
              />
              {imssField.showError && imssField.error && (
                <p className="text-xs text-destructive">{imssField.error}</p>
              )}
            </Field>
            
            <Field label="Bono de Puntualidad (MXN)" helper="Bono que se otorga por no tener faltas ni retardos">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={bonoPuntualidadField.value}
                onChange={(e) => {
                  bonoPuntualidadField.onChange(e);
                  handleConfigChange("bonoPuntualidad", parseFloat(e.target.value || "0"));
                }}
                onBlur={bonoPuntualidadField.onBlur}
                aria-invalid={bonoPuntualidadField.showError && !!bonoPuntualidadField.error}
              />
              {bonoPuntualidadField.showError && bonoPuntualidadField.error && (
                <p className="text-xs text-destructive">{bonoPuntualidadField.error}</p>
              )}
            </Field>
            
            <Field label="Descuento por Retardo (MXN)" helper="Monto que se descuenta por cada día de retardo">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={descuentoRetardoField.value}
                onChange={(e) => {
                  descuentoRetardoField.onChange(e);
                  handleConfigChange("descuentoRetardo", parseFloat(e.target.value || "0"));
                }}
                onBlur={descuentoRetardoField.onBlur}
                aria-invalid={descuentoRetardoField.showError && !!descuentoRetardoField.error}
              />
              {descuentoRetardoField.showError && descuentoRetardoField.error && (
                <p className="text-xs text-destructive">{descuentoRetardoField.error}</p>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Días Festivos</CardTitle>
                <CardDescription>Días inhábiles del año</CardDescription>
              </div>
            </div>
            <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
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
                  onClose={handleCloseHolidayDialog}
                  onSave={async (holidayData) => {
                    try {
                      let response;
                      if (editingHoliday) {
                        response = await systemConfigService.holidays.update(editingHoliday.id, holidayData);
                        if (response.success) {
                          setHolidays((prev) => prev.map(h => 
                            h.id === editingHoliday.id ? response.data : h
                          ));
                          alertConfig.toastSuccess({ title: "Día festivo actualizado", text: `${holidayData.name} ha sido actualizado` });
                        }
                      } else {
                        response = await systemConfigService.holidays.create(holidayData);
                        if (response.success) {
                          setHolidays((prev) => [...prev, response.data]);
                          alertConfig.toastSuccess({ title: "Día festivo agregado", text: `${holidayData.name} ha sido agregado` });
                        }
                      }
                      handleCloseHolidayDialog();
                    } catch (error) {
                      console.error("Error saving holiday:", error);
                      alertConfig.toastError({ title: "Error", text: "No se pudo guardar el día festivo" });
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
                      {new Date(holiday.date).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.type === "OBLIGATORY" ? "default" : "secondary"}>
                        {holiday.type === "OBLIGATORY" ? "Obligatorio" : "Opcional"}
                      </Badge>
                    </TableCell>
                    <TableCell>{holiday.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="" onClick={() => handleEditHoliday(holiday)}>
                          <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteHoliday(holiday.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Horarios de Trabajo</CardTitle>
                <CardDescription>Define horarios de entrada y salida para diferentes turnos</CardDescription>
              </div>
            </div>
            <Dialog open={isWorkScheduleDialogOpen} onOpenChange={setIsWorkScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
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
                          alertConfig.toastSuccess({ title: "Horario actualizado", text: `${workScheduleData.name} ha sido actualizado` });
                        }
                      } else {
                        response = await systemConfigService.workSchedules.create(workScheduleData);
                        if (response.success) {
                          setWorkSchedules((prev) => [...prev, response.data]);
                          alertConfig.toastSuccess({ title: "Horario agregado", text: `${workScheduleData.name} ha sido agregado` });
                        }
                      }
                      handleCloseWorkScheduleDialog();
                    } catch (error) {
                      console.error("Error saving work schedule:", error);
                      alertConfig.toastError({ title: "Error", text: "No se pudo guardar el horario de trabajo" });
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
                        <Button variant="ghost" size="sm" onClick={() => handleEditWorkSchedule(ws)}>
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

function Field({ label, helper, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function HolidayForm({ editingHoliday, onClose, onSave }) {
  const [formData, setFormData] = useState({ 
    name: editingHoliday?.name || "", 
    holidayDate: editingHoliday?.date || "", 
    type: editingHoliday?.type || "OBLIGATORY", 
    description: editingHoliday?.description || "" 
  });
  const nameField = useFieldValidation(formData.name, makeRules(rulesLib.required("El nombre es obligatorio")));
  const dateField = useFieldValidation(formData.holidayDate, makeRules(rulesLib.required("La fecha es obligatoria")));

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
      nameField.onChange({ target: { value: initialData.name } });
      dateField.onChange({ target: { value: initialData.holidayDate } });
    }
  }, [editingHoliday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameField.isValid || !dateField.isValid) {
      await alertConfig.toastError({ title: "Campos incompletos", text: "Completa todos los campos requeridos" });
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
            setFormData({ ...formData, name: e.target.value });
            nameField.onChange(e);
          }}
          onBlur={nameField.onBlur}
          aria-invalid={nameField.showError && !!nameField.error}
        />
        {nameField.showError && nameField.error && <p className="text-[12px] text-destructive">{nameField.error}</p>}
      </Field>
      <Field label="Fecha *">
        <Input
          type="date"
          value={dateField.value}
          onChange={(e) => {
            setFormData({ ...formData, holidayDate: e.target.value });
            dateField.onChange(e);
          }}
          onBlur={dateField.onBlur}
          aria-invalid={dateField.showError && !!dateField.error}
        />
        {dateField.showError && dateField.error && <p className="text-[12px] text-destructive">{dateField.error}</p>}
      </Field>
      <Field label="Tipo *">
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OBLIGATORY">Obligatorio</SelectItem>
            <SelectItem value="OPTIONAL">Opcional</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Descripción">
        <Input
          placeholder="Descripción opcional"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

function WorkScheduleForm({ editingWorkSchedule, onClose, onSave }) {
  const [formData, setFormData] = useState({ 
    name: editingWorkSchedule?.name || "", 
    entryTime: editingWorkSchedule?.entryTime || "", 
    exitTime: editingWorkSchedule?.exitTime || "", 
    toleranceMinutes: editingWorkSchedule?.toleranceMinutes?.toString() || "", 
    description: editingWorkSchedule?.description || "" 
  });
  const nameField = useFieldValidation(formData.name, makeRules(rulesLib.required("El nombre es obligatorio")));
  const entryTimeField = useFieldValidation(formData.entryTime, makeRules(rulesLib.required("La hora de entrada es obligatoria")));
  const exitTimeField = useFieldValidation(formData.exitTime, makeRules(rulesLib.required("La hora de salida es obligatoria")));
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
      nameField.onChange({ target: { value: initialData.name } });
      entryTimeField.onChange({ target: { value: initialData.entryTime } });
      exitTimeField.onChange({ target: { value: initialData.exitTime } });
      toleranceMinutesField.onChange({ target: { value: initialData.toleranceMinutes } });
    }
  }, [editingWorkSchedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameField.isValid || !entryTimeField.isValid || !exitTimeField.isValid || !toleranceMinutesField.isValid) {
      await alertConfig.toastError({ title: "Campos incompletos", text: "Completa todos los campos requeridos" });
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
            setFormData({ ...formData, name: e.target.value });
            nameField.onChange(e);
          }}
          onBlur={nameField.onBlur}
          aria-invalid={nameField.showError && !!nameField.error}
        />
        {nameField.showError && nameField.error && <p className="text-[12px] text-destructive">{nameField.error}</p>}
      </Field>
      <Field label="Hora de Entrada *">
        <TimePicker
          value={formData.entryTime}
          onChange={(v) => {
            setFormData({ ...formData, entryTime: v });
            entryTimeField.onChange({ target: { value: v } });
          }}
          onBlur={entryTimeField.onBlur}
          aria-invalid={entryTimeField.showError && !!entryTimeField.error}
        />
        {entryTimeField.showError && entryTimeField.error && <p className="text-[12px] text-destructive">{entryTimeField.error}</p>}
      </Field>
      <Field label="Hora de Salida *">
        <TimePicker
          value={formData.exitTime}
          onChange={(v) => {
            setFormData({ ...formData, exitTime: v });
            exitTimeField.onChange({ target: { value: v } });
          }}
          onBlur={exitTimeField.onBlur}
          aria-invalid={exitTimeField.showError && !!exitTimeField.error}
        />
        {exitTimeField.showError && exitTimeField.error && <p className="text-[12px] text-destructive">{exitTimeField.error}</p>}
      </Field>
      <Field label="Tolerancia (min) *" helper="Minutos de tolerancia para entrada y salida">
        <Input
          type="number"
          value={toleranceMinutesField.value}
          min={0}
          max={60}
          onChange={(e) => {
            toleranceMinutesField.onChange(e);
            setFormData({ ...formData, toleranceMinutes: e.target.value });
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
          placeholder="Descripción opcional"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Field>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!nameField.isValid || !entryTimeField.isValid || !exitTimeField.isValid || !toleranceMinutesField.isValid}>
          {editingWorkSchedule ? "Actualizar Horario" : "Agregar Horario"}
        </Button>
      </div>
    </form>
  );
}

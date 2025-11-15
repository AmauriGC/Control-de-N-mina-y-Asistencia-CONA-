"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Clock, DollarSign, Calendar, Plus, Trash2, Save } from "lucide-react";
import { alertConfig } from "@/lib/alert-config";
import { useFieldValidation, makeRules, rulesLib } from "@/hooks/use-validation";

const mockHolidays = [
  { id: "1", name: "Año Nuevo", date: "2024-01-01", isRecurring: true },
  { id: "2", name: "Día de la Constitución", date: "2024-02-05", isRecurring: true },
  { id: "3", name: "Natalicio de Benito Juárez", date: "2024-03-18", isRecurring: true },
  { id: "4", name: "Día del Trabajo", date: "2024-05-01", isRecurring: true },
  { id: "5", name: "Día de la Independencia", date: "2024-09-16", isRecurring: true },
  { id: "6", name: "Día de la Revolución", date: "2024-11-18", isRecurring: true },
  { id: "7", name: "Navidad", date: "2024-12-25", isRecurring: true },
];

const initialConfig = {
  workScheduleStart: "09:00",
  workScheduleEnd: "18:00",
  lateThresholdMinutes: 10,
  vacationPayMultiplier: 3,
  payrollDeduction: 200,
  justificationDeadlineDays: 2,
  contractAlertDays: 30,
  isrFixed: 100.0,
  imssFixed: 100.0,
  salarioMinimo: 248.93,
  diasPagoMes: 15,
  horasLaboralesDia: 8,
  bonoPuntualidad: 0,
  descuentoRetardo: 0,
  fechaVigencia: new Date().toISOString().slice(0, 10),
};

export default function ConfigPage() {
  const [config, setConfig] = useState(initialConfig);
  const [holidays, setHolidays] = useState(mockHolidays);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };
  const handleSaveConfig = async () => {
    await alertConfig.toastSuccess({ title: "Configuración guardada", text: "Los cambios han sido aplicados" });
    setHasChanges(false);
  };
  const handleDeleteHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    alertConfig.toastInfo({ title: "Día festivo eliminado", text: "El día festivo ha sido removido" });
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
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Horarios Laborales</CardTitle>
              <CardDescription>Define los horarios de entrada y salida</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Hora de Entrada" helper="Horario estándar de inicio">
              <TimePicker
                value={config.workScheduleStart}
                onChange={(v) => handleConfigChange("workScheduleStart", v)}
              />
            </Field>
            <Field label="Hora de Salida" helper="Horario estándar de fin">
              <TimePicker value={config.workScheduleEnd} onChange={(v) => handleConfigChange("workScheduleEnd", v)} />
            </Field>
          </div>
          <Field label="Tolerancia de Retardo (minutos)" helper="Minutos antes de marcar retardo">
            <Input
              type="number"
              value={config.lateThresholdMinutes}
              min={0}
              max={60}
              onChange={(e) => handleConfigChange("lateThresholdMinutes", parseInt(e.target.value))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Parámetros de Nómina</CardTitle>
              <CardDescription>Configuración de pagos y descuentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="ISR fijo (MXN)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.isrFixed}
                onChange={(e) => handleConfigChange("isrFixed", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field label="IMSS fijo (MXN)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.imssFixed}
                onChange={(e) => handleConfigChange("imssFixed", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field label="Descuento por Vacaciones (MXN)" helper="Descuento aplicado al tomar vacaciones">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.payrollDeduction}
                onChange={(e) => handleConfigChange("payrollDeduction", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field label="Salario Mínimo General (MXN)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.salarioMinimo}
                onChange={(e) => handleConfigChange("salarioMinimo", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field label="Días de Pago por Mes">
              <Input
                type="number"
                min={1}
                max={31}
                value={config.diasPagoMes}
                onChange={(e) => handleConfigChange("diasPagoMes", parseInt(e.target.value || "0"))}
              />
            </Field>
            <Field label="Horas Laborales por Día">
              <Input
                type="number"
                min={1}
                max={24}
                value={config.horasLaboralesDia}
                onChange={(e) => handleConfigChange("horasLaboralesDia", parseInt(e.target.value || "0"))}
              />
            </Field>
            <Field label="Bono de Puntualidad (MXN)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.bonoPuntualidad}
                onChange={(e) => handleConfigChange("bonoPuntualidad", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field label="Descuento por Retardo (MXN)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={config.descuentoRetardo}
                onChange={(e) => handleConfigChange("descuentoRetardo", parseFloat(e.target.value || "0"))}
              />
            </Field>
            <Field
              label="Multiplicador Pago Vacacional"
              helper={`Veces el salario semanal (actualmente ${config.vacationPayMultiplier}x)`}
            >
              <Input
                type="number"
                min={1}
                max={5}
                value={config.vacationPayMultiplier}
                onChange={(e) => handleConfigChange("vacationPayMultiplier", parseInt(e.target.value || "0"))}
              />
            </Field>
            <Field label="Fecha de Vigencia">
              <Input
                type="date"
                value={config.fechaVigencia}
                onChange={(e) => handleConfigChange("fechaVigencia", e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Reglas del Sistema</CardTitle>
              <CardDescription>Plazos y alertas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Plazo para Justificar (días)" helper="Días máximos para justificar">
              <Input
                type="number"
                min={1}
                max={7}
                value={config.justificationDeadlineDays}
                onChange={(e) => handleConfigChange("justificationDeadlineDays", parseInt(e.target.value))}
              />
            </Field>
            <Field label="Alerta de Contratos (días)" helper="Anticipación para contratos por vencer">
              <Input
                type="number"
                min={1}
                max={90}
                value={config.contractAlertDays}
                onChange={(e) => handleConfigChange("contractAlertDays", parseInt(e.target.value))}
              />
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
                  <DialogTitle>Agregar Día Festivo</DialogTitle>
                  <DialogDescription>Define un nuevo día festivo</DialogDescription>
                </DialogHeader>
                <HolidayForm
                  onClose={() => setIsHolidayDialogOpen(false)}
                  onAdd={(h) => {
                    setHolidays((prev) => [...prev, h]);
                    setIsHolidayDialogOpen(false);
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
                      <Badge variant={holiday.isRecurring ? "default" : "secondary"}>
                        {holiday.isRecurring ? "Recurrente" : "Único"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteHoliday(holiday.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

function HolidayForm({ onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", date: "", isRecurring: true });
  const nameField = useFieldValidation(formData.name, makeRules(rulesLib.required("El nombre es obligatorio")));
  const dateField = useFieldValidation(formData.date, makeRules(rulesLib.required("La fecha es obligatoria")));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameField.isValid || !dateField.isValid) {
      await alertConfig.toastError({ title: "Campos incompletos", text: "Completa todos los campos requeridos" });
      return;
    }
    const newHoliday = {
      id: Date.now().toString(),
      name: nameField.value,
      date: dateField.value,
      isRecurring: formData.isRecurring,
    };
    onAdd(newHoliday);
    await alertConfig.toastSuccess({ title: "Día festivo agregado", text: `${nameField.value} ha sido agregado` });
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
            setFormData({ ...formData, date: e.target.value });
            dateField.onChange(e);
          }}
          onBlur={dateField.onBlur}
          aria-invalid={dateField.showError && !!dateField.error}
        />
        {dateField.showError && dateField.error && <p className="text-[12px] text-destructive">{dateField.error}</p>}
      </Field>
      <div className="flex items-center gap-3">
        <input
          id="recurring"
          type="checkbox"
          checked={formData.isRecurring}
          onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
          className="w-4 h-4 rounded border-input"
        />
        <Label htmlFor="recurring" className="cursor-pointer">
          Festivo recurrente (cada año)
        </Label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!nameField.isValid || !dateField.isValid}>
          Agregar Festivo
        </Button>
      </div>
    </form>
  );
}

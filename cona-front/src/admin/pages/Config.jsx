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
import { useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";

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
  const lateThresholdField = useFieldValidation(String(config.lateThresholdMinutes), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(0, 60, "0-60 minutos")
  ));
  const vacationPayMultiplierField = useFieldValidation(String(config.vacationPayMultiplier), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(1, 5, "Rango 1-5")
  ));
  const justificationDeadlineField = useFieldValidation(String(config.justificationDeadlineDays), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(1, 7, "1-7 días")
  ));
  const contractAlertDaysField = useFieldValidation(String(config.contractAlertDays), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(1, 90, "1-90 días")
  ));
  const diasPagoMesField = useFieldValidation(String(config.diasPagoMes), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(1, 31, "1-31 días")
  ));
  const horasLaboralesDiaField = useFieldValidation(String(config.horasLaboralesDia), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.integerRange(1, 24, "1-24 horas")
  ));
  const salarioMinimoField = useFieldValidation(String(config.salarioMinimo), makeRules(
    rulesLib.required("Requerido"),
    rulesLib.positiveNumber("Debe ser positivo")
  ));
  const bonoPuntualidadField = useFieldValidation(String(config.bonoPuntualidad), makeRules(
    rulesLib.optional(rulesLib.positiveNumber("Debe ser positivo"))
  ));
  const descuentoRetardoField = useFieldValidation(String(config.descuentoRetardo), makeRules(
    rulesLib.optional(rulesLib.positiveNumber("Debe ser positivo"))
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
    lateThresholdField,
    vacationPayMultiplierField,
    justificationDeadlineField,
    contractAlertDaysField,
    diasPagoMesField,
    horasLaboralesDiaField,
    salarioMinimoField,
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
              value={lateThresholdField.value}
              min={0}
              max={60}
              onChange={(e) => {
                lateThresholdField.onChange(e);
                handleConfigChange("lateThresholdMinutes", parseInt(e.target.value || "0"));
              }}
              onBlur={lateThresholdField.onBlur}
              aria-invalid={lateThresholdField.showError && !!lateThresholdField.error}
            />
            {lateThresholdField.showError && lateThresholdField.error && (
              <p className="text-xs text-destructive">{lateThresholdField.error}</p>
            )}
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
            <Field label="IMSS fijo (MXN)">
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
                value={salarioMinimoField.value}
                onChange={(e) => {
                  salarioMinimoField.onChange(e);
                  handleConfigChange("salarioMinimo", parseFloat(e.target.value || "0"));
                }}
                onBlur={salarioMinimoField.onBlur}
                aria-invalid={salarioMinimoField.showError && !!salarioMinimoField.error}
              />
              {salarioMinimoField.showError && salarioMinimoField.error && (
                <p className="text-xs text-destructive">{salarioMinimoField.error}</p>
              )}
            </Field>
            <Field label="Días de Pago por Mes">
              <Input
                type="number"
                min={1}
                max={31}
                value={diasPagoMesField.value}
                onChange={(e) => {
                  diasPagoMesField.onChange(e);
                  handleConfigChange("diasPagoMes", parseInt(e.target.value || "0"));
                }}
                onBlur={diasPagoMesField.onBlur}
                aria-invalid={diasPagoMesField.showError && !!diasPagoMesField.error}
              />
              {diasPagoMesField.showError && diasPagoMesField.error && (
                <p className="text-xs text-destructive">{diasPagoMesField.error}</p>
              )}
            </Field>
            <Field label="Horas Laborales por Día">
              <Input
                type="number"
                min={1}
                max={24}
                value={horasLaboralesDiaField.value}
                onChange={(e) => {
                  horasLaboralesDiaField.onChange(e);
                  handleConfigChange("horasLaboralesDia", parseInt(e.target.value || "0"));
                }}
                onBlur={horasLaboralesDiaField.onBlur}
                aria-invalid={horasLaboralesDiaField.showError && !!horasLaboralesDiaField.error}
              />
              {horasLaboralesDiaField.showError && horasLaboralesDiaField.error && (
                <p className="text-xs text-destructive">{horasLaboralesDiaField.error}</p>
              )}
            </Field>
            <Field label="Bono de Puntualidad (MXN)">
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
            <Field label="Descuento por Retardo (MXN)">
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
            <Field
              label="Multiplicador Pago Vacacional"
              helper={`Veces el salario semanal (actualmente ${vacationPayMultiplierField.value}x)`}
            >
              <Input
                type="number"
                min={1}
                max={5}
                value={vacationPayMultiplierField.value}
                onChange={(e) => {
                  vacationPayMultiplierField.onChange(e);
                  handleConfigChange("vacationPayMultiplier", parseInt(e.target.value || "0"));
                }}
                onBlur={vacationPayMultiplierField.onBlur}
                aria-invalid={vacationPayMultiplierField.showError && !!vacationPayMultiplierField.error}
              />
              {vacationPayMultiplierField.showError && vacationPayMultiplierField.error && (
                <p className="text-xs text-destructive">{vacationPayMultiplierField.error}</p>
              )}
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
                value={justificationDeadlineField.value}
                onChange={(e) => {
                  justificationDeadlineField.onChange(e);
                  handleConfigChange("justificationDeadlineDays", parseInt(e.target.value || "0"));
                }}
                onBlur={justificationDeadlineField.onBlur}
                aria-invalid={justificationDeadlineField.showError && !!justificationDeadlineField.error}
              />
              {justificationDeadlineField.showError && justificationDeadlineField.error && (
                <p className="text-xs text-destructive">{justificationDeadlineField.error}</p>
              )}
            </Field>
            <Field label="Alerta de Contratos (días)" helper="Anticipación para contratos por vencer">
              <Input
                type="number"
                min={1}
                max={90}
                value={contractAlertDaysField.value}
                onChange={(e) => {
                  contractAlertDaysField.onChange(e);
                  handleConfigChange("contractAlertDays", parseInt(e.target.value || "0"));
                }}
                onBlur={contractAlertDaysField.onBlur}
                aria-invalid={contractAlertDaysField.showError && !!contractAlertDaysField.error}
              />
              {contractAlertDaysField.showError && contractAlertDaysField.error && (
                <p className="text-xs text-destructive">{contractAlertDaysField.error}</p>
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

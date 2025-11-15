"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Field from "@/components/ui/field";
import { useFieldValidation, makeRules, rulesLib } from "@/hooks/use-validation";
import { alertConfig } from "@/lib/alert-config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, AlertCircle, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";

const mockEmployees = [
  {
    id: "2",
    employeeNumber: "E002",
    name: "María Empleada",
    email: "maria@empresa.com",
    role: "employee",
    position: "Operadora",
    department: "Producción",
    schedule: "09:00",
    weeklySalary: 4200,
    vacationDaysAvailable: 8,
    contractStartDate: "2023-06-01",
    contractEndDate: "2024-02-15",
    contractStatus: "active",
    status: "active",
  },
  {
    id: "3",
    employeeNumber: "E003",
    name: "Juan Pérez",
    email: "juan@empresa.com",
    role: "employee",
    position: "Técnico",
    department: "Mantenimiento",
    schedule: "08:00",
    weeklySalary: 5500,
    vacationDaysAvailable: 10,
    contractStartDate: "2021-03-10",
    contractEndDate: "2024-02-28",
    contractStatus: "active",
    status: "active",
  },
  {
    id: "4",
    employeeNumber: "E004",
    name: "Ana García",
    email: "ana@empresa.com",
    role: "employee",
    position: "Administrativo",
    department: "Recursos Humanos",
    schedule: "09:00",
    weeklySalary: 4800,
    vacationDaysAvailable: 15,
    contractStartDate: "2020-08-20",
    contractEndDate: "2025-08-20",
    contractStatus: "active",
    status: "active",
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleEmployeeStatus = async (id) => {
    const target = employees.find((e) => e.id === id)
    const nextStatus = target?.status === "active" ? "inactivo" : "activo"
    const ok = await alertConfig.confirm({ title: `¿Cambiar estado a ${nextStatus}?`, text: "Podrás revertirlo después." })
    if (!ok) return
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status: emp.status === "active" ? "inactive" : "active" } : emp))
    );
    alertConfig.toastInfo({ title: "Estado actualizado", text: "El estado del empleado ha sido modificado" });
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Empleados</h1>
          <p className="text-muted-foreground">Administra la información del personal</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(o) => {
            if (!o) setEditingEmployee(null);
            setIsDialogOpen(o);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            {/* Encabezado decorativo */}
            <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    {editingEmployee ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {editingEmployee ? "Actualizar Empleado" : "Registrar Nuevo Empleado"}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5">Completa los campos marcados con *.</DialogDescription>
                  </div>
                </div>
              </div>
            </div>
            {/* Contenido con scroll */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
              <EmployeeForm
              initialData={editingEmployee}
              onSave={(data) => {
                if (editingEmployee) {
                  setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...data } : e)));
                  alertConfig.toastSuccess({ title: "Empleado actualizado", text: `${data.name} fue actualizado` });
                } else {
                  const newEmp = { id: String(Date.now()), status: "active", contractStatus: "active", ...data };
                  setEmployees((prev) => [newEmp, ...prev]);
                  alertConfig.toastSuccess({
                    title: "Empleado registrado",
                    text: `${data.name} ha sido agregado al sistema`,
                  });
                }
                setIsDialogOpen(false);
                setEditingEmployee(null);
              }}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingEmployee(null);
              }}
            />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {employees.filter((e) => e.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contratos por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {employees.filter((e) => e.contractEndDate && getDaysUntilExpiry(e.contractEndDate) <= 30).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nómina Total Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${employees.reduce((sum, e) => sum + e.weeklySalary, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>Gestiona y visualiza el personal</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Salario Semanal</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const daysUntilExpiry = employee.contractEndDate
                    ? getDaysUntilExpiry(employee.contractEndDate)
                    : null;
                  const contractAlert = daysUntilExpiry !== null && daysUntilExpiry <= 30;

                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-mono font-semibold">{employee.employeeNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="font-semibold">${employee.weeklySalary.toLocaleString()}</TableCell>
                      <TableCell>
                        {contractAlert ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive font-medium">{daysUntilExpiry} días</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Vigente</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={employee.status === "active"}
                            onCheckedChange={() => toggleEmployeeStatus(employee.id)}
                          />
                          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                            {employee.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeForm({ onClose, onSave, initialData }) {
  
  const [formData, setFormData] = useState({
    employeeNumber: initialData?.employeeNumber || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "employee",
    position: initialData?.position || "",
    department: initialData?.department || "",
    schedule: initialData?.schedule || "09:00",
    weeklySalary: initialData?.weeklySalary?.toString?.() || "",
    vacationDaysAvailable: initialData?.vacationDaysAvailable?.toString?.() || "12",
    contractStartDate: initialData?.contractStartDate || "",
    contractEndDate: initialData?.contractEndDate || "",
  });

  const nameField = useFieldValidation(
    formData.name || "",
    makeRules(
      rulesLib.required("El nombre es obligatorio"),
      rulesLib.startsWithUpper("El nombre debe de empezar con mayúscula"),
      rulesLib.onlyLettersAndSpaces("El nombre debe ser solamente letras")
    )
  );
  const emailField = useFieldValidation(
    formData.email || "",
    makeRules(
      rulesLib.required("El correo es obligatorio"),
      rulesLib.email("Correo electrónico inválido"),
      rulesLib.emailDomain(["utez.edu.mx", "cona.com"], "Solo dominios @utez.edu.mx o @cona.com")
    )
  );
  const salaryField = useFieldValidation(
    formData.weeklySalary || "",
    makeRules(rulesLib.required("Requerido"), rulesLib.positiveNumber("Debe ser un número positivo"))
  );
  const empNumberValid = String(formData.employeeNumber || "").trim().length > 0;
  const positionValid = String(formData.position || "").trim().length > 0;
  const departmentValid = String(formData.department || "").trim().length > 0;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !nameField.isValid ||
      !emailField.isValid ||
      !salaryField.isValid ||
      !empNumberValid ||
      !positionValid ||
      !departmentValid ||
      !formData.contractStartDate
    ) {
      alertConfig.toastError({ title: "Faltan datos", text: "Revisa los campos con error" });
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 900));
      const payload = {
        employeeNumber: formData.employeeNumber,
        name: nameField.value,
        email: emailField.value,
        role: formData.role,
        position: formData.position,
        department: formData.department,
        schedule: formData.schedule,
        weeklySalary: Number(salaryField.value),
        vacationDaysAvailable: Number(formData.vacationDaysAvailable || 0),
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
      };
      onSave?.(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Número de Empleado *" htmlFor="employeeNumber">
          <Input
            id="employeeNumber"
            placeholder="E001"
            value={formData.employeeNumber}
            onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value.toUpperCase() })}
            disabled={submitting}
          />
        </Field>
        <Field label="Nombre Completo *" htmlFor="name" error={nameField.error} showError={nameField.showError}>
          <Input
            id="name"
            placeholder="Juan Pérez"
            value={nameField.value}
            onChange={nameField.onChange}
            onBlur={nameField.onBlur}
            aria-invalid={nameField.showError && !!nameField.error}
            disabled={submitting}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Correo Electrónico *" htmlFor="email" error={emailField.error} showError={emailField.showError}>
          <Input
            id="email"
            type="email"
            placeholder="usuario@utez.edu.mx"
            value={emailField.value}
            onChange={emailField.onChange}
            onBlur={emailField.onBlur}
            aria-invalid={emailField.showError && !!emailField.error}
            disabled={submitting}
          />
        </Field>
        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Empleado</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Puesto *</Label>
          <Input
            id="position"
            placeholder="Operador"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Departamento *</Label>
          <Input
            id="department"
            placeholder="Producción"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule">Horario de Entrada</Label>
          <TimePicker
            id="schedule"
            value={formData.schedule}
            onChange={(v) => setFormData({ ...formData, schedule: v })}
            disabled={submitting}
          />
        </div>
        <Field
          label="Salario Semanal (MXN) *"
          htmlFor="weeklySalary"
          error={salaryField.error}
          showError={salaryField.showError}
        >
          <Input
            id="weeklySalary"
            type="number"
            placeholder="5000"
            value={salaryField.value}
            onChange={salaryField.onChange}
            onBlur={salaryField.onBlur}
            aria-invalid={salaryField.showError && !!salaryField.error}
            disabled={submitting}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vacationDays">Días de Vacaciones Disponibles</Label>
          <Input
            id="vacationDays"
            type="number"
            value={formData.vacationDaysAvailable}
            onChange={(e) => setFormData({ ...formData, vacationDaysAvailable: e.target.value })}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractStart">Fecha Inicio Contrato *</Label>
          <Calendar
            value={formData.contractStartDate ? new Date(formData.contractStartDate) : null}
            onChange={(d) => setFormData({ ...formData, contractStartDate: d.toISOString().slice(0, 10) })}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractEnd">Fecha Fin Contrato (Opcional)</Label>
        <Calendar
          value={formData.contractEndDate ? new Date(formData.contractEndDate) : null}
          onChange={(d) => setFormData({ ...formData, contractEndDate: d.toISOString().slice(0, 10) })}
          disabled={submitting}
          minDate={formData.contractStartDate ? new Date(formData.contractStartDate) : undefined}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={
            submitting ||
            !nameField.isValid ||
            !emailField.isValid ||
            !salaryField.isValid ||
            !empNumberValid ||
            !positionValid ||
            !departmentValid ||
            !formData.contractStartDate
          }
        >
          {initialData ? "Actualizar Empleado" : submitting ? "Registrando..." : "Registrar Empleado"}
        </Button>
      </div>
    </form>
  );
}

import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {alertConfig} from "@/lib/alert-config";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Switch} from "@/components/ui/switch";
import {Edit, Plus, Eye} from "lucide-react";
import {employeeService} from "./service/employeeService";
import EmployeeForm from "./EmployeeForm";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.list();
            if (response && 'success' in response) {
                if (response.success) {
                    setEmployees(response.data);
                } else {
                    alertConfig.toastError({title: response.message});
                }
            } else {
                setEmployees(response);
            }
        } catch (error) {
            alertConfig.toastError({title: error.message});
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || emp.status.toString().toLowerCase() === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleEmployeeStatus = async (id) => {
        try {
            const response = await employeeService.toggleStatus(id);
            if (response && 'success' in response) {
                if (response.success) {
                    alertConfig.toastSuccess({title: response.message});
                    loadEmployees(); // Recargar lista
                } else {
                    alertConfig.toastError({title: response.message});
                }
            } else {
                alertConfig.toastSuccess({title: "Estado actualizado"});
                loadEmployees();
            }
        } catch (error) {
            alertConfig.toastError({title: error.message});
        }
    };

    const handleSaveEmployee = async (data) => {
        try {
            let response;
            if (editingEmployee) {
                response = await employeeService.update(editingEmployee.id, data);
            } else {
                response = await employeeService.register(data);
            }
            if (response && 'success' in response) {
                if (response.success) {
                    alertConfig.toastSuccess({title: response.message});
                    setIsDialogOpen(false);
                    setEditingEmployee(null);
                    loadEmployees();
                } else {
                    alertConfig.toastError({title: response.message});
                }
            } else {
                alertConfig.toastSuccess({title: editingEmployee ? "Empleado actualizado" : "Empleado registrado"});
                setIsDialogOpen(false);
                setEditingEmployee(null);
                loadEmployees();
            }
        } catch (error) {
            alertConfig.toastError({title: error.message});
        }
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
                            <Plus className="h-4 w-4"/>
                            Nuevo Empleado
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                    <Plus className="h-5 w-5"/>
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">{editingEmployee ? "Editar Empleado" : "Registrar Nuevo Empleado"}</DialogTitle>
                                    <DialogDescription className="mt-0.5">{editingEmployee ? "Modifica la información del empleado." : "Completa los campos marcados con *."}</DialogDescription>
                                </div>
                            </div>
                        </div>
                        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
                            <EmployeeForm
                                onSave={handleSaveEmployee}
                                onClose={() => {
                                    setIsDialogOpen(false);
                                    setEditingEmployee(null);
                                }}
                                editingEmployee={editingEmployee}
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
                            {employees.filter((e) => e.status === 'ACTIVE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                            {employees.filter((e) => e.status === 'INACTIVE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo Completo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {employees.filter((e) => e.contractType === 'FULL_TIME').length}
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
                                    <SelectValue placeholder="Estado"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Cargando empleados...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre Completo</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Puesto</TableHead>
                                        <TableHead>RFC</TableHead>
                                        <TableHead>Pago por Hora</TableHead>
                                        <TableHead>Tipo Contrato</TableHead>
                                        <TableHead>Fecha Inicio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-mono font-semibold">{employee.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{employee.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.position}</TableCell>
                                            <TableCell>{employee.rfc}</TableCell>
                                            <TableCell>${employee.hourlyRate}</TableCell>
                                            <TableCell>
                                                {employee.contractType === 'FULL_TIME' ? 'Tiempo Completo' :
                                                    employee.contractType === 'PART_TIME' ? 'Medio Tiempo' :
                                                        employee.contractType === 'CONTRACTOR' ? 'Contratista' : employee.contractType}
                                            </TableCell>
                                            <TableCell>{employee.contractStartDate}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={employee.status === 'ACTIVE'}
                                                        onCheckedChange={() => toggleEmployeeStatus(employee.id)}
                                                    />
                                                    <Badge
                                                        variant={employee.status === 'ACTIVE' ? "default" : "secondary"}>
                                                        {employee.status === 'ACTIVE' ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await employeeService.getById(employee.id);
                                                                if (response && 'success' in response) {
                                                                    if (response.success) {
                                                                        setEditingEmployee(response.data);
                                                                        setIsDialogOpen(true);
                                                                    } else {
                                                                        alertConfig.toastError({title: response.message});
                                                                    }
                                                                } else {
                                                                    setEditingEmployee(response);
                                                                    setIsDialogOpen(true);
                                                                }
                                                            } catch (error) {
                                                                alertConfig.toastError({title: error.message});
                                                            }
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await employeeService.getById(employee.id);
                                                                if (response && 'success' in response) {
                                                                    if (response.success) {
                                                                        setViewingEmployee(response.data);
                                                                        setIsDetailsDialogOpen(true);
                                                                    } else {
                                                                        alertConfig.toastError({title: response.message});
                                                                    }
                                                                } else {
                                                                    setViewingEmployee(response);
                                                                    setIsDetailsDialogOpen(true);
                                                                }
                                                            } catch (error) {
                                                                alertConfig.toastError({title: error.message});
                                                            }
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
            >
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary/15 via-secondary/5 to-transparent border-b px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shadow-sm">
                                <Eye className="h-5 w-5"/>
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Detalles del Empleado</DialogTitle>
                                <DialogDescription className="mt-0.5">Información detallada del empleado seleccionado.</DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        {viewingEmployee && (
                            <div>
                                <p className="text-sm text-muted-foreground">ID: {viewingEmployee.id}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm font-medium">Nombre Completo</p>
                                        <p className="text-lg">{viewingEmployee.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-lg">{viewingEmployee.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Teléfono</p>
                                        <p className="text-lg">{viewingEmployee.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Puesto</p>
                                        <p className="text-lg">{viewingEmployee.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">RFC</p>
                                        <p className="text-lg">{viewingEmployee.rfc}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Pago por Hora</p>
                                        <p className="text-lg">${viewingEmployee.hourlyRate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Tipo Contrato</p>
                                        <p className="text-lg">
                                            {viewingEmployee.contractType === 'FULL_TIME' ? 'Tiempo Completo' :
                                                viewingEmployee.contractType === 'PART_TIME' ? 'Medio Tiempo' :
                                                    viewingEmployee.contractType === 'CONTRACTOR' ? 'Contratista' : viewingEmployee.contractType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Fecha Inicio</p>
                                        <p className="text-lg">{viewingEmployee.contractStartDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Fecha Fin</p>
                                        <p className="text-lg">{viewingEmployee.contractEndDate || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Horario de Trabajo</p>
                                        <p className="text-lg">{viewingEmployee.workSchedule}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Cuenta Bancaria</p>
                                        <p className="text-lg">{viewingEmployee.bankAccount || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Nombre del Banco</p>
                                        <p className="text-lg">{viewingEmployee.bankName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">CLABE</p>
                                        <p className="text-lg">{viewingEmployee.clabe || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Estado</p>
                                        <p className="text-lg">
                                            <Badge variant={viewingEmployee.status === 'ACTIVE' ? "default" : "secondary"}>
                                                {viewingEmployee.status === 'ACTIVE' ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

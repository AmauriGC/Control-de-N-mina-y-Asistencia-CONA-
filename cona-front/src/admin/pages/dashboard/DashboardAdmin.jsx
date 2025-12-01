import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, DollarSign, AlertTriangle, FileText, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { useEffect, useState } from "react";
import { dashboardService } from "./service/dashboardService";


// fallback data in case API returns nothing (kept similar to previous look)
const FALLBACK_ATTENDANCE = [
    { day: "Lun", present: 45, late: 5, absent: 2 },
    { day: "Mar", present: 47, late: 3, absent: 2 },
    { day: "Mié", present: 46, late: 4, absent: 2 },
    { day: "Jue", present: 48, late: 2, absent: 2 },
    { day: "Vie", present: 44, late: 6, absent: 2 },
];

const FALLBACK_OVERTIME = [
    { week: "Sem 1", hours: 24 },
    { week: "Sem 2", hours: 32 },
    { week: "Sem 3", hours: 28 },
    { week: "Sem 4", hours: 36 },
];

/*const pendingJustifications = [
  { id: "1", employee: "María Empleada", date: "2024-01-15", daysLeft: 1 },
  { id: "2", employee: "Juan Pérez", date: "2024-01-16", daysLeft: 0 },
  { id: "3", employee: "Ana García", date: "2024-01-14", daysLeft: 2 },
];

const contractAlerts = [
  { id: "1", employee: "Carlos Martínez", endDate: "2024-02-15", daysLeft: 15, priority: "high" },
  { id: "2", employee: "Laura Rodríguez", endDate: "2024-02-28", daysLeft: 28, priority: "medium" },
];*/
export default function DashboardAdmin() {
  const { user } = useAuth();

  const [todayCounts, setTodayCounts] = useState({ presentCount: 0, activeEmployeesCount: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  const [pendingJustifications, setJustifications] = useState([]);
  const [contractAlerts, setContracts] = useState([]);

  const [attendanceData, setAttendanceData] = useState(FALLBACK_ATTENDANCE);
  const [overtimeData, setOvertimeData] = useState(FALLBACK_OVERTIME);

  // --- Cargar datos de hoy ---
  useEffect(() => {
  const loadTodayCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await dashboardService.getTodayCounts();
      const data = res?.data ?? res;

      if (data) {
        setTodayCounts({
          presentCount: data.presentToday ?? 0,
          activeEmployeesCount: data.activeEmployees ?? 0
        });
      } else {
        setTodayCounts({ presentCount: 0, activeEmployeesCount: 0 });
      }
    } catch (error) {
      console.error("Error fetching today counts:", error);
      setTodayCounts({ presentCount: 0, activeEmployeesCount: 0 });
    } finally {
      setLoadingCounts(false);
    }
  };

  loadTodayCounts();
}, []);

  // --- Cargar resto de datos del dashboard ---
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Justificaciones pendientes
        const pendingRes = await dashboardService.getPendingJustifications();
        const pendingList = pendingRes?.data ?? pendingRes ?? [];
        setJustifications(Array.isArray(pendingList) ? pendingList : []);

        // Contratos por vencer
        const contractsRes = await dashboardService.getContractAlerts();
        const contractsList = contractsRes?.data ?? contractsRes ?? [];
        setContracts(Array.isArray(contractsList) ? contractsList : []);

        // Asistencia semanal
        const weeklyRes = await dashboardService.getWeeklyAttendance();
        const weeklyList = Array.isArray(weeklyRes) ? weeklyRes : weeklyRes?.data ?? FALLBACK_ATTENDANCE;
        setAttendanceData(weeklyList);

        // Horas extra mensuales
        const overtimeRes = await dashboardService.getMonthlyOvertime();
        const overtimeList = Array.isArray(overtimeRes) ? overtimeRes : overtimeRes?.data ?? FALLBACK_OVERTIME;
        setOvertimeData(overtimeList);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setAttendanceData(FALLBACK_ATTENDANCE);
        setOvertimeData(FALLBACK_OVERTIME);
        setJustifications([]);
        setContracts([]);
      }
    };

    loadDashboardData();
  }, []);


  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent> 
            <div className="text-3xl font-bold">
              {loadingCounts ? '-' : `${todayCounts.activeEmployeesCount}`}
              </div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loadingCounts ? '-' : `${todayCounts.presentCount}/${todayCounts.activeEmployeesCount}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingCounts || todayCounts.activeEmployeesCount === 0
                ? '—'
                : `${((todayCounts.presentCount / todayCounts.activeEmployeesCount) * 100).toFixed(1)}% de asistencia`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nómina Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$285,400</div>
            <p className="text-xs text-muted-foreground mt-1">MXN para 52 empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
4            </div>
            <p className="text-xs text-muted-foreground mt-1">3 justificaciones, 2 contratos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Justificaciones Pendientes</CardTitle>
                <CardDescription>Requieren revisión urgente</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingJustifications.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.employee}</p>
                  <p className="text-sm text-muted-foreground">Falta del {item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.daysLeft === 0 ? "destructive" : "secondary"}>
                    {item.daysLeft === 0 ? "Último día" : `${item.daysLeft} días`}
                  </Badge>
                  <Link to="/dashboard/justifications/admin">
                    <Button size="sm">Revisar</Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link to="/dashboard/justifications/admin">
              <Button variant="outline" className="w-full">
                Ver todas las justificaciones
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contratos por Vencer</CardTitle>
                <CardDescription>Atención requerida</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.employee}</p>
                  <p className="text-sm text-muted-foreground">Vence el {item.endDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>{item.daysLeft} días</Badge>
                  <Link to="/dashboard/employees">
                    <Button size="sm">Ver</Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link to="/dashboard/employees">
              <Button variant="outline" className="w-full">
                Ver todos los empleados
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
            <CardDescription>Comparación de asistencia, retardos y faltas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="rgb(112, 148, 134)" name="Presentes" />
                <Bar dataKey="late" fill="rgb(175, 194, 195)" name="Retardos" />
                <Bar dataKey="absent" fill="rgb(220, 38, 38)" name="Faltas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas Extra Mensuales</CardTitle>
            <CardDescription>Tendencia de horas extra por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="rgb(112, 148, 134)" strokeWidth={2} name="Horas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

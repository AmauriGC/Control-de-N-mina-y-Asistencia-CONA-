import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Users, FileText, Calendar, Settings, LogOut, ClipboardList, Menu, Lock } from "lucide-react";
import logo from "@/assets/CONA.png";
import { alertConfig } from "@/lib/alert-config";

function NavContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const ok = await alertConfig.confirm({
      title: "Cerrar sesión",
      text: "¿Seguro que deseas salir?",
      confirmText: "Cerrar",
      cancelText: "Cancelar",
    });
    if (ok) {
      logout();
      navigate("/login");
    }
  };

  const navItems =
    user?.role === "admin"
      ? [
          { href: "/dashboard/admin", label: "Dashboard", icon: Clock },
          { href: "/dashboard/employees", label: "Empleados", icon: Users },
          { href: "/dashboard/justifications/admin", label: "Justificaciones", icon: FileText },
          { href: "/dashboard/vacations/admin", label: "Vacaciones", icon: Calendar },
          { href: "/dashboard/config", label: "Configuración", icon: Settings },
          { href: "/dashboard/change-password", label: "Cambiar contraseña", icon: Lock },
        ]
      : [
          { href: "/dashboard/employee", label: "Dashboard", icon: Clock },
          { href: "/dashboard/attendance", label: "Mi Asistencia", icon: ClipboardList },
          { href: "/dashboard/justifications/employee", label: "Justificaciones", icon: FileText },
          { href: "/dashboard/vacations/employee", label: "Vacaciones", icon: Calendar },
          { href: "/dashboard/change-password", label: "Cambiar contraseña", icon: Lock },
        ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden ring-1 ring-border bg-card flex items-center justify-center">
            <img src={logo} alt="CONA" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Sistema RH</h2>
            <p className="text-xs text-muted-foreground">Nómina & Asistencia</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href} onClick={onNavigate}>
              <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border">
        <NavContent />
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-background">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 bg-background border-b border-border px-3 py-2 flex items-center justify-between">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-80">
              <DialogHeader className="px-6 pt-6 pb-3">
                <DialogTitle>Menú</DialogTitle>
              </DialogHeader>
              <div className="h-[75vh] overflow-y-auto">
                <NavContent onNavigate={() => setOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
          <span className="text-sm font-medium flex items-center gap-2">
            <img src={logo} alt="CONA" className="w-5 h-5 object-contain rounded-sm ring-1 ring-border" />
            Sistema RH
          </span>
          <span className="w-9" />
        </div>
        <Outlet />
      </main>
    </div>
  );
}

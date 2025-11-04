import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, BarChart2, LogOut } from "lucide-react";

export default function Sidebar() {
  const { role, logout } = useAuth();

  const items =
    role === "ADMIN"
      ? [{ to: "/admin", label: "Dashboard", icon: <BarChart2 className="w-5 h-5" /> }]
      : [{ to: "/employee", label: "Inicio", icon: <Home className="w-5 h-5" /> }];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">CONA</h1>
        <p className="text-xs text-slate-500">{role === "ADMIN" ? "Administrador" : "Empleado"}</p>
      </div>
      <nav className="space-y-1">
        {items.map(({ to, label, icon, disabled }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700 hover:bg-slate-50"
              }`
            }
            onClick={(e) => disabled && e.preventDefault()}
          >
            <span className="w-5 text-center">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 border-t pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50"
        >
          <span className="w-5 text-center"><LogOut className="w-5 h-5" /></span>
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}

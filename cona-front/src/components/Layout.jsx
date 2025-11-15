import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Clock, Users, FileText, Settings, Calendar } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
          <div className="mb-6 text-lg font-semibold">Cona</div>
          <nav className="space-y-2">
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/dashboard"
            >
              <Home size={16} /> Dashboard
            </Link>
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/clock-in"
            >
              <Clock size={16} /> Clock-in
            </Link>
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/attendance"
            >
              <FileText size={16} /> Attendance
            </Link>
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/employees"
            >
              <Users size={16} /> Employees
            </Link>
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/justifications"
            >
              <FileText size={16} /> Justifications
            </Link>
            <Link
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              to="/vacations"
            >
              <Calendar size={16} /> Vacations
            </Link>
            <Link className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" to="/config">
              <Settings size={16} /> Config
            </Link>
          </nav>
          <div className="mt-6">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

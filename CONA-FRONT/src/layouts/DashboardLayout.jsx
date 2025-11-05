import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex w-screen h-screen">
      <Sidebar />
      <main className="flex flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}

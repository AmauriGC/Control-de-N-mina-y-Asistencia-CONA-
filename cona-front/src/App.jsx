import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@/auth/context/AuthContext";
import Login from "@/auth/pages/Login";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";
import ChangePasswordProfile from "@/auth/pages/ChangePasswordProfile";
import DashboardLayout from "@/auth/pages/DashboardLayout";
import {ProtectedRoute} from "@/auth/components/ProtectedRoute";
import DashboardIndex from "@/auth/pages/DashboardIndex";

import DashboardAdmin from "@/admin/pages/dashboard/DashboardAdmin";
import DashboardEmployee from "@/employee/pages/DashboardEmployee";
import Employees from "@/admin/pages/employees/Employees";
import JustificationsAdmin from "@/admin/pages/justification/JustificationsAdmin";
import VacationsAdmin from "@/admin/pages/vacation/VacationsAdmin";
import Config from "@/admin/pages/config/Config";

import VacationsEmployee from "@/employee/pages/VacationsEmployee";
import JustificationsEmployee from "@/employee/pages/JustificationsEmployee";
import Attendance from "@/employee/pages/Attendance";
import AttendanceTerminal from "@/pages/AttendanceTerminal";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/attendance-terminal" element={<AttendanceTerminal/>}/>
                    {/* Alias en español */}
                    <Route path="/terminal-asistencia" element={<AttendanceTerminal/>}/>

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout/>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardIndex/>}/>
                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <DashboardAdmin/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="employee"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <DashboardEmployee/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="employees"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Employees/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="justifications/admin"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <JustificationsAdmin/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="justifications/employee"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <JustificationsEmployee/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="vacations/admin"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <VacationsAdmin/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="vacations/employee"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <VacationsEmployee/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="attendance"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <Attendance/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="config"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Config/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="change-password"
                            element={
                                <ProtectedRoute>
                                    <ChangePasswordProfile/>
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

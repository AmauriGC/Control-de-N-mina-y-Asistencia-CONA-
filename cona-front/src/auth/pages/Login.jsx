"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/context/AuthContext";
import { alertConfig } from "@/lib/alert-config";
import { tokenManager } from "@/auth/utils/tokenManager";
import { Clock } from "lucide-react";
import logo from "@/assets/CONA.png";
import { useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";

export default function LoginPage() {
  const emailField = useFieldValidation(
    "",
    makeRules(
      rulesLib.required("Correo requerido"),
      rulesLib.emailDomain(["utez.edu.mx", "cona.com"], "Solo @utez.edu.mx o @cona.com")
    )
  );
  const passwordField = useFieldValidation("", makeRules(rulesLib.required("Contraseña requerida")));
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user?.role;
      navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/employee", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailField.isValid || !passwordField.isValid) {
      await alertConfig.toastError({ title: "Campos inválidos", text: "Revisa los campos con error" });
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(emailField.value, passwordField.value);
      if (success) {
        await alertConfig.toastSuccess({ title: "Bienvenido", text: "Inicio de sesión exitoso" });
        const currentRole = tokenManager.getUser()?.role || user?.role;
        navigate(currentRole === "admin" ? "/dashboard/admin" : "/dashboard/employee", { replace: true });
      } else {
        await alertConfig.toastError({ title: "Error", text: "Credenciales incorrectas" });
      }
    } catch (error) {
      await alertConfig.toastError({ title: "Error", text: "Ocurrió un error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-border bg-card">
            <img src={logo} alt="CONA" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Sistema de Nómina</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={emailField.value}
                onChange={emailField.onChange}
                onBlur={emailField.onBlur}
                disabled={isLoading}
                aria-invalid={emailField.showError && !!emailField.error}
              />
              {emailField.showError && emailField.error && (
                <p className="text-[12px] text-destructive">{emailField.error}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                value={passwordField.value}
                onChange={passwordField.onChange}
                onBlur={passwordField.onBlur}
                disabled={isLoading}
                aria-invalid={passwordField.showError && !!passwordField.error}
              />
              {passwordField.showError && passwordField.error && (
                <p className="text-[12px] text-destructive">{passwordField.error}</p>
              )}
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !emailField.isValid || !passwordField.isValid}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
          <div className="mt-6 space-y-3 text-xs text-muted-foreground">
            <p className="font-semibold">Cuentas de prueba:</p>
            <p>Admin: admin@cona.com / ConaAdmin1</p>
            <p>Empleado: empleado@cona.com / ConaEmple1</p>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  emailField.onChange("admin@cona.com");
                  passwordField.onChange("ConaAdmin1");
                }}
              >
                Autocompletar Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  emailField.onChange("empleado@cona.com");
                  passwordField.onChange("ConaEmple1");
                }}
              >
                Autocompletar Empleado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

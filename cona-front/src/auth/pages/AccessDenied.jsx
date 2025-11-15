import { useAuth } from "@/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roleHome = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/employee";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Acceso Denegado</CardTitle>
          <CardDescription>No tienes permisos para ver esta sección.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tu rol actual (<span className="font-semibold">{user?.role}</span>) no está autorizado para acceder a este
            recurso.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button onClick={() => navigate(roleHome)}>Ir a mi Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

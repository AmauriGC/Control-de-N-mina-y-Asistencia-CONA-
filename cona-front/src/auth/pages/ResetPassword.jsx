import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";
import { CriteriaList } from "@/components/criteria/CriteriaList";
import { passwordCriteria } from "@/components/criteria/criteria";
import logo from "@/assets/CONA.png";

export default function ResetPassword() {
  const newPasswordField = useFieldValidation("", makeRules(rulesLib.required("Nueva contraseña requerida")));
  const confirmField = useFieldValidation(
    "",
    makeRules({ test: (v) => v === newPasswordField.value, message: "Las contraseñas no coinciden" })
  );
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordOk = passwordCriteria.every((c) => c.test(newPasswordField.value)) && newPasswordField.value.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPasswordField.isValid || !confirmField.isValid) return;
    setLoading(true);
    setTimeout(() => {
      setDone(true);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="space-y-4 text-center relative">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-border bg-card">
            <img src={logo} alt="CONA" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
            <CardDescription>
              {done ? "La contraseña se ha restablecido (simulado)." : "Ingresa y confirma tu nueva contraseña."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4 text-sm">
              <p>Tu contraseña fue actualizada correctamente (solo UI). Ahora puedes iniciar sesión con ella.</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDone(false);
                    newPasswordField.reset();
                    confirmField.reset();
                  }}
                >
                  Otra vez
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/login")}>
                  Volver al inicio
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••••"
                  value={newPasswordField.value}
                  onChange={newPasswordField.onChange}
                  onBlur={newPasswordField.onBlur}
                  aria-invalid={newPasswordField.showError && !!newPasswordField.error}
                  disabled={loading}
                />
                {newPasswordField.touched && (
                  <CriteriaList
                    value={newPasswordField.value}
                    criteria={passwordCriteria}
                    successLabel="Contraseña válida"
                    className="mt-1"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••"
                  value={confirmField.value}
                  onChange={confirmField.onChange}
                  onBlur={confirmField.onBlur}
                  aria-invalid={confirmField.showError && !!confirmField.error}
                  disabled={loading}
                />
                {confirmField.showError && confirmField.error && (
                  <p className="text-[12px] text-destructive">{confirmField.error}</p>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading || !passwordOk || !confirmField.isValid}
                >
                  Guardar nueva contraseña
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={() => navigate("/login")}
                >
                  Volver al inicio
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

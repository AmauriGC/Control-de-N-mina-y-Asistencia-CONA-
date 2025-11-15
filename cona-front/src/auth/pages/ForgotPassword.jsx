import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFieldValidation, makeRules, rulesLib } from "@/components/criteria/use-validation";
import logo from "@/assets/CONA.png";

export default function ForgotPassword() {
  const emailField = useFieldValidation(
    "",
    makeRules(
      rulesLib.required("Correo requerido"),
      rulesLib.emailDomain(["cona.com", "utez.edu.mx"], "Solo dominios @cona.com o @utez.edu.mx")
    )
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailField.isValid) return;
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center relative">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-border bg-card">
            <img src={logo} alt="CONA" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
            <CardDescription>
              {sent
                ? "Revisa tu correo para continuar con la recuperación."
                : "Ingresa tu correo y te enviaremos instrucciones."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-sm">
              <p>
                Hemos enviado (simulado) un correo a <span className="font-medium">{emailField.value}</span> con un
                enlace para restablecer tu contraseña.
              </p>
              <p>Si no lo encuentras, revisa la bandeja de spam o vuelve a intentar más tarde.</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    emailField.reset();
                  }}
                  className="w-full"
                >
                  Enviar otro correo
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/login")}>
                  Volver al inicio
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@cona.com"
                  value={emailField.value}
                  onChange={emailField.onChange}
                  onBlur={emailField.onBlur}
                  aria-invalid={emailField.showError && !!emailField.error}
                  disabled={loading}
                />
                {emailField.showError && emailField.error && (
                  <p className="text-[12px] text-destructive">{emailField.error}</p>
                )}
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" loading={loading} disabled={!emailField.isValid || loading}>
                  Enviar instrucciones
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

import {useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {authService} from "@/auth/services/authService";
import {alertConfig} from "@/lib/alert-config";
import Logo from "@/components/Logo";
import {makeRules, rulesLib, useFieldValidation} from "@/components/criteria/use-validation";

export default function ForgotPasswordPage() {
    const emailField = useFieldValidation("", makeRules(
        rulesLib.required("El correo electrónico es obligatorio"),
        rulesLib.email(),
        rulesLib.emailDomain(["utez.edu.mx", "cona.com"], "Solo correos @utez.edu.mx o @cona.com permitidos")
    ));
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailField.isValid) {
            await alertConfig.toastError({title: "Campo inválido", text: "Revisa el campo con error"});
            return;
        }

        setIsLoading(true);
        try {
            const result = await authService.forgotPassword(emailField.value);
            if (result.success) {
                await alertConfig.toastSuccess({
                    title: "Enlace enviado",
                    text: "Si el correo existe, se envió un enlace de recuperación"
                });
            } else {
                await alertConfig.toastError({
                    title: "Error",
                    text: result.message || "Error al enviar solicitud"
                });
            }
        } catch {
            await alertConfig.toastError({
                title: "Error",
                text: "Ocurrió un error al enviar la solicitud"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <Logo/>
                    <div>
                        <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
                        <CardDescription>Ingresa tu correo electrónico para recibir un enlace de
                            recuperación</CardDescription>
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
                                aria-invalid={emailField.showError}
                            />
                            {emailField.showError && (
                                <p className="text-[12px] text-destructive">{emailField.error}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !emailField.isValid}>
                            {isLoading ? "Enviando..." : "Enviar enlace"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

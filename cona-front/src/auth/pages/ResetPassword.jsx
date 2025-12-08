import {useEffect, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {authService} from "@/auth/services/authService";
import {alertConfig} from "@/lib/alert-config";
import Logo from "@/components/Logo";
import {makeRules, passwordValidationRules, rulesLib, useFieldValidation} from "@/components/criteria/use-validation";
import {VALIDATION_MESSAGES} from "@/components/criteria/validations";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const newPasswordField = useFieldValidation("", makeRules(rulesLib.required("La nueva contraseña es obligatoria"), ...passwordValidationRules));
    const confirmPasswordField = useFieldValidation("", makeRules(
        rulesLib.required("La confirmación de contraseña es obligatoria"),
        rulesLib.matchValue(newPasswordField.value, VALIDATION_MESSAGES.PASSWORD_CONFIRM_MISMATCH)
      ));

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            alertConfig.toastError({title: "Error", text: "Token no proporcionado"});
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPasswordField.isValid || !confirmPasswordField.isValid) {
            await alertConfig.toastError({title: "Campos inválidos", text: "Revisa los campos con error"});
            return;
        }
        if (newPasswordField.value !== confirmPasswordField.value) {
            await alertConfig.toastError({title: "Error", text: VALIDATION_MESSAGES.PASSWORD_CONFIRM_MISMATCH});
            return;
        }
        setIsLoading(true);
        try {
            const result = await authService.resetPassword(token, newPasswordField.value, confirmPasswordField.value);
            if (result.success) {
                await alertConfig.toastSuccess({
                    title: "Contraseña restablecida",
                    text: result.message
                });
                navigate("/login");
            } else {
                await alertConfig.toastError({
                    title: "Error",
                    text: result.message || "Error al restablecer contraseña"
                });
            }
        } catch(error) {
            await alertConfig.toastError({
                title: "Error",
                text: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <Logo/>
                    <div>
                        <CardTitle className="text-2xl font-bold">Restablecer Contraseña</CardTitle>
                        <CardDescription>Ingresa tu nueva contraseña</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
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
                                disabled={isLoading}
                                aria-invalid={newPasswordField.showError}
                            />
                            {newPasswordField.showError && (
                                <p className="text-[12px] text-destructive">{newPasswordField.error}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••••"
                                value={confirmPasswordField.value}
                                onChange={confirmPasswordField.onChange}
                                onBlur={confirmPasswordField.onBlur}
                                disabled={isLoading}
                                aria-invalid={confirmPasswordField.showError}
                            />
                            {confirmPasswordField.showError && (
                                <p className="text-[12px] text-destructive">{confirmPasswordField.error}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading || !newPasswordField.isValid || !confirmPasswordField.isValid}>
                            {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
                        </Button>

                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

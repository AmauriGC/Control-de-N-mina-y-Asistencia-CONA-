import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useAuth} from "@/auth/context/AuthContext";
import {authService} from "@/auth/services/authService";
import {alertConfig} from "@/lib/alert-config";
import Logo from "@/components/Logo";
import {makeRules, passwordValidationRules, rulesLib, useFieldValidation} from "@/components/criteria/use-validation";
import {VALIDATION_MESSAGES} from "@/components/criteria/validations";

export default function ChangePasswordPage() {
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    const currentPasswordField = useFieldValidation("", makeRules(rulesLib.required("La contraseña actual es obligatoria")));
    const newPasswordField = useFieldValidation("", makeRules(rulesLib.required("La nueva contraseña es obligatoria"), ...passwordValidationRules));
    const confirmPasswordField = useFieldValidation("", makeRules(rulesLib.required("La confirmación de contraseña es obligatoria")));

    const [isLoading, setIsLoading] = useState(false);

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentPasswordField.isValid || !newPasswordField.isValid || !confirmPasswordField.isValid) {
            await alertConfig.toastError({title: "Campos inválidos", text: "Revisa los campos con error"});
            return;
        }
        if (newPasswordField.value !== confirmPasswordField.value) {
            await alertConfig.toastError({title: "Error", text: VALIDATION_MESSAGES.PASSWORD_CONFIRM_MISMATCH});
            return;
        }
        setIsLoading(true);
        try {
            const result = await authService.changePassword(
                currentPasswordField.value,
                newPasswordField.value,
                confirmPasswordField.value
            );
            if (result.success) {
                await alertConfig.toastSuccess({
                    title: "Contraseña cambiada",
                    text: "Tu contraseña ha sido actualizada exitosamente"
                });
                await logout(); // Opcional: forzar logout para re-login
                navigate("/login");
            } else {
                await alertConfig.toastError({
                    title: "Error",
                    text: result.message || "Error al cambiar contraseña"
                });
            }
        } catch (error) {
            await alertConfig.toastError({
                title: "Error",
                text: error.message
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
                        <CardTitle className="text-2xl font-bold">Cambiar Contraseña</CardTitle>
                        <CardDescription>Ingresa tu contraseña actual y la nueva</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña actual</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="••••••••••"
                                value={currentPasswordField.value}
                                onChange={currentPasswordField.onChange}
                                onBlur={currentPasswordField.onBlur}
                                disabled={isLoading}
                                aria-invalid={currentPasswordField.showError}
                            />
                            {currentPasswordField.showError && (
                                <p className="text-[12px] text-destructive">{currentPasswordField.error}</p>
                            )}
                        </div>
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
                            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

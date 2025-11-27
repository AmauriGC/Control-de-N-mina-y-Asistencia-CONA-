"use client";

import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useAuth} from "@/auth/context/AuthContext";
import {alertConfig} from "@/lib/alert-config";
import {tokenManager} from "@/auth/utils/tokenManager";
import Logo from "@/components/Logo";
import {makeRules, rulesLib, useFieldValidation} from "@/components/criteria/use-validation";
import {auth, provider, signInWithRedirect, signInWithPopup, getRedirectResult} from "@/firebaseConfig";

export default function LoginPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setFirebaseUser(user);
        });
        return unsubscribe;
    }, []);

    const {loginWithGoogle} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (firebaseUser) {
            (async () => {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    const backendResult = await loginWithGoogle(idToken);
                    if (backendResult.success) {
                        navigate(backendResult.user.role === "admin" ? "/dashboard/admin" : "/dashboard/employee", {replace: true});
                    } else {
                        console.error("Error en login backend:", backendResult.message);
                        alertConfig.toastError({title: "Error", text: backendResult.message || "Error al iniciar sesión con Google"});
                    }
                } catch (error) {
                    console.error("Error obteniendo idToken:", error);
                }
            })();
        }
    }, [firebaseUser, loginWithGoogle, navigate]);

    const getInitials = () => {
        if (!firebaseUser || !firebaseUser.displayName) return "";
        return firebaseUser.displayName.charAt(0).toUpperCase();
    }

    const emailField = useFieldValidation(
        "",
        makeRules(
            rulesLib.required("El correo electrónico es obligatorio"),
            rulesLib.emailDomain(["utez.edu.mx", "cona.com", "gmail.com"], "Solo correos @utez.edu.mx, @cona.com o @gmail.com permitidos")
        )
    );
    const passwordField = useFieldValidation("", makeRules(rulesLib.required("La contraseña es obligatoria")));
    const [isLoading, setIsLoading] = useState(false);
    const {login, isAuthenticated, user} = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user?.role;
            navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/employee", {replace: true});
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailField.isValid || !passwordField.isValid) {
            await alertConfig.toastError({title: "Campos inválidos", text: "Revisa los campos con error"});
            return;
        }
        setIsLoading(true);
        try {
            const result = await login(emailField.value, passwordField.value);
            if (result.success) {
                await alertConfig.toastSuccess({title: "Bienvenido", text: "Inicio de sesión exitoso"});
                const currentRole = tokenManager.getUser()?.role || user?.role;
                navigate(currentRole === "admin" ? "/dashboard/admin" : "/dashboard/employee", {replace: true});
            } else {
                await alertConfig.toastError({title: "Error", text: result.message || "Credenciales incorrectas"});
            }
        } catch {
            await alertConfig.toastError({title: "Error", text: "Ocurrió un error al iniciar sesión"});
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogleHandler = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setFirebaseUser(result.user);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    }

    if (isAuthenticated) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <Logo/>
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
                                <Link to="/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste
                                    tu contraseña?</Link>
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
                        <p>Admin: 20233tn102@utez.edu.mx / Admin123.</p>
                        <p>Empleado: 20233tn092@utez.edu.mx / Empleado123.</p>
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    emailField.onChange("20233tn102@utez.edu.mx");
                                    passwordField.onChange("Admin123.");
                                }}
                            >
                                Autocompletar Admin
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    emailField.onChange("20233tn092@utez.edu.mx");
                                    passwordField.onChange("Empleado123.");
                                }}
                            >
                                Autocompletar Empleado
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={loginWithGoogleHandler}
                        >
                            Iniciar con Google
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

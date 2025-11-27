import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig.js";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const hasSession = authService.isAuthenticated();

        if (hasSession && currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }

        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        const result = await authService.login({ email, password });
        if (result.success && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
            return result;
        }
        return result;
    };

    const loginWithGoogle = async (idToken) => {
        const result = await authService.loginWithGoogle(idToken);
        if (result.success && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
            return result;
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out from Firebase:", error);
        }
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isLoading) return null;

    return (
        <AuthContext.Provider
            value={{ user, login, loginWithGoogle, logout, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import authService from "../auth/service/authService";
import { decodeJwt, isTokenExpired } from "../utils/jwt";

const AuthContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem("cona.auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // 'ADMIN' | 'EMPLOYEE'
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const stored = readStored();
    if (stored?.token && !isTokenExpired(stored.token)) {
      setToken(stored.token);
      setRole(stored.role);
      setEmail(stored.email);
    } else {
      localStorage.removeItem("cona.auth");
    }
  }, []);

  const isAuthenticated = !!token;

  async function login({ email, password }) {
    const res = await authService.login(email, password);
    // Extract token and decode claims for role/email
    const tk = res.data.token;
    const claims = decodeJwt(tk) || {};
    const userRole = claims.role || "EMPLOYEE";
    const userEmail = claims.email || email;

    const payload = {
      token: tk,
      role: userRole,
      email: userEmail,
    };
    localStorage.setItem("cona.auth", JSON.stringify(payload));
    setToken(tk);
    setRole(userRole);
    setEmail(userEmail);

    if (res.message) {
      Swal.fire({ icon: "success", title: "Listo", text: res.message, timer: 1200, showConfirmButton: false });
    }

    return { role: userRole };
  }

  function logout() {
    localStorage.removeItem("cona.auth");
    setToken(null);
    setRole(null);
    setEmail(null);
  }

  const value = useMemo(
    () => ({ token, role, email, isAuthenticated, login, logout }),
    [token, role, email, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CONA from "../assets/img/CONA.png";
import { Mail, Lock } from "lucide-react";
import Input from "../components/input";
import Button from "../components/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { role } = await login({ email, password });
      const to = role === "ADMIN" ? "/admin" : "/employee";
      const from = location.state?.from?.pathname;
      navigate(from || to, { replace: true });
    } catch (err) {
      setError(err?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 md:grid-cols-2">
        {/* Branding / Imagen */}
        <div className="hidden md:flex items-center justify-center p-8">
          <div className="size-72 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
            <img src={CONA} alt="CONA" className="min-h-56 min-w-56 w-full h-full object-contain rounded-full" />
          </div>
        </div>

        {/* Formulario */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-[2rem] font-semibold tracking-tight">Iniciar sesión</h1>
              <p className="mt-1 text-[1.5rem] text-gray-500">Accede a tu cuenta para continuar</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4" aria-label="formulario de inicio de sesión">
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@cona.com"
                icon={Mail}
              />

              <Input
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
              />

              <div className="flex w-full justify-center">
                <Button type="submit" loading={loading} className="w-1/2">
                  Ingresar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

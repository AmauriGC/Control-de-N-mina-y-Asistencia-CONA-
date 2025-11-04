import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { role } = await login({ email, password });
      const to = role === "ADMIN" ? "/admin" : "/employee";
      const from = location.state?.from?.pathname;
      navigate(from || to, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-1">Ingresar</h2>
        <p className="text-sm text-slate-500 mb-6">Usa tus credenciales para continuar</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="admin@cona.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-md py-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Entrar"}
          </button>
        </form>
        <div className="text-xs text-slate-400 mt-4">
          <p>Admin: admin@cona.com / admin123</p>
          <p>Empleado: employee@cona.com / employee123</p>
        </div>
      </div>
    </div>
  );
}

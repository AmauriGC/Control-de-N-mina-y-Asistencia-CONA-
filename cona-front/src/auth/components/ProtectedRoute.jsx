import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "@/auth/pages/AccessDenied";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isRoleAllowed = () => {
    if (!user || !allowedRoles) return true;
    return allowedRoles.map((r) => r.toLowerCase()).includes(user.role);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  if (!isAuthenticated) return null;
  if (!isRoleAllowed()) return <AccessDenied />;
  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type Role = "ADMIN" | "ESTUDANTE";

interface ProtectedRouteProps {
  children: ReactNode;
  allow: Role[];
}

function getRoleFromToken(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  // não logado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken(token);

  // logado mas sem permissão
  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

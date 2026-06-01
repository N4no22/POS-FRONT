import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  // 🔐 no logueado
  if (!user) {
    return <Navigate to="/" />;
  }

  // 🔐 validar rol
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" />; // o una página "no autorizado"
  }

  return children;
}
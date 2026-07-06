import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({
  children,
  roles
}) {
  const { user } = useAuth()

  // Sin sesión
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Página inicial según el rol
  const inicioPorRol =
    user.rol === "admin"
      ? "/dashboard"
      : "/ventas"

  // Sin autorización
  if (
    roles &&
    !roles.includes(user.rol)
  ) {
    return (
      <Navigate
        to={inicioPorRol}
        replace
      />
    )
  }

  return children
}
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:3000/api";

export default function useRefreshToken() {
  const { user, limpiarSesion } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const refresh = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        // Verificar si el token expira en menos de 10 minutos
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn > 10 * 60 * 1000) return; // más de 10 min, no renovar

        const res = await fetch(`${BASE_URL}/usuarios/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          // Token inválido → cerrar sesión
          limpiarSesion?.();
          return;
        }

        const data = await res.json();
        sessionStorage.setItem("token", data.token);
      } catch {
        // silencioso
      }
    };

    // Chequear cada 5 minutos
    intervalRef.current = setInterval(refresh, 5 * 60 * 1000);
    refresh(); // ejecutar inmediatamente

    return () => clearInterval(intervalRef.current);
  }, [user]);
}
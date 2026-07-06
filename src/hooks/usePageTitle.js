import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const titulos = {
  "/dashboard":    "Dashboard — Panel POS",
  "/ventas":       "Ventas — Panel POS",
  "/productos":    "Productos — Panel POS",
  "/clientes":     "Clientes — Panel POS",
  "/proveedores":  "Proveedores — Panel POS",
  "/reportes":     "Reportes de Stock — Panel POS",
  "/reportes-pdf": "Exportar Reportes — Panel POS",
  "/usuarios":     "Usuarios — Panel POS",
  "/":             "Iniciar Sesión — Panel POS",
};

export default function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = titulos[location.pathname] || "Panel POS";
  }, [location.pathname]);
}
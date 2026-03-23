import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import GlobalAlert from "./components/GlobalAlert";

import Login from "./pages/Login";
import Proveedores from "./pages/Proveedores";
import Reportes from "./pages/Reportes";
import Dashboard from "./pages/Dashboard";
import Ventas from "./pages/Ventas";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import DashboardLayout from "./layouts/DashboardLayout";

// Maneja rutas y alerta según el login
function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {/* 🔔 Solo mostrar alertas si el usuario está logueado */}
      {user && <GlobalAlert />}

      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard con sidebar persistente */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/ventas"
          element={
            user ? (
              <DashboardLayout>
                <Ventas />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/productos"
          element={
            user ? (
              <DashboardLayout>
                <Productos />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/clientes"
          element={
            user ? (
              <DashboardLayout>
                <Clientes />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/proveedores"
          element={
            user ? (
              <DashboardLayout>
                <Proveedores />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/reportes"
          element={
            user ? (
              <DashboardLayout>
                <Reportes />
              </DashboardLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
}

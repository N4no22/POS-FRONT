import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import GlobalAlert from "./components/GlobalAlert";
import Usuarios from "./pages/Usuarios";
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
      
      {user && <GlobalAlert />}

      <Routes>
  <Route path="/" element={<Login />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/ventas"
    element={
      <ProtectedRoute roles={["admin", "cajero"]}>
        <DashboardLayout>
          <Ventas />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/productos"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <Productos />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/clientes"
    element={
      <ProtectedRoute roles={["admin", "cajero"]}>
        <DashboardLayout>
          <Clientes />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/proveedores"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <Proveedores />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/reportes"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <Reportes />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/usuarios"
    element={
      <ProtectedRoute roles={["admin"]}>
        <DashboardLayout>
          <Usuarios />
        </DashboardLayout>
      </ProtectedRoute>
    }
  />

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

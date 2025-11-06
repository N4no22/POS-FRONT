import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ventas from "./pages/Ventas";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas dentro del dashboard (con sidebar persistente) */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/ventas"
        element={
          <DashboardLayout>
            <Ventas />
          </DashboardLayout>
        }
      />
      <Route
        path="/productos"
        element={
          <DashboardLayout>
            <Productos />
          </DashboardLayout>
        }
      />
      <Route
        path="/clientes"
        element={
          <DashboardLayout>
            <Clientes />
          </DashboardLayout>
        }
      />

      {/* Si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

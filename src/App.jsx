import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import { ToastProvider } from "./context/ToastContext";
import GlobalAlert from "./components/GlobalAlert";
import LoadingScreen from "./components/LoadingScreen";
import NotFound from "./pages/NotFound";
import usePageTitle from "./hooks/usePageTitle";
import DashboardLayout from "./layouts/DashboardLayout";
import Egresos from "./pages/Egresos";
import HistorialVentas from "./pages/HistorialVentas";
import useRefreshToken from "./hooks/useRefreshToken";


// Lazy loading de páginas
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ventas = lazy(() => import("./pages/Ventas"));
const Productos = lazy(() => import("./pages/Productos"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Proveedores = lazy(() => import("./pages/Proveedores"));
const Reportes = lazy(() => import("./pages/Reportes"));
const ReportesPDF = lazy(() => import("./pages/ReportesPDF"));
const Usuarios = lazy(() => import("./pages/Usuarios"));

// Wrapper con animación de transición
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
   useRefreshToken();
  const { user } = useAuth();
  const location = useLocation();
  const esLogin = location.pathname === "/";
  usePageTitle();

  return (
    <>
      {user?.id && !esLogin && <GlobalAlert />}

      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ventas"
              element={
                <ProtectedRoute roles={["admin", "cajero"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Ventas />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/productos"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Productos />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/clientes"
              element={
                <ProtectedRoute roles={["admin", "cajero"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Clientes />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/proveedores"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Proveedores />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Reportes />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes-pdf"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <ReportesPDF />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Usuarios />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/egresos"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <Egresos />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/historial-ventas"
              element={
                <ProtectedRoute roles={["admin", "cajero"]}>
                  <DashboardLayout>
                    <PageTransition>
                      <HistorialVentas />
                    </PageTransition>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

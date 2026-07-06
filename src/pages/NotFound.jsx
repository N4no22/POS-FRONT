import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-8xl font-black text-blue-600 mb-2">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Página no encontrada</h1>
        <p className="text-gray-400 text-sm mb-8">
          La ruta que buscás no existe o no tenés acceso.
        </p>
        <button
          onClick={() => navigate(user ? (user.rol === "admin" ? "/dashboard" : "/ventas") : "/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
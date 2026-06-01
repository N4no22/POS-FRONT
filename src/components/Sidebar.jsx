import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  Box,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // 🔥 usar contexto

  const navItems = [
    { name: "Inicio", path: "/dashboard", icon: <Home size={20} />, roles: ["admin"] },
    { name: "Ventas", path: "/ventas", icon: <ShoppingBag size={20} />, roles: ["admin", "cajero"] },
    { name: "Productos", path: "/productos", icon: <Box size={20} />, roles: ["admin"] },
    { name: "Clientes", path: "/clientes", icon: <Users size={20} />, roles: ["admin", "cajero"] },
    { name: "Reportes", path: "/reportes", icon: <BarChart3 size={20} />, roles: ["admin"] },
    { name: "Proveedores", path: "/proveedores", icon: <Users size={20} />, roles: ["admin"] },
    { name: "Usuarios", path: "/usuarios", icon: <Users size={20} />, roles: ["admin"] },
  ];

  return (
    <>
      {/* Botón menú móvil */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-gray-800 text-white p-2 rounded-lg"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Panel POS</h2>

        {/* 🔥 Usuario */}
        <p className="text-center text-gray-400 mb-6 text-sm">
          {user?.nombre} ({user?.rol})
        </p>

        <nav className="space-y-2">
          {navItems
            .filter(item => item.roles.includes(user?.rol))
            .map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
        </nav>

        {/* 🔥 Logout real */}
        <div className="absolute bottom-4 left-0 w-full px-4">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
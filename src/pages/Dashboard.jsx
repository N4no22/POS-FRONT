import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const ventasSemana = [
    { dia: "Lun", total: 18000 },
    { dia: "Mar", total: 23000 },
    { dia: "Mié", total: 19500 },
    { dia: "Jue", total: 27000 },
    { dia: "Vie", total: 31000 },
    { dia: "Sáb", total: 45000 },
    { dia: "Dom", total: 22000 },
  ];

  const productosBajoStock = [
    { nombre: "Auriculares JBL", stock: 2 },
    { nombre: "Cable HDMI 2m", stock: 1 },
    { nombre: "Cámara WiFi TP-Link", stock: 3 },
  ];

  const topProductos = [
    { nombre: "Mouse Logitech", cantidad: 53 },
    { nombre: "Monitor Samsung 24\"", cantidad: 37 },
    { nombre: "Teclado Redragon", cantidad: 33 },
    { nombre: "Pendrive Kingston 32GB", cantidad: 25 },
    { nombre: "Cámara WiFi TP-Link", cantidad: 21 },
  ];

  const ultimasVentas = [
    { id: 1, cliente: "Juan Pérez", total: 12500, metodo: "Efectivo" },
    { id: 2, cliente: "María López", total: 8900, metodo: "Fiado" },
    { id: 3, cliente: "Carlos Díaz", total: 15700, metodo: "Tarjeta" },
    { id: 4, cliente: "Ana Torres", total: 5600, metodo: "Efectivo" },
    { id: 5, cliente: "José Rivas", total: 9100, metodo: "Efectivo" },
  ];

  const [indexProducto, setIndexProducto] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndexProducto((prev) => (prev + 1) % productosBajoStock.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [productosBajoStock.length]);

  const productoActual = productosBajoStock[indexProducto];

  return (
    <div className="p-6 space-y-8 bg-gray-100 text-gray-800 min-h-screen">
      {/* ====== TARJETAS RESUMEN ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <DollarSign />, label: "Ventas del Día", value: "$45.300" },
          { icon: <ShoppingBag />, label: "Ventas del Mes", value: "$385.900" },
          { icon: <Users />, label: "Clientes Nuevos", value: "23" },
          { icon: <Package />, label: "Productos en Stock", value: "148" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-200 p-5 rounded-2xl shadow-md flex items-center gap-4"
          >
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              {item.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ====== GRAFICO DE VENTAS ====== */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-500" /> Ventas Semanales
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ventasSemana}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dia" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                color: "#111",
              }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ====== SECCIÓN INFERIOR ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🥇 PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Top 5 Productos</h2>
          <ul className="space-y-3">
            {topProductos.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <span>{p.nombre}</span>
                <span className="text-blue-600 font-medium">
                  {p.cantidad} uds
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 🔔 ALERTA PRODUCTO BAJO */}
        <motion.div
          key={productoActual.nombre}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center"
        >
          <AlertTriangle className="text-yellow-500 w-10 h-10 mb-3" />
          <h2 className="text-lg font-semibold mb-2">Stock Bajo</h2>
          <p className="text-gray-600">
            El producto{" "}
            <span className="text-yellow-600 font-medium">
              {productoActual.nombre}
            </span>{" "}
            tiene solo{" "}
            <span className="text-yellow-600 font-semibold">
              {productoActual.stock}
            </span>{" "}
            unidades.
          </p>
        </motion.div>

        {/* 🧾 ÚLTIMAS VENTAS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Últimas Ventas</h2>
          <ul className="space-y-3">
            {ultimasVentas.map((v) => (
              <li
                key={v.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{v.cliente}</p>
                  <p className="text-sm text-gray-500">{v.metodo}</p>
                </div>
                <span className="text-blue-600 font-medium">${v.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

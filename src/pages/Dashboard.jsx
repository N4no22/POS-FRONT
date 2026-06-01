import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, ShoppingBag, AlertTriangle, TrendingUp,
  Package, CreditCard, Star, ShoppingCart, XCircle, CheckCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:3000/api/dashboard";
const fmt  = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });
const fmtP = (n) => "$" + fmt(n);

export default function Dashboard() {
  const [resumen,         setResumen]         = useState(null);
  const [ventasSemana,    setVentasSemana]    = useState([]);
  const [topProductos,    setTopProductos]    = useState([]);
  const [ultimasVentas,   setUltimasVentas]   = useState([]);
  const [bajoStock,       setBajoStock]       = useState([]);
  const [sinStock,        setSinStock]        = useState([]);
  const [masVendidoHoy,   setMasVendidoHoy]   = useState(null);
  const [cantVentasHoy,   setCantVentasHoy]   = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [indexProducto,   setIndexProducto]   = useState(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [r, vs, tp, uv, bs, ss, mv, cv] = await Promise.all([
          fetch(`${BASE_URL}/resumen`).then(r => r.json()),
          fetch(`${BASE_URL}/ventas-semana`).then(r => r.json()),
          fetch(`${BASE_URL}/top-productos`).then(r => r.json()),
          fetch(`${BASE_URL}/ultimas-ventas`).then(r => r.json()),
          fetch(`${BASE_URL}/bajo-stock`).then(r => r.json()),
          fetch(`${BASE_URL}/sin-stock`).then(r => r.json()),
          fetch(`${BASE_URL}/mas-vendido-hoy`).then(r => r.json()),
          fetch(`${BASE_URL}/cantidad-ventas-hoy`).then(r => r.json()),
        ]);
        setResumen(r); setVentasSemana(vs); setTopProductos(tp);
        setUltimasVentas(uv); setBajoStock(bs); setSinStock(ss);
        setMasVendidoHoy(mv); setCantVentasHoy(cv?.cantidad || 0);
      } catch (err) {
        console.error("Error dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    if (bajoStock.length === 0) return;
    const t = setInterval(() => setIndexProducto(p => (p + 1) % bajoStock.length), 4000);
    return () => clearInterval(t);
  }, [bajoStock.length]);

  const productoActual = bajoStock[indexProducto];

  const colorMap = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100"   },
    green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100"  },
    red:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100"    },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  };

  const cards = resumen ? [
    { icon: <DollarSign size={20}/>, label: "Ventas del día",    value: fmtP(resumen.totalVentas),    sub: `${cantVentasHoy} transacciones`,         color: "blue"   },
    { icon: <CreditCard size={20}/>, label: "Recaudado hoy",     value: fmtP(resumen.totalRecaudado), sub: "Cobrado efectivamente",                   color: "green"  },
    { icon: <ShoppingBag size={20}/>,label: "Deuda total",       value: fmtP(resumen.totalDeuda),     sub: "Saldo pendiente fiados",                  color: "red"    },
    { icon: <Package size={20}/>,    label: "Stock bajo",        value: resumen.productosBajoStock,   sub: `${resumen.sinStock} sin stock`,            color: "yellow" },
  ] : [];

  const metodoBadge = (m) => ({
    efectivo: "bg-green-50 text-green-600",
    fiado:    "bg-yellow-50 text-yellow-600",
    tarjeta:  "bg-blue-50 text-blue-600",
  }[m] || "bg-gray-100 text-gray-500");

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-400 text-sm">Cargando dashboard...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Cards resumen ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${colorMap[item.color].bg} ${colorMap[item.color].text}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
              <p className={`text-2xl font-semibold ${colorMap[item.color].text}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Fila: gráfico + producto estrella ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={16}/> Ventas últimos 7 días
          </h2>
          <p className="text-xs text-gray-400 mb-5">Total facturado por día</p>
          {ventasSemana.length === 0
            ? <p className="text-center text-gray-400 text-sm py-10">Sin datos esta semana</p>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ventasSemana}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="dia" stroke="#9ca3af" tick={{ fontSize: 12 }}/>
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }}
                    tickFormatter={v => "$" + (v >= 1000 ? (v/1000).toFixed(0)+"k" : v)}/>
                  <Tooltip formatter={v => [fmtP(v), "Total"]}
                    contentStyle={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13 }}/>
                  <Bar dataKey="total" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Producto estrella del día */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Star className="text-yellow-400" size={16}/> Más vendido hoy
            </h2>
            <p className="text-xs text-gray-400 mb-5">Producto con mayor salida del día</p>
          </div>

          {masVendidoHoy ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <ShoppingCart className="text-blue-500" size={28}/>
              </div>
              <p className="font-semibold text-gray-900 text-base leading-tight mb-1">
                {masVendidoHoy.nombre}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {Number(masVendidoHoy.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 3 })}
                <span className="text-sm font-normal text-gray-400 ml-1">{masVendidoHoy.unidad_medida}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">vendidos hoy</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="text-gray-200" size={36}/>
              <p className="text-sm text-gray-400 mt-3">Sin ventas hoy todavía</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Fila: top productos + últimas ventas ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top 5 productos mes */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={15}/> Top 5 productos — último mes
          </h2>
          {topProductos.length === 0
            ? <p className="text-center text-gray-400 text-sm py-6">Sin datos</p>
            : (
              <ul className="space-y-2">
                {topProductos.map((p, i) => {
                  const max = topProductos[0]?.cantidad || 1;
                  const pct = (p.cantidad / max) * 100;
                  return (
                    <li key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">{p.nombre}</span>
                        </div>
                        <span className="text-blue-600 font-semibold text-sm">
                          {Number(p.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}/>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          }
        </div>

        {/* Últimas ventas */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Últimas ventas</h2>
          {ultimasVentas.length === 0
            ? <p className="text-center text-gray-400 text-sm py-6">Sin ventas recientes</p>
            : (
              <ul className="space-y-2">
                {ultimasVentas.map(v => (
                  <li key={v.id} className="flex justify-between items-center bg-gray-50 px-3 py-2.5 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{v.cliente}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${metodoBadge(v.metodo)}`}>
                        {v.metodo}
                      </span>
                    </div>
                    <span className="text-blue-600 font-semibold text-sm">{fmtP(v.total)}</span>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      {/* ── Fila: bajo stock + sin stock + alerta rotatoria ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Productos bajo stock */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={15}/> Stock bajo (≤ 5)
          </h2>
          {bajoStock.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="text-green-400" size={28}/>
              <p className="text-sm text-gray-400 mt-2">Todo en orden</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {bajoStock.map((p, i) => (
                <li key={i} className="flex justify-between items-center bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700 truncate max-w-[160px]">{p.nombre}</span>
                  <span className="text-yellow-600 font-semibold text-sm flex-shrink-0">
                    {Number(p.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} {p.unidad_medida}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Productos sin stock */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="text-red-500" size={15}/> Sin stock
          </h2>
          {sinStock.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="text-green-400" size={28}/>
              <p className="text-sm text-gray-400 mt-2">Ningún producto agotado</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sinStock.map((p, i) => (
                <li key={i} className="flex justify-between items-center bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700 truncate max-w-[160px]">{p.nombre}</span>
                  <span className="text-red-500 font-semibold text-xs">Agotado</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Alerta rotatoria */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
          {bajoStock.length === 0 && sinStock.length === 0 ? (
            <>
              <CheckCircle className="text-green-400 w-10 h-10 mb-3"/>
              <p className="text-sm font-semibold text-gray-900">Inventario saludable</p>
              <p className="text-xs text-gray-400 mt-1">Todos los productos tienen stock suficiente</p>
            </>
          ) : (
            <>
              <AlertTriangle className="text-yellow-500 w-9 h-9 mb-3"/>
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {bajoStock.length + sinStock.length} producto{bajoStock.length + sinStock.length > 1 ? "s" : ""} requieren atención
              </p>
              <AnimatePresence mode="wait">
                {productoActual && (
                  <motion.div key={productoActual.nombre}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 w-full"
                  >
                    <p className="text-sm font-medium text-yellow-700">{productoActual.nombre}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">
                      {Number(productoActual.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} {productoActual.unidad_medida} disponibles
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-1 mt-3">
                {bajoStock.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === indexProducto ? "bg-yellow-500" : "bg-gray-200"
                  }`}/>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
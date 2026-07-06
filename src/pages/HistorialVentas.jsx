import { useState, useEffect } from "react";
import { Search, Eye, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "http://localhost:3000/api";

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

const metodoBadge = (m) => ({
  efectivo:      "bg-green-50 text-green-600",
  transferencia: "bg-blue-50 text-blue-600",
  fiado:         "bg-yellow-50 text-yellow-600",
}[m] || "bg-gray-100 text-gray-500");

const estadoBadge = (e) => ({
  pagado:    "bg-green-50 text-green-600",
  pendiente: "bg-yellow-50 text-yellow-600",
  anulada:   "bg-red-50 text-red-500",
}[e] || "bg-gray-100 text-gray-500");

const hoy = new Date().toISOString().split("T")[0];

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [desde, setDesde] = useState(hoy); // ✅ por defecto hoy
  const [hasta, setHasta] = useState(hoy);
  const [busqueda, setBusqueda] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => { fetchVentas(); }, [desde, hasta]);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/reportes/ventas?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error("Error al cargar las ventas");
      setVentas(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (venta) => {
    setVentaDetalle(venta);
    setLoadingDetalle(true);
    try {
      const res = await fetch(`${BASE_URL}/ventas/${venta.id}/detalles`);
      if (!res.ok) throw new Error();
      setDetalles(await res.json());
    } catch {
      setDetalles([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setVentaDetalle(null);
    setDetalles([]);
  };

  const filtered = ventas.filter(v => {
    const matchBusqueda = v.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(v.id).includes(busqueda);
    const matchMetodo = filtroMetodo === "todos" || v.metodo_pago === filtroMetodo;
    const matchEstado = filtroEstado === "todos" || v.estado === filtroEstado;
    return matchBusqueda && matchMetodo && matchEstado;
  });

  const totalFiltrado = filtered.reduce((a, v) => a + Number(v.total), 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 md:px-6 py-5 md:py-7">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="text-blue-600" size={22} /> Historial de ventas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Mostrando ventas del {desde === hasta ? "día" : "período"} seleccionado
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors" />
          </div>

          {/* Accesos rápidos */}
          <div className="flex gap-2">
            <button
              onClick={() => { setDesde(hoy); setHasta(hoy); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                desde === hoy && hasta === hoy
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const ayer = new Date();
                ayer.setDate(ayer.getDate() - 1);
                const ayerStr = ayer.toISOString().split("T")[0];
                setDesde(ayerStr); setHasta(ayerStr);
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Ayer
            </button>
            <button
              onClick={() => {
                const inicioSemana = new Date();
                inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
                setDesde(inicioSemana.toISOString().split("T")[0]); setHasta(hoy);
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Esta semana
            </button>
            <button
              onClick={() => {
                const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  .toISOString().split("T")[0];
                setDesde(inicioMes); setHasta(hoy);
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Este mes
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Método</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors">
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="fiado">Fiado</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors">
              <option value="todos">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search className="text-gray-400" size={15} />
          <input
            placeholder="Buscar por cliente o N° de venta..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
      )}

      {/* Tabla */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-16">Cargando ventas...</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <ShoppingCart size={32} className="mb-2 text-gray-200" />
              <p className="text-sm">Sin ventas para el período seleccionado</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Método</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">#{v.id}</td>
                    <td className="px-5 py-3.5 text-gray-600">{v.fecha}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{v.cliente}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${metodoBadge(v.metodo_pago)}`}>
                        {v.metodo_pago}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(v.estado)}`}>
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{fmt(v.total)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => verDetalle(v)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors ml-auto"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-sm font-bold text-gray-700 hidden md:table-cell">
                    {filtered.length} venta{filtered.length !== 1 ? "s" : ""}
                  </td>
                  <td colSpan={3} className="px-5 py-3 text-sm font-bold text-gray-700 md:hidden">
                    {filtered.length} venta{filtered.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">{fmt(totalFiltrado)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* Modal detalle */}
      <AnimatePresence>
        {ventaDetalle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Venta #{ventaDetalle.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{ventaDetalle.fecha} — {ventaDetalle.cliente}</p>
                </div>
                <button onClick={cerrarDetalle}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                  <X size={15} />
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="flex gap-2 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${metodoBadge(ventaDetalle.metodo_pago)}`}>
                    {ventaDetalle.metodo_pago}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge(ventaDetalle.estado)}`}>
                    {ventaDetalle.estado}
                  </span>
                </div>

                {loadingDetalle ? (
                  <p className="text-center text-gray-400 text-sm py-6">Cargando...</p>
                ) : detalles.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">Sin detalles disponibles</p>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {detalles.map((d, i) => (
                      <li key={i} className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{d.nombre || d.producto_nombre}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {Number(d.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 3 })} × {fmt(d.precio_unitario)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{fmt(d.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between items-center bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl">
                  <span className="text-sm font-semibold text-blue-700">Total</span>
                  <span className="text-lg font-bold text-blue-700">{fmt(ventaDetalle.total)}</span>
                </div>

                {Number(ventaDetalle.saldo_pendiente) > 0 && (
                  <div className="flex justify-between items-center bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl mt-2">
                    <span className="text-sm text-red-600">Pendiente</span>
                    <span className="text-sm font-bold text-red-600">{fmt(ventaDetalle.saldo_pendiente)}</span>
                  </div>
                )}

                <button onClick={cerrarDetalle}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
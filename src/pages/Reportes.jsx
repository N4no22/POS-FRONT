import { useState, useEffect } from "react";
import { AlertTriangle, XCircle, RefreshCw } from "lucide-react";

const BASE_URL = "http://localhost:3000/api";

export default function Reportes() {
  const [productos, setProductos] = useState([]);
  const [sinStock, setSinStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bs, ss] = await Promise.all([
        fetch(`${BASE_URL}/dashboard/bajo-stock`).then(r => r.json()),
        fetch(`${BASE_URL}/dashboard/sin-stock`).then(r => r.json()),
      ]);
      setProductos(bs);
      setSinStock(ss);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const contactarProveedor = (telefono, producto) => {
    if (!telefono) return alert("Este producto no tiene teléfono de proveedor cargado");
    const mensaje = encodeURIComponent(
      `Hola! Nos estamos quedando sin stock del producto "${producto}". ¿Podemos reponerlo?`
    );
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 py-7">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reportes de stock</h1>
          <p className="text-sm text-gray-500 mt-1">Productos que requieren reposición</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-16">Cargando...</p>
      ) : (
        <div className="space-y-6">

          {/* Bajo stock */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={16} />
              <h2 className="text-sm font-semibold text-gray-900">
                Stock bajo (≤ 5) — {productos.length} producto{productos.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {productos.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                🎉 Todos los productos tienen stock suficiente
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Mínimo</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Proveedor</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-medium text-gray-900">{p.nombre}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="bg-yellow-50 text-yellow-600 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                            {Number(p.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} {p.unidad_medida}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-500">{p.stock_minimo}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{p.proveedor.empresa}</p>
                          <p className="text-xs text-gray-400">{p.proveedor.contacto}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => contactarProveedor(p.proveedor.telefono, p.nombre)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              p.proveedor.telefono
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sin stock */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <XCircle className="text-red-500" size={16} />
              <h2 className="text-sm font-semibold text-gray-900">
                Sin stock — {sinStock.length} producto{sinStock.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {sinStock.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                🎉 Ningún producto agotado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Unidad</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sinStock.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-medium text-gray-900">{p.nombre}</td>
                        <td className="px-5 py-3.5">
                          <span className="bg-red-50 text-red-500 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                            Agotado
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => contactarProveedor(p.proveedor?.telefono, p.nombre)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              p.proveedor?.telefono
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
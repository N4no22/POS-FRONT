import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, Package, Pencil, Trash2 } from "lucide-react";
import FormProducto from "../components/FormProducto";

const API_URL = "http://localhost:3000/api/productos";

export default function Productos() {
  const [showForm, setShowForm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Carga inicial ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar los productos");
      setProductos(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Crear o editar ──────────────────────────────────────────────────────
  const handleGuardar = async (producto) => {
    try {
      if (productoSeleccionado) {
        // PUT - editar
        const res = await fetch(`${API_URL}/${producto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(producto),
        });
        if (!res.ok) throw new Error("Error al actualizar el producto");
        const actualizado = await res.json();
        setProductos((prev) =>
          prev.map((p) => (p.id === actualizado.id ? actualizado : p))
        );
      } else {
        // POST - crear (lo maneja FormProducto, solo refrescamos)
        await fetchProductos();
      }
      setShowForm(false);
      setProductoSeleccionado(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // ─── Eliminar ────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el producto");
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_barras?.includes(searchTerm)
  );

  // ─── Totales ─────────────────────────────────────────────────────────────
  const sinStock = productos.filter((p) => Number(p.stock) === 0).length;
  const stockBajo = productos.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) <= 5
  ).length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 px-6 py-7">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" size={22} /> Productos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de inventario y catálogo</p>
        </div>
        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
        >
          <PlusCircle size={16} /> Nuevo producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total productos</p>
          <p className="text-2xl font-semibold text-gray-900">{productos.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Stock bajo (≤5)</p>
          <p className="text-2xl font-semibold text-yellow-500">{stockBajo}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Sin stock</p>
          <p className="text-2xl font-semibold text-red-600">{sinStock}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 shadow-sm">
        <Search className="text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Estados */}
      {loading && (
        <p className="text-center text-gray-400 py-16 text-sm">Cargando productos...</p>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 flex justify-between items-center text-sm">
          <span>{error}</span>
          <button onClick={fetchProductos} className="underline font-medium">Reintentar</button>
        </div>
      )}

      {/* Grilla */}
      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Nombre y código */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">{p.nombre}</h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                      Number(p.stock) === 0
                        ? "bg-red-50 text-red-600"
                        : Number(p.stock) <= 5
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                      {Number(p.stock) === 0
                        ? "Sin stock"
                        : `${Number(p.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} ${p.unidad_medida || "u."}`}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-1">Cód: {p.codigo_barras || "—"}</p>

                  {p.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>
                  )}

                  <div className="mt-3 space-y-1">
                    {p.categoria && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Categoría:</span> {p.categoria}
                      </p>
                    )}
                    {p.proveedor && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Proveedor:</span> {p.proveedor}
                      </p>
                    )}
                    {p.tipo_venta && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Venta:</span> {p.tipo_venta} / {p.unidad_medida}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-blue-600 font-bold text-base">
                    ${Number(p.precio).toLocaleString("es-AR")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setProductoSeleccionado(p); setShowForm(true); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[95vh]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormProducto
                key={productoSeleccionado ? productoSeleccionado.id : "nuevo"}
                producto={productoSeleccionado}
                onGuardar={handleGuardar}
                onClose={() => {
                  setShowForm(false);
                  setProductoSeleccionado(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

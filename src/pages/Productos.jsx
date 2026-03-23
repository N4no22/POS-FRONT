import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, Package, Pencil, Trash2 } from "lucide-react";
import FormProducto from "../components/FormProducto";

export default function Productos() {
  const [showForm, setShowForm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 📦 Datos locales simulados (temporal hasta conectar al backend)
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "Lapicera Azul",
      codigo_barras: "123456789",
      precio: 120,
      stock: 100,
      categoria: "Librería",
      proveedor: "Distribuidora Norte",
      descripcion: "Lapicera tinta azul de plástico",
    },
    {
      id: 2,
      nombre: "Cuaderno A4",
      codigo_barras: "987654321",
      precio: 850,
      stock: 50,
      categoria: "Papelería",
      proveedor: "OfiProve",
      descripcion: "Cuaderno universitario 80 hojas rayado",
    },
  ]);

  // 🔍 Filtro de búsqueda
  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_barras.includes(searchTerm)
  );

  // 💾 Crear o editar producto
  const handleGuardar = (nuevoProducto) => {
    if (productoSeleccionado) {
      // 🔵 Editar
      setProductos((prev) =>
        prev.map((p) => (p.id === nuevoProducto.id ? nuevoProducto : p))
      );
    } else {
      // 🟢 Crear
      setProductos((prev) => [...prev, { ...nuevoProducto, id: Date.now() }]);
    }

    setShowForm(false);
    setProductoSeleccionado(null);
  };

  // ❌ Eliminar producto
  const handleEliminar = (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 px-6 py-6">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Productos
        </h1>

        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-blue-300/30"
        >
          <PlusCircle size={18} /> Nuevo producto
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2 mb-8">
        <Search className="text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTADO DE PRODUCTOS */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-lg"
            >
              <h3 className="font-semibold text-gray-800 text-lg">{p.nombre}</h3>
              <p className="text-gray-500 text-sm mt-1">
                Código: {p.codigo_barras}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Categoría: {p.categoria}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Proveedor: {p.proveedor}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-blue-600 font-bold">${p.precio}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    p.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                </span>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => {
                    setProductoSeleccionado(p);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Pencil size={16} /> Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Package className="w-10 h-10 mb-2 text-gray-400" />
          <p>No se encontraron productos</p>
        </div>
      )}

      {/* MODAL NUEVO / EDITAR */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-y-auto max-h-[95vh]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormProducto
                key={productoSeleccionado ? productoSeleccionado.id : "nuevo"} // 👈 fuerza reinicio correcto
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

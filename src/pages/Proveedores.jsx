import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, Truck, Pencil, Trash2, Phone } from "lucide-react";

export default function Proveedores() {
  const [showForm, setShowForm] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      empresa: "Distribuidora Norte",
      contacto: "Juan Pérez",
      telefono: "1134567890",
      email: "ventas@norte.com",
      observaciones: "Entrega lunes y jueves",
    },
    {
      id: 2,
      empresa: "OfiProve",
      contacto: "María Gómez",
      telefono: "1149873210",
      email: "contacto@ofiprove.com",
      observaciones: "Precios mayoristas",
    },
  ]);

  const filtered = proveedores.filter(
    (p) =>
      p.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGuardar = (proveedor) => {
    if (proveedorSeleccionado) {
      setProveedores((prev) =>
        prev.map((p) => (p.id === proveedor.id ? proveedor : p))
      );
    } else {
      setProveedores((prev) => [...prev, { ...proveedor, id: Date.now() }]);
    }

    setShowForm(false);
    setProveedorSeleccionado(null);
  };

  const handleEliminar = (id) => {
    if (confirm("¿Eliminar proveedor?")) {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 px-6 py-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-blue-600" /> Proveedores
        </h1>

        <button
          onClick={() => {
            setProveedorSeleccionado(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <PlusCircle size={18} /> Nuevo proveedor
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2 mb-8">
        <Search className="text-gray-500" />
        <input
          type="text"
          placeholder="Buscar proveedor o contacto..."
          className="w-full bg-transparent outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTADO */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg text-gray-800">
                {p.empresa}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Contacto: {p.contacto}
              </p>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>📞 {p.telefono}</p>
                <p>✉️ {p.email}</p>
              </div>

              {p.observaciones && (
                <p className="mt-3 text-xs text-gray-500 italic">
                  {p.observaciones}
                </p>
              )}

              {/* ACCIONES */}
              <div className="flex justify-between items-center mt-4">
                <a
                  href={`https://wa.me/${p.telefono}`}
                  target="_blank"
                  className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                >
                  <Phone size={16} /> WhatsApp
                </a>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setProveedorSeleccionado(p);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Pencil size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-20">
          No se encontraron proveedores
        </p>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormProveedor
                proveedor={proveedorSeleccionado}
                onGuardar={handleGuardar}
                onClose={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= FORM ================= */

function FormProveedor({ proveedor, onGuardar, onClose }) {
  const [form, setForm] = useState(
    proveedor || {
      empresa: "",
      contacto: "",
      telefono: "",
      email: "",
      observaciones: "",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ ...form, id: proveedor?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {proveedor ? "Editar proveedor" : "Nuevo proveedor"}
      </h2>

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Empresa"
        value={form.empresa}
        onChange={(e) => setForm({ ...form, empresa: e.target.value })}
        required
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Persona de contacto"
        value={form.contacto}
        onChange={(e) => setForm({ ...form, contacto: e.target.value })}
        required
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        required
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <textarea
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Observaciones"
        value={form.observaciones}
        onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

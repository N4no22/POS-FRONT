import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, Users, Pencil, Trash2 } from "lucide-react";
import FormClienteFiador from "../components/FormClienteFiador";

const API_URL = "http://localhost:3000/api/fiadores";

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar los clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (cliente) => {
    try {
      if (clienteSeleccionado) {
        const res = await fetch(`${API_URL}/${cliente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cliente),
        });
        if (!res.ok) throw new Error("Error al actualizar el cliente");
        const actualizado = await res.json();
        setClientes((prev) =>
          prev.map((c) => (c.id === actualizado.id ? actualizado : c))
        );
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cliente),
        });
        if (!res.ok) throw new Error("Error al crear el cliente");
        const nuevo = await res.json();
        setClientes((prev) => [...prev, nuevo]);
      }
      setShowForm(false);
      setClienteSeleccionado(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar cliente fiador?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el cliente");
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm)
  );

  const totalSaldo = clientes.reduce(
    (acc, c) => acc + Number(c.saldo_pendiente || 0),
    0
  );
  const totalDisponible = clientes.reduce(
    (acc, c) => acc + (Number(c.limite_credito || 0) - Number(c.saldo_pendiente || 0)),
    0
  );

  const getIniciales = (nombre) =>
    nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 py-7">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
            <Users className="text-blue-600" size={22} />
            Clientes fiadores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de clientes y límites de crédito
          </p>
        </div>
        <button
          onClick={() => {
            setClienteSeleccionado(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm"
        >
          <PlusCircle size={16} /> Nuevo fiador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            Total fiadores
          </p>
          <p className="text-2xl font-semibold text-gray-900">{clientes.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            Saldo pendiente
          </p>
          <p className="text-2xl font-semibold text-red-600">
            ${totalSaldo.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            Crédito disponible
          </p>
          <p className="text-2xl font-semibold text-green-600">
            ${totalDisponible.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 shadow-sm">
        <Search className="text-gray-400" size={16} />
        <input
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Estados */}
      {loading && (
        <p className="text-center text-gray-400 py-16 text-sm">Cargando clientes...</p>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 flex justify-between items-center text-sm">
          <span>{error}</span>
          <button onClick={fetchClientes} className="underline font-medium">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nombre
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Teléfono
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dirección
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Saldo
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Límite
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="border-t border-gray-100"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {getIniciales(c.nombre)}
                        </div>
                        <span className="font-medium text-gray-900">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{c.telefono}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.direccion}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          Number(c.saldo_pendiente) > 0
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        ${Number(c.saldo_pendiente).toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      ${Number(c.limite_credito).toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setClienteSeleccionado(c);
                            setShowForm(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleEliminar(c.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FormClienteFiador
                cliente={clienteSeleccionado}
                onGuardar={handleGuardar}
                onClose={() => {
                  setShowForm(false);
                  setClienteSeleccionado(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

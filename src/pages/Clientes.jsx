import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, Users, Pencil, Trash2 } from "lucide-react";
import FormClienteFiador from "../components/FormClienteFiador";

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      telefono: "351-5551234",
      direccion: "Av. Siempre Viva 123",
      saldo_pendiente: 12500,
      limite_credito: 30000,
    },
    {
      id: 2,
      nombre: "María Gómez",
      telefono: "351-4445678",
      direccion: "San Martín 456",
      saldo_pendiente: 0,
      limite_credito: 20000,
    },
  ]);

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm)
  );

  const handleGuardar = (cliente) => {
    if (clienteSeleccionado) {
      setClientes((prev) =>
        prev.map((c) => (c.id === cliente.id ? cliente : c))
      );
    } else {
      setClientes((prev) => [...prev, { ...cliente, id: Date.now() }]);
    }
    setShowForm(false);
    setClienteSeleccionado(null);
  };

  const handleEliminar = (id) => {
    if (confirm("¿Eliminar cliente fiador?")) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-blue-600" /> Clientes fiadores
        </h1>

        <button
          onClick={() => {
            setClienteSeleccionado(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={18} /> Nuevo fiador
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 mb-6">
        <Search className="text-gray-500" />
        <input
          className="w-full outline-none"
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Límite</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <motion.tr
                key={c.id}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">{c.nombre}</td>
                <td className="px-4 py-3 text-center">{c.telefono}</td>
                <td className="px-4 py-3 text-center">{c.direccion}</td>
                <td
                  className={`px-4 py-3 text-center font-semibold ${
                    c.saldo_pendiente > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ${c.saldo_pendiente}
                </td>
                <td className="px-4 py-3 text-center">
                  ${c.limite_credito}
                </td>
                <td className="px-4 py-3 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setClienteSeleccionado(c);
                      setShowForm(true);
                    }}
                    className="text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(c.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white w-full max-w-3xl rounded-xl"
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
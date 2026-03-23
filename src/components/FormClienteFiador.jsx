import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function FormClienteFiador({
  onSave,
  onCancel,
  clienteEditando,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    saldo: 0,
    limite: 0,
  });

  useEffect(() => {
    if (clienteEditando) {
      setFormData(clienteEditando);
    }
  }, [clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "saldo" || name === "limite"
        ? Number(value)
        : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);

    setFormData({
      nombre: "",
      telefono: "",
      direccion: "",
      saldo: 0,
      limite: 0,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {clienteEditando ? "Editar Cliente" : "Nuevo Cliente Fiador"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="number"
            name="saldo"
            placeholder="Saldo pendiente"
            value={formData.saldo}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="number"
            name="limite"
            placeholder="Límite de crédito"
            value={formData.limite}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
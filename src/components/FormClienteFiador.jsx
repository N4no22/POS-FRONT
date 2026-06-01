import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function FormClienteFiador({ onGuardar, onClose, cliente }) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    saldo_pendiente: 0,
    limite_credito: 0,
  });

  useEffect(() => {
    if (cliente) setFormData(cliente);
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "saldo_pendiente" || name === "limite_credito"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(formData);
    setFormData({
      nombre: "",
      telefono: "",
      direccion: "",
      saldo_pendiente: 0,
      limite_credito: 0,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {cliente ? "Editar cliente" : "Nuevo cliente fiador"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {cliente
              ? "Modificá los datos del fiador"
              : "Completá los datos para registrar un nuevo fiador"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Teléfono + Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                placeholder="351-0000000"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Calle y número"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Separador financiero */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Información financiera
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Saldo pendiente
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    name="saldo_pendiente"
                    placeholder="0"
                    value={formData.saldo_pendiente}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Límite de crédito
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    name="limite_credito"
                    placeholder="0"
                    value={formData.limite_credito}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {cliente ? "Guardar cambios" : "Guardar fiador"}
          </button>
        </div>
      </form>
    </div>
  );
}

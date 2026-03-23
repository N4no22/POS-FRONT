import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FormProducto.jsx
 * - Frontend sólo (simula categorías/proveedores)
 * - Modal para crear categoría (simple)
 * - Modal para crear proveedor (extendido: empresa, contacto, teléfono, email, dirección)
 */

export default function FormProducto() {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    codigo_barras: "",
    categoria_id: "",
    proveedor_id: "",
  });

  const [categorias, setCategorias] = useState([
    { id: 1, nombre: "Papelería" },
    { id: 2, nombre: "Limpieza" },
  ]);

  // proveedores ahora con campos extendidos
  const [proveedores, setProveedores] = useState([
    { id: 1, empresa: "Distribuidora Sur", contacto: "Lucía", telefono: "341-123456", email: "ventas@sur.com", direccion: "Calle A 123" },
    { id: 2, empresa: "Mayorista Norte", contacto: "Carlos", telefono: "341-987654", email: "info@norte.com", direccion: "Av B 456" },
  ]);

  // UI / modales / mensajes
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");

  // campos temporales para crear proveedor
  const [provEmpresa, setProvEmpresa] = useState("");
  const [provContacto, setProvContacto] = useState("");
  const [provTelefono, setProvTelefono] = useState("");
  const [provEmail, setProvEmail] = useState("");
  const [provDireccion, setProvDireccion] = useState("");

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio || !form.stock) {
      setMensaje("Completar nombre, precio y stock.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }

    // simulación de guardado
    setMensaje(`✅ Producto "${form.nombre}" cargado correctamente`);
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      codigo_barras: "",
      categoria_id: "",
      proveedor_id: "",
    });
    setTimeout(() => setMensaje(""), 3000);
  };

  const agregarCategoria = () => {
    if (!nuevaCategoria.trim()) return;
    const nueva = { id: categorias.length + 1, nombre: nuevaCategoria.trim() };
    setCategorias((c) => [...c, nueva]);
    setNuevaCategoria("");
    setShowCategoriaModal(false);
    setMensaje("✅ Categoría creada");
    setTimeout(() => setMensaje(""), 2000);
  };

  const agregarProveedor = () => {
    if (!provEmpresa.trim() && !provContacto.trim()) {
      setMensaje("Completá al menos el nombre de la empresa o el contacto.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }

    const nuevo = {
      id: proveedores.length + 1,
      empresa: provEmpresa.trim() || "(Sin nombre empresa)",
      contacto: provContacto.trim() || "(Sin contacto)",
      telefono: provTelefono.trim(),
      email: provEmail.trim(),
      direccion: provDireccion.trim(),
    };

    setProveedores((p) => [...p, nuevo]);

    // seleccionar automáticamente el proveedor recién creado
    setForm((s) => ({ ...s, proveedor_id: String(nuevo.id) }));

    // limpiar modal
    setProvEmpresa("");
    setProvContacto("");
    setProvTelefono("");
    setProvEmail("");
    setProvDireccion("");
    setShowProveedorModal(false);

    setMensaje("✅ Proveedor creado y seleccionado");
    setTimeout(() => setMensaje(""), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-100 relative">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
        Registrar nuevo producto
      </h2>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-4 text-center text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-lg inline-block"
        >
          {mensaje}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <label className="block text-gray-700 mb-1">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Lapicera azul"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Código de barras</label>
          <input
            name="codigo_barras"
            value={form.codigo_barras}
            onChange={handleChange}
            placeholder="123456789"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            placeholder="Detalles del producto..."
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Precio ($)</label>
          <input
            name="precio"
            value={form.precio}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Stock</label>
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            type="number"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-gray-700 mb-1">Categoría</label>
          <div className="flex gap-2">
            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCategoriaModal(true)}
              className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 transition"
              title="Crear categoría"
            >
              +
            </button>
          </div>
        </div>

        {/* Proveedor (con campos extendidos al crear) */}
        <div>
          <label className="block text-gray-700 mb-1">Proveedor</label>
          <div className="flex gap-2">
            <select
              name="proveedor_id"
              value={form.proveedor_id}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.empresa} — {p.contacto}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowProveedorModal(true)}
              className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 transition"
              title="Crear proveedor"
            >
              +
            </button>
          </div>
        </div>

        <div className="col-span-2 flex justify-end mt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Guardar producto
          </button>
        </div>
      </form>

      {/* Modal Nueva Categoría (simple) */}
      <AnimatePresence>
        {showCategoriaModal && (
          <ModalSimple
            titulo="Nueva categoría"
            valor={nuevaCategoria}
            setValor={setNuevaCategoria}
            onGuardar={() => {
              if (!nuevaCategoria.trim()) return;
              const nueva = { id: categorias.length + 1, nombre: nuevaCategoria.trim() };
              setCategorias((c) => [...c, nueva]);
              setForm((s) => ({ ...s, categoria_id: String(nueva.id) }));
              setNuevaCategoria("");
              setShowCategoriaModal(false);
              setMensaje("✅ Categoría creada y seleccionada");
              setTimeout(() => setMensaje(""), 2000);
            }}
            onCerrar={() => setShowCategoriaModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal Nuevo Proveedor (extendido) */}
      <AnimatePresence>
        {showProveedorModal && (
          <ModalProveedor
            empresa={provEmpresa}
            setEmpresa={setProvEmpresa}
            contacto={provContacto}
            setContacto={setProvContacto}
            telefono={provTelefono}
            setTelefono={setProvTelefono}
            email={provEmail}
            setEmail={setProvEmail}
            direccion={provDireccion}
            setDireccion={setProvDireccion}
            onGuardar={agregarProveedor}
            onCerrar={() => setShowProveedorModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Modal simple (categoría) ---------- */
function ModalSimple({ titulo, valor, setValor, onGuardar, onCerrar }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h3 className="text-lg font-semibold mb-3">{titulo}</h3>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nombre de la categoría..."
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCerrar} className="px-3 py-1 rounded-md bg-gray-200">
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            className="px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Modal proveedor (extendido) ---------- */
function ModalProveedor({
  empresa,
  setEmpresa,
  contacto,
  setContacto,
  telefono,
  setTelefono,
  email,
  setEmail,
  direccion,
  setDireccion,
  onGuardar,
  onCerrar,
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Nuevo proveedor</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Empresa</label>
            <input
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Persona de contacto</label>
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="341-xxxxxxx"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="proveedor@ejemplo.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Dirección</label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Calle 123, Ciudad"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCerrar} className="px-4 py-2 bg-gray-200 rounded-md">
            Cancelar
          </button>
          <button onClick={onGuardar} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Guardar proveedor
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const BASE_URL = "http://localhost:3000/api";

const shakeVariants = {
  idle:  { x: 0 },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } },
};

export default function FormProducto({ producto, onGuardar, onClose }) {
  const [form, setForm] = useState({
    nombre: "", descripcion: "", precio: "", stock: "",
    codigo_barras: "", categoria_id: "", proveedor_id: "",
    tipo_venta: "unidad", unidad_medida: "unidad",
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [loading, setLoading] = useState(false);

  const [provEmpresa, setProvEmpresa]     = useState("");
  const [provContacto, setProvContacto]   = useState("");
  const [provTelefono, setProvTelefono]   = useState("");
  const [provEmail, setProvEmail]         = useState("");
  const [provDireccion, setProvDireccion] = useState("");

  // ← Estados shake para cada modal interno
  const [shakeCategoria, setShakeCategoria] = useState(false);
  const [shakeProveedor, setShakeProveedor] = useState(false);

  const triggerShake = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 400);
  };

  useEffect(() => {
    fetchCategorias();
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (producto) {
      setForm({
        nombre:        producto.nombre        || "",
        descripcion:   producto.descripcion   || "",
        precio:        producto.precio        || "",
        stock:         producto.stock         || "",
        codigo_barras: producto.codigo_barras || "",
        categoria_id:  String(producto.categoria_id  || ""),
        proveedor_id:  String(producto.proveedor_id  || ""),
        tipo_venta:    producto.tipo_venta    || "unidad",
        unidad_medida: producto.unidad_medida || "unidad",
      });
    }
  }, [producto]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${BASE_URL}/categorias`);
      if (!res.ok) throw new Error();
      setCategorias(await res.json());
    } catch {
      mostrarMensaje("Error al cargar categorías", "error");
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${BASE_URL}/provedores`);
      if (!res.ok) throw new Error();
      setProveedores(await res.json());
    } catch {
      mostrarMensaje("Error al cargar proveedores", "error");
    }
  };

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio || !form.stock) {
      mostrarMensaje("Completá nombre, precio y stock.", "error");
      return;
    }
    const body = {
      ...form,
      precio:       Number(form.precio),
      stock:        Number(form.stock),
      categoria_id: Number(form.categoria_id),
      proveedor_id: Number(form.proveedor_id),
    };
    try {
      setLoading(true);
      const isEditing = Boolean(producto);
      const url    = isEditing ? `${BASE_URL}/productos/${producto.id}` : `${BASE_URL}/productos`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = (errorData?.message || errorData?.error || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("codigo_barras")) {
          throw new Error("Ya existe un producto con ese código de barras");
        }
        throw new Error(isEditing ? "Error al actualizar el producto" : "Error al guardar el producto");
      }

      const resultado = await res.json();
      mostrarMensaje(`Producto "${form.nombre}" ${isEditing ? "actualizado" : "guardado"} correctamente`);

      if (isEditing) {
        setTimeout(() => { onGuardar(resultado); onClose?.(); }, 1200);
      } else {
        setForm({
          nombre: "", descripcion: "", precio: "", stock: "",
          codigo_barras: "", categoria_id: "", proveedor_id: "",
          tipo_venta: "unidad", unidad_medida: "unidad",
        });
        setTimeout(() => { onGuardar(resultado); }, 1200);
      }
    } catch (err) {
      mostrarMensaje(err.message || "Error al guardar el producto", "error");
    } finally {
      setLoading(false);
    }
  };

  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
      });
      if (!res.ok) throw new Error();
      const nueva = await res.json();
      setCategorias((c) => [...c, nueva]);
      setForm((s) => ({ ...s, categoria_id: String(nueva.id) }));
      setNuevaCategoria("");
      setShowCategoriaModal(false);
      mostrarMensaje("Categoría creada y seleccionada");
    } catch {
      mostrarMensaje("Error al crear la categoría", "error");
    }
  };

  const agregarProveedor = async () => {
    if (!provEmpresa.trim() && !provContacto.trim()) {
      mostrarMensaje("Completá al menos empresa o contacto.", "error");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/provedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:   provEmpresa.trim()  || "(Sin nombre)",
          contacto: provContacto.trim(),
          telefono: provTelefono.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      const nuevo = await res.json();
      setProveedores((p) => [...p, nuevo]);
      setForm((s) => ({ ...s, proveedor_id: String(nuevo.id) }));
      setProvEmpresa(""); setProvContacto(""); setProvTelefono("");
      setProvEmail(""); setProvDireccion("");
      setShowProveedorModal(false);
      mostrarMensaje("Proveedor creado y seleccionado");
    } catch {
      mostrarMensaje("Error al crear el proveedor", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Header con X ← */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {producto ? "Editar producto" : "Registrar nuevo producto"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {producto ? "Modificá los datos del producto" : "Completá los datos para agregar un producto al inventario"}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Mensaje */}
        <AnimatePresence>
          {mensaje.texto && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mx-8 mt-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
                mensaje.tipo === "error"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-green-50 text-green-700 border border-green-100"
              }`}
            >
              {mensaje.texto}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-6 grid grid-cols-2 gap-5">

          <Field label="Nombre" required>
            <input name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Lapicera azul" className={inputCls} required />
          </Field>

          <Field label="Código de barras">
            <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange}
              placeholder="123456789" className={inputCls} />
          </Field>

          <Field label="Descripción" className="col-span-2">
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              rows={2} placeholder="Detalles del producto..."
              className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Precio" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input name="precio" value={form.precio} onChange={handleChange}
                type="number" min="0" step="0.01" placeholder="0"
                className={`${inputCls} pl-7`} required />
            </div>
          </Field>

          <Field label={`Stock (${form.unidad_medida})`} required>
            <input name="stock" value={form.stock} onChange={handleChange}
              type="number" min="0" step="0.001" placeholder="0.000"
              className={inputCls} required />
          </Field>

          <Field label="Categoría" required>
            <div className="flex gap-2">
              <select name="categoria_id" value={form.categoria_id} onChange={handleChange}
                className={`${inputCls} flex-1`} required>
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowCategoriaModal(true)}
                className="w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center"
                title="Nueva categoría">
                +
              </button>
            </div>
          </Field>

          <Field label="Proveedor" required>
            <div className="flex gap-2">
              <select name="proveedor_id" value={form.proveedor_id} onChange={handleChange}
                className={`${inputCls} flex-1`} required>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.nombre} — {p.contacto}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowProveedorModal(true)}
                className="w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center"
                title="Nuevo proveedor">
                +
              </button>
            </div>
          </Field>

          <Field label="Tipo de venta" required>
            <select name="tipo_venta" value={form.tipo_venta} onChange={handleChange}
              className={inputCls} required>
              <option value="unidad">Unidad</option>
              <option value="peso">Peso</option>
              <option value="metro">Metro</option>
              <option value="litro">Litro</option>
            </select>
          </Field>

          <Field label="Unidad de medida" required>
            <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange}
              className={inputCls} required>
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramo (kg)</option>
              <option value="gr">Gramo (gr)</option>
              <option value="lt">Litro (lt)</option>
              <option value="mt">Metro (mt)</option>
            </select>
          </Field>

          {/* Botones ← Cancelar + Guardar */}
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
            {onClose && (
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors text-white px-6 py-2.5 rounded-lg text-sm font-medium">
              {loading ? "Guardando..." : producto ? "Guardar cambios" : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Categoría — con shake ← */}
      <AnimatePresence>
        {showCategoriaModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => triggerShake(setShakeCategoria)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              variants={shakeVariants}
              animate={shakeCategoria ? "shake" : "idle"}
              initial={{ scale: 0.95, y: 10 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Nueva categoría</h3>
                <button onClick={() => setShowCategoriaModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                  <X size={15} />
                </button>
              </div>
              <div className="px-6 py-5">
                <label className={labelCls}>Nombre de la categoría</label>
                <input value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Ej: Papelería" className={inputCls} autoFocus
                  onKeyDown={(e) => e.key === "Enter" && agregarCategoria()} />
                <div className="flex justify-end gap-2 mt-5">
                  <BtnSecundario onClick={() => setShowCategoriaModal(false)}>Cancelar</BtnSecundario>
                  <BtnPrimario onClick={agregarCategoria}>Guardar</BtnPrimario>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Proveedor — con shake ← */}
      <AnimatePresence>
        {showProveedorModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => triggerShake(setShakeProveedor)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
              variants={shakeVariants}
              animate={shakeProveedor ? "shake" : "idle"}
              initial={{ scale: 0.95, y: 10 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Nuevo proveedor</h3>
                <button onClick={() => setShowProveedorModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                  <X size={15} />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input value={provEmpresa} onChange={(e) => setProvEmpresa(e.target.value)}
                      placeholder="Distribuidora Sur" className={inputCls} autoFocus />
                  </div>
                  <div>
                    <label className={labelCls}>Persona de contacto</label>
                    <input value={provContacto} onChange={(e) => setProvContacto(e.target.value)}
                      placeholder="Juan Pérez" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono</label>
                    <input value={provTelefono} onChange={(e) => setProvTelefono(e.target.value)}
                      placeholder="341-xxxxxxx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input value={provEmail} onChange={(e) => setProvEmail(e.target.value)}
                      type="email" placeholder="proveedor@ejemplo.com" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Dirección</label>
                    <input value={provDireccion} onChange={(e) => setProvDireccion(e.target.value)}
                      placeholder="Calle 123, Ciudad" className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <BtnSecundario onClick={() => setShowProveedorModal(false)}>Cancelar</BtnSecundario>
                  <BtnPrimario onClick={agregarProveedor}>Guardar proveedor</BtnPrimario>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors";

const labelCls =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

function Field({ label, children, className = "", required }) {
  return (
    <div className={className}>
      <label className={labelCls}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function BtnPrimario({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
      {children}
    </button>
  );
}

function BtnSecundario({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      {children}
    </button>
  );
}
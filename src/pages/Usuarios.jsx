import { useState, useEffect } from "react";
import { Users, PlusCircle, Trash2, Shield, ShoppingBag, Pencil, X, Eye, EyeOff, KeyRound } from "lucide-react";

const BASE_URL = "http://localhost:3000/api";

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "cajero",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal reset contraseña
  const [showResetModal, setShowResetModal] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${BASE_URL}/usuarios`);
      if (!res.ok) throw new Error();
      setUsuarios(await res.json());
    } catch {
      setError("Error al cargar los usuarios");
    } finally {
      setLoadingList(false);
    }
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validar = () => {
    if (!formData.nombre.trim()) return "El nombre es obligatorio";
    if (!formData.apellido.trim()) return "El apellido es obligatorio";
    if (!formData.email.trim()) return "El email es obligatorio";
    if (!editando && !formData.password.trim()) return "La contraseña es obligatoria";
    if (formData.password && formData.password.length < 4) return "Mínimo 4 caracteres";
    return "";
  };

  // ─── Abrir modal ─────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null);
    setFormData(initialForm);
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  const abrirEditar = (u) => {
    setEditando(u);
    setFormData({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: "", rol: u.rol });
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  // ─── Guardar (crear o editar) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }

    try {
      setLoading(true);
      setError("");

      const body = { ...formData };
      if (editando && !body.password) delete body.password; // no mandar password vacío al editar

      const res = await fetch(
        editando ? `${BASE_URL}/usuarios/${editando.id}` : `${BASE_URL}/usuarios`,
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al guardar el usuario");
      }

      const resultado = await res.json();

      if (editando) {
        setUsuarios(prev => prev.map(u => u.id === resultado.id ? resultado : u));
        mostrarMensaje("Usuario actualizado correctamente");
      } else {
        setUsuarios(prev => [...prev, resultado]);
        mostrarMensaje("Usuario creado correctamente");
      }

      setShowModal(false);
      setEditando(null);
      setFormData(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Eliminar ─────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`${BASE_URL}/usuarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el usuario");
      setUsuarios(prev => prev.filter(u => u.id !== id));
      mostrarMensaje("Usuario eliminado");
    } catch (err) {
      setError(err.message);
    }
  };

  // ─── Reset contraseña ────────────────────────────────────────────────────
  const abrirReset = (u) => {
    setUsuarioReset(u);
    setNuevaPassword("");
    setShowNuevaPassword(false);
    setShowResetModal(true);
  };

  const confirmarReset = async () => {
    if (!nuevaPassword || nuevaPassword.length < 4) {
      setError("Mínimo 4 caracteres"); return;
    }
    try {
      setLoadingReset(true);
      const res = await fetch(`${BASE_URL}/usuarios/${usuarioReset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: usuarioReset.nombre,
          apellido: usuarioReset.apellido,
          email: usuarioReset.email,
          rol: usuarioReset.rol,
          password: nuevaPassword
        })
      });
      if (!res.ok) throw new Error("Error al resetear la contraseña");
      setShowResetModal(false);
      setUsuarioReset(null);
      setNuevaPassword("");
      mostrarMensaje(`Contraseña de ${usuarioReset.nombre} actualizada`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReset(false);
    }
  };

  const getIniciales = (nombre, apellido) =>
    `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();

  return (
    <div className="w-full min-h-screen bg-gray-50 px-6 py-7">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={22} /> Gestión de usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">Administrá los accesos al sistema</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <PlusCircle size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Mensajes globales */}
      {mensaje && (
        <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-2.5 rounded-xl mb-4">
          {mensaje}
        </div>
      )}
      {error && !showModal && !showResetModal && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-900">Usuarios registrados</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {usuarios.length} total
          </span>
        </div>

        {loadingList ? (
          <p className="text-center text-gray-400 text-sm py-12">Cargando...</p>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <Users size={32} className="mb-2 text-gray-300" />
            <p className="text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {getIniciales(u.nombre, u.apellido)}
                      </div>
                      <span className="font-medium text-gray-900">{u.nombre} {u.apellido}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.rol === "admin" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    }`}>
                      {u.rol === "admin" ? <><Shield size={11}/> Admin</> : <><ShoppingBag size={11}/> Cajero</>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => abrirReset(u)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <KeyRound size={12} /> Resetear
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(u)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleEliminar(u.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal crear/editar ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {editando ? "Editar usuario" : "Nuevo usuario"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editando ? "Modificá los datos del usuario" : "Completá los datos para crear un acceso"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                    placeholder="Juan" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                    placeholder="Pérez" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="usuario@ejemplo.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  {editando ? "Nueva contraseña (dejá vacío para no cambiar)" : "Contraseña"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={formData.password} onChange={handleChange}
                    placeholder={editando ? "Dejar vacío para mantener" : "Mínimo 4 caracteres"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Rol</label>
                <select name="rol" value={formData.rol} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors">
                  <option value="cajero">Cajero</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal reset contraseña ───────────────────────────────────────── */}
      {showResetModal && usuarioReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResetModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Resetear contraseña</h2>
                <p className="text-xs text-gray-400 mt-0.5">{usuarioReset.nombre} {usuarioReset.apellido}</p>
              </div>
              <button onClick={() => setShowResetModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNuevaPassword ? "text" : "password"}
                    value={nuevaPassword}
                    onChange={e => { setNuevaPassword(e.target.value); setError(""); }}
                    placeholder="Mínimo 4 caracteres"
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <button type="button" onClick={() => setShowNuevaPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNuevaPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowResetModal(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmarReset} disabled={loadingReset}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  {loadingReset ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
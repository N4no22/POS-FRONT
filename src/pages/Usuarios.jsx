import { useEffect, useState } from "react"
import {
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  PlusCircle,
  PowerOff,
  RotateCcw,
  Search,
  Shield,
  ShoppingBag,
  Users,
  X
} from "lucide-react"

import ConfirmModal from "../components/ConfirmModal"
import { useAuth } from "../context/AuthContext"

const BASE_URL = "http://localhost:3000/api"

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "cajero"
}

export default function UsuariosPage() {
  const { user } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [vista, setVista] = useState("activos")
  const [searchTerm, setSearchTerm] = useState("")

  const [loadingList, setLoadingList] =
    useState(true)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  // Crear y editar
  const [showModal, setShowModal] =
    useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] =
    useState(initialForm)
  const [showPassword, setShowPassword] =
    useState(false)
  const [loading, setLoading] = useState(false)

  // Resetear contraseña
  const [showResetModal, setShowResetModal] =
    useState(false)
  const [usuarioReset, setUsuarioReset] =
    useState(null)
  const [nuevaPassword, setNuevaPassword] =
    useState("")
  const [
    showNuevaPassword,
    setShowNuevaPassword
  ] = useState(false)
  const [loadingReset, setLoadingReset] =
    useState(false)

  // Desactivación
  const [confirm, setConfirm] = useState({
    visible: false,
    id: null,
    loading: false
  })

  const fetchUsuarios = async () => {
    try {
      setLoadingList(true)
      setError("")

      const url =
        vista === "inactivos"
          ? `${BASE_URL}/usuarios/inactivos`
          : `${BASE_URL}/usuarios`

      const res = await fetch(url)
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al cargar los usuarios"
        )
      }

      setUsuarios(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [vista])

  const mostrarMensaje = (texto) => {
    setMensaje(texto)

    setTimeout(() => {
      setMensaje("")
    }, 3000)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    setError("")
  }

  const validar = () => {
    if (!formData.nombre.trim()) {
      return "El nombre es obligatorio"
    }

    if (!formData.apellido.trim()) {
      return "El apellido es obligatorio"
    }

    if (!formData.email.trim()) {
      return "El email es obligatorio"
    }

    if (!editando && !formData.password.trim()) {
      return "La contraseña es obligatoria"
    }

    if (
      formData.password &&
      formData.password.length < 6
    ) {
      return "La contraseña debe tener al menos 6 caracteres"
    }

    return ""
  }

  const abrirCrear = () => {
    setEditando(null)
    setFormData(initialForm)
    setShowPassword(false)
    setError("")
    setShowModal(true)
  }

  const abrirEditar = (usuario) => {
    setEditando(usuario)

    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: "",
      rol: usuario.rol
    })

    setShowPassword(false)
    setError("")
    setShowModal(true)
  }

  const cerrarModal = () => {
    if (loading) return

    setShowModal(false)
    setEditando(null)
    setFormData(initialForm)
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errorValidacion = validar()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setLoading(true)
      setError("")

      const body = {
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase()
      }

      if (editando && !body.password) {
        delete body.password
      }

      const url = editando
        ? `${BASE_URL}/usuarios/${editando.id}`
        : `${BASE_URL}/usuarios`

      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      const resultado = await res
        .json()
        .catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          resultado.message ||
            "Error al guardar el usuario"
        )
      }

      mostrarMensaje(
        editando
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      )

      cerrarModal()

      if (vista !== "activos") {
        setVista("activos")
      } else {
        await fetchUsuarios()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const solicitarDesactivacion = (usuario) => {
    if (String(usuario.id) === String(user?.id)) {
      setError(
        "No podés desactivar tu propio usuario mientras estás conectado"
      )
      return
    }

    setConfirm({
      visible: true,
      id: usuario.id,
      loading: false
    })
  }

  const confirmarDesactivacion = async () => {
    setConfirm((prev) => ({
      ...prev,
      loading: true
    }))

    try {
      const res = await fetch(
        `${BASE_URL}/usuarios/${confirm.id}/desactivar`,
        {
          method: "PATCH"
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al desactivar el usuario"
        )
      }

      setUsuarios((prev) =>
        prev.filter(
          (usuario) => usuario.id !== confirm.id
        )
      )

      setConfirm({
        visible: false,
        id: null,
        loading: false
      })

      mostrarMensaje(
        "Usuario desactivado correctamente"
      )
    } catch (err) {
      setError(err.message)

      setConfirm((prev) => ({
        ...prev,
        loading: false
      }))
    }
  }

  const reactivarUsuario = async (id) => {
    try {
      setError("")

      const res = await fetch(
        `${BASE_URL}/usuarios/${id}/reactivar`,
        {
          method: "PATCH"
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al reactivar el usuario"
        )
      }

      setUsuarios((prev) =>
        prev.filter((usuario) => usuario.id !== id)
      )

      mostrarMensaje(
        "Usuario reactivado correctamente"
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const abrirReset = (usuario) => {
    setUsuarioReset(usuario)
    setNuevaPassword("")
    setShowNuevaPassword(false)
    setError("")
    setShowResetModal(true)
  }

  const cerrarReset = () => {
    if (loadingReset) return

    setShowResetModal(false)
    setUsuarioReset(null)
    setNuevaPassword("")
    setError("")
  }

  const confirmarReset = async () => {
    if (
      !nuevaPassword ||
      nuevaPassword.length < 6
    ) {
      setError(
        "La contraseña debe tener al menos 6 caracteres"
      )
      return
    }

    try {
      setLoadingReset(true)
      setError("")

      const res = await fetch(
        `${BASE_URL}/usuarios/${usuarioReset.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: usuarioReset.nombre,
            apellido: usuarioReset.apellido,
            email: usuarioReset.email,
            rol: usuarioReset.rol,
            password: nuevaPassword
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al resetear la contraseña"
        )
      }

      cerrarReset()

      mostrarMensaje(
        `Contraseña de ${usuarioReset.nombre} actualizada`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingReset(false)
    }
  }

  const textoBusqueda =
    searchTerm.trim().toLowerCase()

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre
        ?.toLowerCase()
        .includes(textoBusqueda) ||
      usuario.apellido
        ?.toLowerCase()
        .includes(textoBusqueda) ||
      usuario.email
        ?.toLowerCase()
        .includes(textoBusqueda)
  )

  const getIniciales = (nombre, apellido) =>
    `${nombre?.[0] || ""}${
      apellido?.[0] || ""
    }`.toUpperCase()

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-200">
              <Users size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Gestión de usuarios
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Administrá los accesos al sistema
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirCrear}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <PlusCircle size={17} />
            Nuevo usuario
          </button>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
            {mensaje}
          </div>
        )}

        {error &&
          !showModal &&
          !showResetModal && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                <X size={15} />
              </button>
            </div>
          )}

        {/* Activos e inactivos */}
        <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setVista("activos")
              setSearchTerm("")
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              vista === "activos"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Activos
          </button>

          <button
            type="button"
            onClick={() => {
              setVista("inactivos")
              setSearchTerm("")
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              vista === "inactivos"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Inactivos
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search
              className="text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Buscar por nombre o email..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Usuarios{" "}
              {vista === "activos"
                ? "activos"
                : "inactivos"}
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
              {usuariosFiltrados.length} total
            </span>
          </div>

          {loadingList ? (
            <p className="py-16 text-center text-sm text-slate-400">
              Cargando usuarios...
            </p>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400">
              <Users
                size={34}
                className="mb-3 text-slate-300"
              />

              <p className="text-sm">
                No se encontraron usuarios
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Usuario
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Rol
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contraseña
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              vista === "activos"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {getIniciales(
                              usuario.nombre,
                              usuario.apellido
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {usuario.nombre}{" "}
                              {usuario.apellido}
                            </p>

                            {String(usuario.id) ===
                              String(user?.id) && (
                              <span className="text-xs text-blue-500">
                                Tu usuario
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {usuario.email}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            usuario.rol === "admin"
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {usuario.rol === "admin" ? (
                            <>
                              <Shield size={11} />
                              Admin
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={11} />
                              Cajero
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {vista === "activos" ? (
                          <button
                            type="button"
                            onClick={() =>
                              abrirReset(usuario)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <KeyRound size={12} />
                            Resetear
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No disponible
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          {vista === "activos" ? (
                            <>
                              <button
                                type="button"
                                title="Editar usuario"
                                onClick={() =>
                                  abrirEditar(usuario)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                title="Desactivar usuario"
                                disabled={
                                  String(usuario.id) ===
                                  String(user?.id)
                                }
                                onClick={() =>
                                  solicitarDesactivacion(
                                    usuario
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <PowerOff size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                reactivarUsuario(
                                  usuario.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <RotateCcw size={14} />
                              Reactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Crear o editar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={cerrarModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {editando
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {editando
                    ? "Modificá los datos del usuario"
                    : "Creá un nuevo acceso al sistema"}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 px-6 py-5"
            >
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Apellido
                  </label>

                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {editando
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña"}
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      editando
                        ? "Dejar vacío para mantener"
                        : "Mínimo 6 caracteres"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rol
                </label>

                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="cajero">
                    Cajero
                  </option>
                  <option value="admin">
                    Administrador
                  </option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? "Guardando..."
                    : editando
                    ? "Guardar cambios"
                    : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resetear contraseña */}
      {showResetModal && usuarioReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={cerrarReset}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Resetear contraseña
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {usuarioReset.nombre}{" "}
                  {usuarioReset.apellido}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarReset}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <input
                    type={
                      showNuevaPassword
                        ? "text"
                        : "password"
                    }
                    value={nuevaPassword}
                    onChange={(e) => {
                      setNuevaPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNuevaPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNuevaPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={cerrarReset}
                  className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarReset}
                  disabled={loadingReset}
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingReset
                    ? "Guardando..."
                    : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar desactivación */}
      <ConfirmModal
        visible={confirm.visible}
        titulo="¿Desactivar usuario?"
        mensaje="El usuario no podrá volver a iniciar sesión, pero su historial continuará guardado."
        onConfirmar={confirmarDesactivacion}
        onCancelar={() =>
          setConfirm({
            visible: false,
            id: null,
            loading: false
          })
        }
        loading={confirm.loading}
      />
    </div>
  )
}
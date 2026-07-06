import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Phone,
  Pencil,
  PlusCircle,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  X
} from "lucide-react"

import { useToast } from "../context/ToastContext"
import ConfirmModal from "../components/ConfirmModal"

const API_URL = "http://localhost:3000/api/provedores"

export default function Proveedores() {
  const { toast } = useToast()

  const [proveedores, setProveedores] = useState([])
  const [vista, setVista] = useState("activos")
  const [searchTerm, setSearchTerm] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState(null)

  const [shakeForm, setShakeForm] = useState(false)

  const [confirm, setConfirm] = useState({
    visible: false,
    id: null,
    loading: false
  })

  const fetchProveedores = async () => {
    try {
      setLoading(true)
      setError(null)

      const url =
        vista === "inactivos"
          ? `${API_URL}/inactivos`
          : API_URL

      const res = await fetch(url)
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(
          data.message || "Error al cargar proveedores"
        )
      }

      setProveedores(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProveedores()
  }, [vista])

  const abrirNuevo = () => {
    setProveedorSeleccionado(null)
    setShowForm(true)
  }

  const abrirEdicion = (proveedor) => {
    setProveedorSeleccionado(proveedor)
    setShowForm(true)
  }

  const cerrarFormulario = () => {
    setShowForm(false)
    setProveedorSeleccionado(null)
  }

  const handleGuardar = async (proveedor) => {
    try {
      const editando = Boolean(proveedorSeleccionado)

      const url = editando
        ? `${API_URL}/${proveedor.id}`
        : API_URL

      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(proveedor)
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Error al ${
              editando ? "actualizar" : "crear"
            } el proveedor`
        )
      }

      toast.success(
        editando
          ? "Proveedor actualizado correctamente"
          : "Proveedor creado correctamente"
      )

      cerrarFormulario()

      if (vista !== "activos") {
        setVista("activos")
      } else {
        await fetchProveedores()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const solicitarDesactivacion = (id) => {
    setConfirm({
      visible: true,
      id,
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
        `${API_URL}/${confirm.id}/desactivar`,
        {
          method: "PATCH"
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al desactivar el proveedor"
        )
      }

      setProveedores((prev) =>
        prev.filter((p) => p.id !== confirm.id)
      )

      setConfirm({
        visible: false,
        id: null,
        loading: false
      })

      toast.success("Proveedor desactivado correctamente")
    } catch (err) {
      toast.error(err.message)

      setConfirm((prev) => ({
        ...prev,
        loading: false
      }))
    }
  }

  const reactivarProveedor = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/${id}/reactivar`,
        {
          method: "PATCH"
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al reactivar el proveedor"
        )
      }

      setProveedores((prev) =>
        prev.filter((p) => p.id !== id)
      )

      toast.success("Proveedor reactivado correctamente")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleBackdropClick = () => {
    setShakeForm(true)
    setTimeout(() => setShakeForm(false), 400)
  }

  const textoBusqueda = searchTerm.trim().toLowerCase()

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre
        ?.toLowerCase()
        .includes(textoBusqueda) ||
      proveedor.contacto
        ?.toLowerCase()
        .includes(textoBusqueda) ||
      proveedor.telefono
        ?.toLowerCase()
        .includes(textoBusqueda)
  )

  const getIniciales = (nombre) =>
    nombre
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "?"

  const whatsappUrl = (telefono) => {
    const numero = String(telefono || "").replace(/\D/g, "")
    return numero ? `https://wa.me/${numero}` : null
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-200">
              <Truck size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Proveedores
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Gestión de proveedores y contactos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNuevo}
            className="
              flex items-center justify-center gap-2
              rounded-xl bg-blue-600 px-4 py-3
              text-sm font-semibold text-white
              shadow-lg shadow-blue-200
              transition-all
              hover:-translate-y-0.5 hover:bg-blue-700
            "
          >
            <PlusCircle size={17} />
            Nuevo proveedor
          </button>
        </div>

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
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="text-slate-400" size={18} />

            <input
              type="text"
              placeholder="Buscar por empresa, contacto o teléfono..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <RefreshCw
              className="mb-3 animate-spin text-blue-600"
              size={28}
            />
            <p className="text-sm">Cargando proveedores...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchProveedores}
              className="font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {!loading &&
          !error &&
          proveedoresFiltrados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center text-slate-400">
              <Truck
                className="mx-auto mb-3 text-slate-300"
                size={40}
              />

              <p className="text-sm font-medium text-slate-500">
                No se encontraron proveedores
              </p>
            </div>
          )}

        {/* Proveedores */}
        {!loading &&
          !error &&
          proveedoresFiltrados.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {proveedoresFiltrados.map((proveedor) => {
                const whatsapp = whatsappUrl(
                  proveedor.telefono
                )

                return (
                  <motion.div
                    key={proveedor.id}
                    whileHover={{ y: -3 }}
                    className={`
                      rounded-2xl border bg-white p-5
                      shadow-sm transition-shadow
                      hover:shadow-md
                      ${
                        vista === "inactivos"
                          ? "border-slate-200 opacity-80"
                          : "border-slate-100"
                      }
                    `}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`
                          flex h-11 w-11 flex-shrink-0
                          items-center justify-center
                          rounded-xl text-sm font-bold
                          ${
                            vista === "inactivos"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        {getIniciales(proveedor.nombre)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {proveedor.nombre}
                        </h3>

                        <p className="truncate text-xs text-slate-400">
                          {proveedor.contacto ||
                            "Sin contacto asignado"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 min-h-10 text-sm text-slate-500">
                      {proveedor.telefono ? (
                        <p className="flex items-center gap-2">
                          <Phone size={14} />
                          {proveedor.telefono}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Sin teléfono
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      {whatsapp && vista === "activos" ? (
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                        >
                          <Phone size={13} />
                          WhatsApp
                        </a>
                      ) : (
                        <span />
                      )}

                      {vista === "activos" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            title="Editar proveedor"
                            onClick={() =>
                              abrirEdicion(proveedor)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            title="Desactivar proveedor"
                            onClick={() =>
                              solicitarDesactivacion(
                                proveedor.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <PowerOff size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            reactivarProveedor(proveedor.id)
                          }
                          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <RotateCcw size={14} />
                          Reactivar
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.95, y: 10 }}
              animate={
                shakeForm
                  ? {
                      x: [0, -8, 8, -6, 6, -3, 3, 0],
                      scale: 1,
                      y: 0
                    }
                  : {
                      scale: 1,
                      y: 0,
                      x: 0
                    }
              }
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormProveedor
                proveedor={proveedorSeleccionado}
                onGuardar={handleGuardar}
                onClose={cerrarFormulario}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación */}
      <ConfirmModal
        visible={confirm.visible}
        titulo="¿Desactivar proveedor?"
        mensaje="El proveedor dejará de aparecer, pero continuará guardado y podrá reactivarse."
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

function FormProveedor({
  proveedor,
  onGuardar,
  onClose
}) {
  const [form, setForm] = useState({
    nombre: proveedor?.nombre || "",
    contacto: proveedor?.contacto || "",
    telefono: proveedor?.telefono || ""
  })

  const [error, setError] = useState("")

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    onGuardar({
      ...form,
      id: proveedor?.id
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            {proveedor
              ? "Editar proveedor"
              : "Nuevo proveedor"}
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Completá la información del proveedor
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
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

        <div>
          <label className={labelClass}>
            Nombre o empresa
          </label>

          <input
            className={inputClass}
            placeholder="Distribuidora Norte"
            value={form.nombre}
            onChange={(e) => {
              setForm({
                ...form,
                nombre: e.target.value
              })
              setError("")
            }}
          />
        </div>

        <div>
          <label className={labelClass}>
            Persona de contacto
          </label>

          <input
            className={inputClass}
            placeholder="Juan Pérez"
            value={form.contacto}
            onChange={(e) =>
              setForm({
                ...form,
                contacto: e.target.value
              })
            }
          />
        </div>

        <div>
          <label className={labelClass}>
            Teléfono
          </label>

          <input
            className={inputClass}
            placeholder="5491134567890"
            value={form.telefono}
            onChange={(e) =>
              setForm({
                ...form,
                telefono: e.target.value
              })
            }
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {proveedor
              ? "Guardar cambios"
              : "Crear proveedor"}
          </button>
        </div>
      </form>
    </div>
  )
}
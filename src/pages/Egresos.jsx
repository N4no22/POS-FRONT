import { useEffect, useState } from "react"
import {
  Ban,
  CalendarDays,
  PlusCircle,
  TrendingDown,
  X
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

const API_URL = "http://localhost:3000/api/egresos"

const CATEGORIAS = [
  { value: "limpieza", label: "🧹 Limpieza" },
  { value: "servicios", label: "💡 Servicios" },
  { value: "insumos", label: "📦 Insumos" },
  { value: "transporte", label: "🚗 Transporte" },
  {
    value: "mantenimiento",
    label: "🔧 Mantenimiento"
  },
  { value: "personal", label: "👤 Personal" },
  { value: "general", label: "📝 General" }
]

export default function Egresos() {
  const {
    user,
    arqueoActivo,
    verificarArqueoActivo
  } = useAuth()

  const { toast } = useToast()

  const [vista, setVista] = useState("vigentes")
  const [egresos, setEgresos] = useState([])
  const [loading, setLoading] = useState(true)

  // Nuevo egreso
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    categoria: "general"
  })
  const [loadingForm, setLoadingForm] =
    useState(false)

  // Anulación
  const [showAnulacion, setShowAnulacion] =
    useState(false)
  const [egresoSeleccionado, setEgresoSeleccionado] =
    useState(null)
  const [motivoAnulacion, setMotivoAnulacion] =
    useState("")
  const [errorAnulacion, setErrorAnulacion] =
    useState("")
  const [loadingAnulacion, setLoadingAnulacion] =
    useState(false)

  useEffect(() => {
    verificarArqueoActivo()
  }, [])

  useEffect(() => {
    fetchEgresos()
  }, [vista, arqueoActivo?.id])

  const fetchEgresos = async () => {
    try {
      setLoading(true)

      let url

      if (vista === "anulados") {
        url = `${API_URL}/anulados`
      } else if (arqueoActivo) {
        url = `${API_URL}/arqueo/${arqueoActivo.id}`
      } else {
        url = API_URL
      }

      const res = await fetch(url)
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al cargar los egresos"
        )
      }

      setEgresos(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setEgresos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.descripcion.trim()) {
      toast.error("La descripción es obligatoria")
      return
    }

    if (
      !form.monto ||
      Number(form.monto) <= 0
    ) {
      toast.error("Ingresá un monto válido")
      return
    }

    try {
      setLoadingForm(true)

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          descripcion: form.descripcion.trim(),
          monto: Number(form.monto),
          categoria: form.categoria,
          usuario_id: user?.id,
          arqueo_id: arqueoActivo?.id || null
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al registrar el egreso"
        )
      }

      setForm({
        descripcion: "",
        monto: "",
        categoria: "general"
      })

      setShowForm(false)
      setVista("vigentes")

      await fetchEgresos()
      await verificarArqueoActivo()

      toast.success(
        "Egreso registrado correctamente"
      )
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingForm(false)
    }
  }

  const abrirAnulacion = (egreso) => {
    setEgresoSeleccionado(egreso)
    setMotivoAnulacion("")
    setErrorAnulacion("")
    setShowAnulacion(true)
  }

  const cerrarAnulacion = () => {
    if (loadingAnulacion) return

    setShowAnulacion(false)
    setEgresoSeleccionado(null)
    setMotivoAnulacion("")
    setErrorAnulacion("")
  }

  const confirmarAnulacion = async () => {
    const motivo = motivoAnulacion.trim()

    if (!motivo) {
      setErrorAnulacion(
        "El motivo de anulación es obligatorio"
      )
      return
    }

    try {
      setLoadingAnulacion(true)
      setErrorAnulacion("")

      const res = await fetch(
        `${API_URL}/${egresoSeleccionado.id}/anular`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ motivo })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Error al anular el egreso"
        )
      }

      setEgresos((prev) =>
        prev.filter(
          (egreso) =>
            egreso.id !== egresoSeleccionado.id
        )
      )

      cerrarAnulacion()
      await verificarArqueoActivo()

      toast.success("Egreso anulado correctamente")
    } catch (error) {
      setErrorAnulacion(error.message)
    } finally {
      setLoadingAnulacion(false)
    }
  }

  const puedeAnular = (egreso) => {
    if (!egreso.arqueo_id) return true
    if (!arqueoActivo) return false

    return (
      String(egreso.arqueo_id) ===
      String(arqueoActivo.id)
    )
  }

  const totalEgresos = egresos.reduce(
    (total, egreso) =>
      total + Number(egreso.monto || 0),
    0
  )

  const getCategoriaLabel = (valor) =>
    CATEGORIAS.find(
      (categoria) => categoria.value === valor
    )?.label || valor

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500 p-2.5 text-white shadow-lg shadow-red-200">
              <TrendingDown size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Egresos
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Registro de gastos y salidas de caja
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 hover:bg-red-600"
          >
            <PlusCircle size={17} />
            Nuevo egreso
          </button>
        </div>

        {/* Vigentes y anulados */}
        <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setVista("vigentes")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              vista === "vigentes"
                ? "bg-red-500 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Vigentes
          </button>

          <button
            type="button"
            onClick={() => setVista("anulados")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              vista === "anulados"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Anulados
          </button>
        </div>

        {/* Estadísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {vista === "vigentes"
                ? "Total egresos"
                : "Monto anulado"}
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                vista === "vigentes"
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              $
              {totalEgresos.toLocaleString("es-AR", {
                maximumFractionDigits: 2
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Registros
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {egresos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Turno actual
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {arqueoActivo
                ? `Arqueo #${arqueoActivo.id}`
                : "Sin arqueo abierto"}
            </p>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">
            Cargando egresos...
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {egresos.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-slate-400">
                <TrendingDown
                  size={36}
                  className="mb-3 text-slate-200"
                />

                <p className="text-sm">
                  {vista === "vigentes"
                    ? "Sin egresos registrados"
                    : "Sin egresos anulados"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Descripción
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Categoría
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Fecha
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Monto
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {vista === "vigentes"
                          ? "Acción"
                          : "Anulación"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {egresos.map((egreso) => (
                      <tr
                        key={egreso.id}
                        className={`border-t border-slate-100 ${
                          vista === "anulados"
                            ? "bg-slate-50/50 opacity-80"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">
                            {egreso.descripcion}
                          </p>

                          {vista === "anulados" &&
                            egreso.motivo_anulacion && (
                              <p className="mt-1 text-xs text-slate-400">
                                Motivo:{" "}
                                {egreso.motivo_anulacion}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {getCategoriaLabel(
                              egreso.categoria
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={13} />

                            {new Date(
                              egreso.fecha
                            ).toLocaleDateString(
                              "es-AR"
                            )}
                          </div>
                        </td>

                        <td
                          className={`px-5 py-3.5 font-bold ${
                            vista === "vigentes"
                              ? "text-red-600"
                              : "text-slate-500 line-through"
                          }`}
                        >
                          -$
                          {Number(
                            egreso.monto
                          ).toLocaleString("es-AR")}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {vista === "vigentes" ? (
                            <button
                              type="button"
                              disabled={
                                !puedeAnular(egreso)
                              }
                              title={
                                puedeAnular(egreso)
                                  ? "Anular egreso"
                                  : "No se puede anular porque el arqueo está cerrado"
                              }
                              onClick={() =>
                                abrirAnulacion(egreso)
                              }
                              className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Ban size={15} />
                            </button>
                          ) : (
                            <div className="text-xs text-slate-400">
                              {egreso.fecha_anulacion
                                ? new Date(
                                    egreso.fecha_anulacion
                                  ).toLocaleDateString(
                                    "es-AR"
                                  )
                                : "Anulado"}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-3 text-sm font-bold text-slate-700"
                      >
                        TOTAL
                      </td>

                      <td
                        className={`px-5 py-3 font-bold ${
                          vista === "vigentes"
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        -$
                        {totalEgresos.toLocaleString(
                          "es-AR"
                        )}
                      </td>

                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nuevo egreso */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Nuevo egreso
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Registrá un gasto o salida de caja
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 px-6 py-5"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Descripción
                  </label>

                  <input
                    type="text"
                    autoFocus
                    placeholder="Ej: Bolsas de limpieza"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descripcion: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Monto
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={form.monto}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            monto: e.target.value
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Categoría
                    </label>

                    <select
                      value={form.categoria}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoria: e.target.value
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-400"
                    >
                      {CATEGORIAS.map((categoria) => (
                        <option
                          key={categoria.value}
                          value={categoria.value}
                        >
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="w-1/2 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {loadingForm
                      ? "Guardando..."
                      : "Registrar egreso"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anular egreso */}
      <AnimatePresence>
        {showAnulacion && egresoSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={cerrarAnulacion}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Anular egreso
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {egresoSeleccionado.descripcion}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarAnulacion}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  El egreso seguirá guardado y su monto se
                  revertirá del arqueo actual.
                </div>

                {errorAnulacion && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorAnulacion}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Motivo de anulación
                  </label>

                  <textarea
                    autoFocus
                    rows={3}
                    maxLength={300}
                    value={motivoAnulacion}
                    onChange={(e) => {
                      setMotivoAnulacion(e.target.value)
                      setErrorAnulacion("")
                    }}
                    placeholder="Ej: Egreso cargado por error..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {motivoAnulacion.length}/300
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cerrarAnulacion}
                    className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmarAnulacion}
                    disabled={loadingAnulacion}
                    className="w-1/2 rounded-xl bg-amber-500 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {loadingAnulacion
                      ? "Anulando..."
                      : "Confirmar anulación"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
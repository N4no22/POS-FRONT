import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Barcode,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Package,
  Pencil,
  PlusCircle,
  PowerOff,
  RotateCcw,
  Search,
  X
} from "lucide-react"

import { useToast } from "../context/ToastContext"
import ConfirmModal from "../components/ConfirmModal"
import FormProducto from "../components/FormProducto"

const API_URL = "http://localhost:3000/api/productos"
const PRODUCTOS_POR_PAGINA = 20

const paginationButtonClass = `
  flex h-9 w-9 items-center justify-center
  rounded-xl border border-slate-200
  text-slate-500 transition-all
  hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600
  disabled:cursor-not-allowed disabled:opacity-40
`

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.4 }
  }
}

export default function Productos() {
  const { toast } = useToast()

  const [productos, setProductos] = useState([])
  const [vista, setVista] = useState("activos")
  const [searchTerm, setSearchTerm] = useState("")

  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null)

  const [shakeForm, setShakeForm] = useState(false)

  const [confirm, setConfirm] = useState({
    visible: false,
    id: null,
    loading: false
  })

  const fetchProductos = async ({
    paginaActual = pagina,
    busqueda = searchTerm,
    signal
  } = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        paginado: "true",
        pagina: String(paginaActual),
        limite: String(PRODUCTOS_POR_PAGINA),
        buscar: busqueda.trim()
      })

      const endpoint =
        vista === "inactivos"
          ? `${API_URL}/inactivos?${params}`
          : `${API_URL}?${params}`

      const res = await fetch(endpoint, { signal })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudieron cargar los productos"
        )
      }

      setProductos(
        Array.isArray(data.productos)
          ? data.productos
          : []
      )

      setTotal(Number(data.total) || 0)
      setTotalPaginas(
        Number(data.totalPaginas) || 1
      )
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message)
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(
      () => {
        fetchProductos({
          paginaActual: pagina,
          busqueda: searchTerm,
          signal: controller.signal
        })
      },
      searchTerm.trim() ? 300 : 0
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [pagina, searchTerm, vista])

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista)
    setSearchTerm("")
    setPagina(1)
  }

  const cambiarBusqueda = (event) => {
    setSearchTerm(event.target.value)
    setPagina(1)
  }

  const limpiarBusqueda = () => {
    setSearchTerm("")
    setPagina(1)
  }

  const abrirNuevoProducto = () => {
    setProductoSeleccionado(null)
    setShowForm(true)
  }

  const abrirEdicion = (producto) => {
    setProductoSeleccionado(producto)
    setShowForm(true)
  }

  const cerrarFormulario = () => {
    setShowForm(false)
    setProductoSeleccionado(null)
  }

  const handleGuardar = async (producto) => {
    try {
      if (productoSeleccionado) {
        const res = await fetch(
          `${API_URL}/${producto.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
          }
        )

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(
            data.message ||
              "No se pudo actualizar el producto"
          )
        }

        toast.success(
          "Producto actualizado correctamente"
        )
      } else {
        toast.success("Producto creado correctamente")
      }

      cerrarFormulario()

      if (vista !== "activos") {
        cambiarVista("activos")
      } else {
        await fetchProductos()
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
            "No se pudo desactivar el producto"
        )
      }

      setConfirm({
        visible: false,
        id: null,
        loading: false
      })

      toast.success(
        "Producto desactivado correctamente"
      )

      if (productos.length === 1 && pagina > 1) {
        setPagina((actual) => actual - 1)
      } else {
        await fetchProductos()
      }
    } catch (err) {
      toast.error(err.message)

      setConfirm((prev) => ({
        ...prev,
        loading: false
      }))
    }
  }

  const reactivarProducto = async (id) => {
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
            "No se pudo reactivar el producto"
        )
      }

      toast.success(
        "Producto reactivado correctamente"
      )

      if (productos.length === 1 && pagina > 1) {
        setPagina((actual) => actual - 1)
      } else {
        await fetchProductos()
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const triggerShake = () => {
    setShakeForm(true)

    setTimeout(() => {
      setShakeForm(false)
    }, 400)
  }

  const primerResultado =
    total === 0
      ? 0
      : (pagina - 1) * PRODUCTOS_POR_PAGINA + 1

  const ultimoResultado = Math.min(
    pagina * PRODUCTOS_POR_PAGINA,
    total
  )

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Encabezado */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-200">
              <Package size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Productos
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Administración de catálogo e inventario
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNuevoProducto}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <PlusCircle size={17} />
            Nuevo producto
          </button>
        </div>

        {/* Activos e inactivos */}
        <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => cambiarVista("activos")}
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
            onClick={() => cambiarVista("inactivos")}
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
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search
              className="flex-shrink-0 text-slate-400"
              size={19}
            />

            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={cambiarBusqueda}
              placeholder="Buscar por nombre o código de barras..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {searchTerm && (
              <button
                type="button"
                title="Limpiar búsqueda"
                onClick={limpiarBusqueda}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {searchTerm.trim()
                ? `Resultados para “${searchTerm.trim()}”`
                : vista === "activos"
                ? "Catálogo de productos activos"
                : "Productos inactivos"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {total} producto
              {total !== 1 ? "s" : ""} encontrado
              {total !== 1 ? "s" : ""}
            </p>
          </div>

          {!loading && total > 0 && (
            <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
              Mostrando {primerResultado}–
              {ultimoResultado} de {total}
            </span>
          )}
        </div>

        {/* Contenedor */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2
                className="mb-3 animate-spin text-blue-600"
                size={30}
              />

              <p className="text-sm">
                Cargando productos...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 rounded-full bg-red-50 p-3 text-red-500">
                <X size={24} />
              </div>

              <p className="mb-4 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchProductos()}
                className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            productos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-300">
                  <Package size={38} />
                </div>

                <p className="font-medium text-slate-600">
                  No encontramos productos
                </p>

                <p className="mt-1 text-xs">
                  Probá utilizando otro nombre o código
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            productos.length > 0 && (
              <>
                <div className="hidden grid-cols-[minmax(0,1fr)_150px_130px_140px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
                  <span>Producto</span>
                  <span>Stock</span>
                  <span className="text-right">
                    Precio
                  </span>
                  <span className="text-right">
                    Acciones
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {productos.map((producto) => (
                      <motion.div
                        layout
                        key={producto.id}
                        initial={{
                          opacity: 0,
                          y: 5
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        exit={{
                          opacity: 0
                        }}
                        className={`grid gap-4 px-5 py-4 transition-colors md:grid-cols-[minmax(0,1fr)_150px_130px_140px] md:items-center ${
                          vista === "activos"
                            ? "hover:bg-blue-50/40"
                            : "bg-slate-50/30 opacity-80 hover:bg-slate-50"
                        }`}
                      >
                        {/* Producto */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            {producto.codigo_barras ? (
                              <Barcode size={20} />
                            ) : (
                              <Boxes size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {producto.nombre}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>
                                {producto.codigo_barras ||
                                  "Sin código"}
                              </span>

                              <span>•</span>

                              <span className="capitalize">
                                {producto.tipo_venta ||
                                  "unidad"}
                              </span>

                              {vista === "inactivos" && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-amber-600">
                                    Inactivo
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stock */}
                        <div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              Number(producto.stock) === 0
                                ? "bg-red-50 text-red-600"
                                : Number(producto.stock) <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {Number(producto.stock) === 0
                              ? "Sin stock"
                              : `${Number(
                                  producto.stock
                                ).toLocaleString(
                                  "es-AR",
                                  {
                                    maximumFractionDigits: 3
                                  }
                                )} ${
                                  producto.unidad_medida ||
                                  "u."
                                }`}
                          </span>
                        </div>

                        {/* Precio */}
                        <div className="font-bold text-blue-600 md:text-right">
                          $
                          {Number(
                            producto.precio
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 md:justify-end">
                          {vista === "activos" ? (
                            <>
                              <button
                                type="button"
                                title="Editar producto"
                                onClick={() =>
                                  abrirEdicion(producto)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                title="Desactivar producto"
                                onClick={() =>
                                  solicitarDesactivacion(
                                    producto.id
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                              >
                                <PowerOff size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                reactivarProducto(
                                  producto.id
                                )
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <RotateCcw size={14} />
                              Reactivar
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
        </div>

        {/* Paginación */}
        {!loading && !error && total > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
            <p className="text-xs text-slate-500">
              Página{" "}
              <strong className="text-slate-700">
                {pagina}
              </strong>{" "}
              de{" "}
              <strong className="text-slate-700">
                {totalPaginas}
              </strong>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Primera página"
                disabled={pagina === 1}
                onClick={() => setPagina(1)}
                className={paginationButtonClass}
              >
                <ChevronsLeft size={17} />
              </button>

              <button
                type="button"
                title="Página anterior"
                disabled={pagina === 1}
                onClick={() =>
                  setPagina((actual) =>
                    Math.max(1, actual - 1)
                  )
                }
                className={paginationButtonClass}
              >
                <ChevronLeft size={17} />
              </button>

              <span className="mx-2 flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white shadow-md shadow-blue-200">
                {pagina}
              </span>

              <button
                type="button"
                title="Página siguiente"
                disabled={pagina >= totalPaginas}
                onClick={() =>
                  setPagina((actual) =>
                    Math.min(
                      totalPaginas,
                      actual + 1
                    )
                  )
                }
                className={paginationButtonClass}
              >
                <ChevronRight size={17} />
              </button>

              <button
                type="button"
                title="Última página"
                disabled={pagina >= totalPaginas}
                onClick={() =>
                  setPagina(totalPaginas)
                }
                className={paginationButtonClass}
              >
                <ChevronsRight size={17} />
              </button>
            </div>
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
            onClick={triggerShake}
          >
            <motion.div
              className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              variants={shakeVariants}
              animate={
                shakeForm ? "shake" : "idle"
              }
              onClick={(e) => e.stopPropagation()}
            >
              <FormProducto
                key={
                  productoSeleccionado
                    ? productoSeleccionado.id
                    : "nuevo"
                }
                producto={productoSeleccionado}
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
        titulo="¿Desactivar producto?"
        mensaje="El producto dejará de aparecer en ventas, pero conservará su información y stock."
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
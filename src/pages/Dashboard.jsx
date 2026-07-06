import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle,
  CircleDollarSign,
  CreditCard,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

import { useAuth } from "../context/AuthContext"

const BASE_URL = "http://localhost:3000/api/dashboard"

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("es-AR", {
    maximumFractionDigits: 2
  })

const formatMoney = (value) => `$${formatNumber(value)}`

const fechaActual = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date())

export default function Dashboard() {
  const { user, arqueoActivo } = useAuth()

  const [resumen, setResumen] = useState(null)
  const [ventasSemana, setVentasSemana] = useState([])
  const [topProductos, setTopProductos] = useState([])
  const [ultimasVentas, setUltimasVentas] = useState([])
  const [bajoStock, setBajoStock] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [masVendidoHoy, setMasVendidoHoy] = useState(null)
  const [cantVentasHoy, setCantVentasHoy] = useState(0)

  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState("")

  const actualizacionEnCurso = useRef(false)

  const obtenerDatos = useCallback(async (endpoint) => {
    const respuesta = await fetch(`${BASE_URL}/${endpoint}`)

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${endpoint}`)
    }

    return respuesta.json()
  }, [])

  const cargarDashboard = useCallback(
    async ({
      cargaInicial = false,
      mostrarIndicador = false
    } = {}) => {
      if (actualizacionEnCurso.current) return

      actualizacionEnCurso.current = true

      try {
        if (cargaInicial) setLoading(true)
        if (mostrarIndicador) setActualizando(true)

        setError("")

        const [
          dataResumen,
          dataSemana,
          dataTop,
          dataUltimas,
          dataBajoStock,
          dataSinStock,
          dataMasVendido,
          dataCantidad
        ] = await Promise.all([
          obtenerDatos("resumen"),
          obtenerDatos("ventas-semana"),
          obtenerDatos("top-productos"),
          obtenerDatos("ultimas-ventas"),
          obtenerDatos("bajo-stock"),
          obtenerDatos("sin-stock"),
          obtenerDatos("mas-vendido-hoy"),
          obtenerDatos("cantidad-ventas-hoy")
        ])

        setResumen(dataResumen)

        setVentasSemana(
          Array.isArray(dataSemana) ? dataSemana : []
        )

        setTopProductos(
          Array.isArray(dataTop) ? dataTop : []
        )

        setUltimasVentas(
          Array.isArray(dataUltimas) ? dataUltimas : []
        )

        setBajoStock(
          Array.isArray(dataBajoStock)
            ? dataBajoStock
            : []
        )

        setSinStock(
          Array.isArray(dataSinStock) ? dataSinStock : []
        )

        setMasVendidoHoy(dataMasVendido || null)

        setCantVentasHoy(
          Number(dataCantidad?.cantidad) || 0
        )
      } catch (err) {
        console.error("Error dashboard:", err)

        setError(
          "No pudimos actualizar la información del negocio"
        )
      } finally {
        actualizacionEnCurso.current = false
        setLoading(false)
        setActualizando(false)
      }
    },
    [obtenerDatos]
  )

  useEffect(() => {
    cargarDashboard({ cargaInicial: true })

    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") {
        cargarDashboard()
      }
    }, 5000)

    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") {
        cargarDashboard()
      }
    }

    const actualizarAlEnfocar = () => {
      cargarDashboard()
    }

    document.addEventListener(
      "visibilitychange",
      actualizarAlVolver
    )

    window.addEventListener("focus", actualizarAlEnfocar)

    return () => {
      clearInterval(intervalo)

      document.removeEventListener(
        "visibilitychange",
        actualizarAlVolver
      )

      window.removeEventListener(
        "focus",
        actualizarAlEnfocar
      )
    }
  }, [cargarDashboard])

  const metodoBadge = (metodo) => {
    const estilos = {
      efectivo: "bg-emerald-50 text-emerald-700",
      transferencia: "bg-blue-50 text-blue-700",
      fiado: "bg-amber-50 text-amber-700",
      tarjeta: "bg-violet-50 text-violet-700"
    }

    return (
      estilos[metodo] ||
      "bg-slate-100 text-slate-600"
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="mx-auto mb-3 animate-spin text-blue-600"
            size={30}
          />

          <p className="text-sm text-slate-400">
            Preparando el resumen...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm text-slate-500">
              Hola, {user?.nombre || "usuario"}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resumen del negocio
            </h1>

            <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-slate-400">
              <CalendarDays size={14} />
              {fechaActual}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                arqueoActivo
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {arqueoActivo
                ? `Caja abierta · #${arqueoActivo.id}`
                : "Sin caja abierta"}
            </span>

            <button
              type="button"
              onClick={() =>
                cargarDashboard({
                  mostrarIndicador: true
                })
              }
              disabled={actualizando}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
              title="Actualizar información"
            >
              <RefreshCw
                size={16}
                className={
                  actualizando ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                cargarDashboard({
                  mostrarIndicador: true
                })
              }
              className="font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-lg md:col-span-2"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10" />
            <div className="absolute -bottom-14 right-12 h-32 w-32 rounded-full bg-blue-500/10" />

            <div className="relative">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Ventas de hoy
                  </p>

                  <p className="mt-2 text-4xl font-bold tracking-tight">
                    {formatMoney(resumen?.totalVentas)}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
                  <TrendingUp size={22} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart
                    size={15}
                    className="text-blue-400"
                  />

                  <span className="text-sm text-slate-300">
                    {cantVentasHoy} operación
                    {cantVentasHoy !== 1 ? "es" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpRight
                    size={15}
                    className="text-emerald-400"
                  />

                  <span className="text-sm text-slate-300">
                    Actividad del día
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <MetricCard
            icon={Banknote}
            label="Efectivo"
            value={formatMoney(resumen?.efectivoHoy)}
            description="Cobrado durante el día"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
            icon={CreditCard}
            label="Transferencias"
            value={formatMoney(
              resumen?.transferenciaHoy
            )}
            description="Ingresos por transferencia"
            iconClass="bg-blue-50 text-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SmallMetric
            icon={Users}
            label="Deuda pendiente"
            value={formatMoney(resumen?.totalDeuda)}
            detail="Total adeudado por clientes"
            className="text-red-600"
          />

          <SmallMetric
            icon={AlertTriangle}
            label="Stock bajo"
            value={resumen?.productosBajoStock || 0}
            detail="Productos que requieren atención"
            className="text-amber-600"
          />

          <SmallMetric
            icon={XCircle}
            label="Sin stock"
            value={resumen?.sinStock || 0}
            detail="Productos agotados"
            className="text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHeader
              icon={TrendingUp}
              title="Ventas de los últimos 7 días"
              description="Facturación diaria"
            />

            {ventasSemana.length === 0 ? (
              <EmptyState text="Todavía no hay datos suficientes" />
            ) : (
              <div className="mt-5 h-[270px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={ventasSemana}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="dia"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#94a3b8"
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={55}
                      tick={{
                        fontSize: 12,
                        fill: "#94a3b8"
                      }}
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `$${Math.round(value / 1000)}k`
                          : `$${value}`
                      }
                    />

                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(value) => [
                        formatMoney(value),
                        "Total"
                      ]}
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "13px",
                        boxShadow:
                          "0 8px 20px rgba(15,23,42,.08)"
                      }}
                    />

                    <Bar
                      dataKey="total"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel className="flex flex-col">
            <PanelHeader
              icon={Star}
              title="Producto del día"
              description="El producto con mayor salida"
              iconClass="text-amber-500"
            />

            {masVendidoHoy ? (
              <div className="flex flex-1 flex-col justify-center py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={27} />
                </div>

                <p className="mx-auto max-w-[240px] text-base font-semibold leading-tight text-slate-900">
                  {masVendidoHoy.nombre}
                </p>

                <p className="mt-3 text-3xl font-bold text-blue-600">
                  {formatNumber(masVendidoHoy.cantidad)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {masVendidoHoy.unidad_medida} vendidos hoy
                </p>
              </div>
            ) : (
              <EmptyState text="Todavía no hubo ventas hoy" />
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Panel>
            <PanelHeader
              icon={TrendingUp}
              title="Productos más vendidos"
              description="Rendimiento del último mes"
            />

            {topProductos.length === 0 ? (
              <EmptyState text="Sin información disponible" />
            ) : (
              <div className="mt-5 space-y-4">
                {topProductos
                  .slice(0, 5)
                  .map((producto, index) => {
                    const maximo = Number(
                      topProductos[0]?.cantidad || 1
                    )

                    const porcentaje = Math.min(
                      100,
                      (Number(producto.cantidad) /
                        maximo) *
                        100
                    )

                    return (
                      <div key={producto.id || index}>
                        <div className="mb-1.5 flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                              {index + 1}
                            </span>

                            <span className="truncate text-sm font-medium text-slate-700">
                              {producto.nombre}
                            </span>
                          </div>

                          <span className="flex-shrink-0 text-sm font-semibold text-blue-600">
                            {formatNumber(
                              producto.cantidad
                            )}
                          </span>
                        </div>

                        <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${porcentaje}%`
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              icon={ShoppingCart}
              title="Últimas ventas"
              description="Actividad reciente"
            />

            {ultimasVentas.length === 0 ? (
              <EmptyState text="No hay ventas recientes" />
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {ultimasVentas
                  .slice(0, 6)
                  .map((venta) => (
                    <div
                      key={venta.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {venta.cliente ||
                            "Consumidor final"}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${metodoBadge(
                            venta.metodo
                          )}`}
                        >
                          {venta.metodo}
                        </span>
                      </div>

                      <p className="flex-shrink-0 text-sm font-bold text-slate-900">
                        {formatMoney(venta.total)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              icon={AlertTriangle}
              title="Productos con stock bajo"
              description="Existencias iguales o menores a 5"
              iconClass="text-amber-500"
            />

            {bajoStock.length === 0 ? (
              <HealthyInventory text="No hay productos con stock bajo" />
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {bajoStock
                  .slice(0, 6)
                  .map((producto, index) => (
                    <StockRow
                      key={producto.id || index}
                      producto={producto}
                      variant="warning"
                    />
                  ))}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              icon={XCircle}
              title="Productos agotados"
              description="Productos sin existencias"
              iconClass="text-red-500"
            />

            {sinStock.length === 0 ? (
              <HealthyInventory text="No hay productos agotados" />
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {sinStock
                  .slice(0, 6)
                  .map((producto, index) => (
                    <StockRow
                      key={producto.id || index}
                      producto={producto}
                      variant="danger"
                    />
                  ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </motion.div>
  )
}

function SmallMetric({
  icon: Icon,
  label,
  value,
  detail,
  className
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className={`text-xl font-bold ${className}`}>
          {value}
        </p>

        <p className="truncate text-xs text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  )
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  description,
  iconClass = "text-blue-600"
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${iconClass}`}>
        <Icon size={17} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
      <CircleDollarSign
        className="mb-3 text-slate-200"
        size={34}
      />

      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  )
}

function HealthyInventory({ text }) {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
      <CheckCircle
        className="mb-3 text-emerald-400"
        size={32}
      />

      <p className="text-sm font-medium text-slate-600">
        Inventario en orden
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  )
}

function StockRow({ producto, variant }) {
  const danger = variant === "danger"

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-500"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Package size={17} />
        </div>

        <p className="truncate text-sm font-medium text-slate-700">
          {producto.nombre}
        </p>
      </div>

      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          danger
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {danger
          ? "Agotado"
          : `${formatNumber(producto.stock)} ${
              producto.unidad_medida || ""
            }`}
      </span>
    </div>
  )
}
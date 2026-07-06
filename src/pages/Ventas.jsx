import { useState, useEffect, useRef } from "react"
import { ShoppingCart, Search, CheckCircle, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

const BASE_URL = "http://localhost:3000/api"

// ─── Animación shake reutilizable ────────────────────────────────────────────
const shakeVariants = {
  idle:  { x: 0 },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } },
}

export default function Ventas() {
  const { user, arqueoActivo } = useAuth()
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState(null)
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [busqueda, setBusqueda] = useState("")

  const [productoGranel, setProductoGranel] = useState(null)
  const [cantidadGranel, setCantidadGranel] = useState("")
  const [modoGranel, setModoGranel] = useState("cantidad")

  const [modalPago, setModalPago] = useState(false)
  const [montoPagado, setMontoPagado] = useState("")

  const [loading, setLoading] = useState(false)
  const [ventaExitosa, setVentaExitosa] = useState(false)
  const [error, setError] = useState(null)

  // ← Estados shake para cada modal
  const [shakeGranel, setShakeGranel] = useState(false)
  const [shakePago, setShakePago] = useState(false)

  const inputRef = useRef(null)

  const triggerShake = (setter) => {
    setter(true)
    setTimeout(() => setter(false), 400)
  }
useEffect(() => {
  const texto = busqueda.trim()

  if (!texto) {
    setProductos([])
    return
  }

  const controller = new AbortController()

  const timer = setTimeout(() => {
    fetch(
      `${BASE_URL}/productos?buscar=${encodeURIComponent(texto)}`,
      { signal: controller.signal }
    )
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setProductos(data))
      .catch(error => {
        if (error.name !== "AbortError") {
          setError("Error al buscar productos")
        }
      })
  }, 300)

  return () => {
    clearTimeout(timer)
    controller.abort()
  }
}, [busqueda])
  useEffect(() => {

    fetch(`${BASE_URL}/fiadores`)
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(() => setError("Error al cargar clientes"))
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  const agregarProducto = (producto) => {
    if (Number(producto.stock) <= 0) return setError("Producto sin stock")

    if (producto.tipo_venta === "peso") {
      setProductoGranel(producto)
      setCantidadGranel("")
      return
    }

    const existe = carrito.find(i => i.producto_id === producto.id)
    if (existe) {
      if (existe.cantidad >= Number(producto.stock)) return setError("Stock insuficiente")
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        id: Date.now() + Math.random(),
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: Number(producto.precio),
        cantidad: 1,
        unidad_medida: producto.unidad_medida || "unidad"
      }])
    }
  }

  const confirmarGranel = () => {
    let cantidadFinal = 0
    if (modoGranel === "cantidad") {
      cantidadFinal = parseFloat(cantidadGranel)
    } else {
      cantidadFinal = parseFloat(cantidadGranel) / Number(productoGranel.precio)
    }

    if (!cantidadFinal || cantidadFinal <= 0) return setError("Valor inválido")
    if (cantidadFinal > Number(productoGranel.stock)) return setError("Stock insuficiente")

    const existe = carrito.find(i => i.producto_id === productoGranel.id)
    if (existe) {
      setCarrito(carrito.map(item =>
        item.producto_id === productoGranel.id
          ? { ...item, cantidad: item.cantidad + cantidadFinal }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        id: Date.now() + Math.random(),
        producto_id: productoGranel.id,
        nombre: productoGranel.nombre,
        precio_unitario: Number(productoGranel.precio),
        cantidad: cantidadFinal,
        unidad_medida: productoGranel.unidad_medida || "kg"
      }])
    }

    setProductoGranel(null)
    setCantidadGranel("")
  }

  const quitarProducto = (id) => setCarrito(carrito.filter(i => i.id !== id))

  const total = carrito.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0)
  const vuelto = Number(montoPagado) - total

  const confirmarVenta = () => {
    setError(null)
    if (carrito.length === 0) return setError("El carrito está vacío")
    if (metodoPago === "fiado" && !cliente) return setError("Seleccioná un cliente para venta fiada")
    if (metodoPago === "efectivo") { setModalPago(true); return }
    finalizarVenta(0)
  }

  const finalizarVenta = async (pagado) => {
    setLoading(true)
    setError(null)

    const ventaPayload = {
      venta: {
        fecha: new Date().toISOString(),
        cliente_id: cliente?.id || null,
        metodo_pago: metodoPago,
        estado: metodoPago === "fiado" ? "pendiente" : "pagado",
        total,
        saldo_pendiente: metodoPago === "fiado" ? total : 0,
        usuario_id: user?.id || 1,
        arqueo_id: arqueoActivo?.id || null
      },
      detalles: carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      })),
      ...(metodoPago === "fiado" && { pagoFiado: { metodo_pago: "fiado" } })
    }

    try {
      const res = await fetch(`${BASE_URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaPayload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Error al procesar la venta")
      }

      setProductos(prev => prev.map(p => {
        const item = carrito.find(i => i.producto_id === p.id)
        if (!item) return p
        return { ...p, stock: Number(p.stock) - item.cantidad }
      }))

      setCarrito([])
      setCliente(null)
      setMetodoPago("efectivo")
      setMontoPagado("")
      setModalPago(false)
      setVentaExitosa(true)
      setTimeout(() => setVentaExitosa(false), 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo_barras || "").includes(busqueda)
  )

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">

      {/* ── Panel productos ──────────────────────────────────────────────── */}
      <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col overflow-hidden h-[60vh] md:h-screen">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingCart className="text-blue-600" size={22} />
          <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 shadow-sm">
          <Search className="text-gray-400" size={16} />
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            placeholder="Buscar o escanear código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const porCodigo = productos.find(p => p.codigo_barras === busqueda.trim())
                if (porCodigo) { agregarProducto(porCodigo); setBusqueda("") }
                else if (productosFiltrados.length === 1) { agregarProducto(productosFiltrados[0]); setBusqueda("") }
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pb-2">
          {productosFiltrados.map(prod => (
            <div
              key={prod.id}
              onClick={() => agregarProducto(prod)}
              className={`bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer select-none ${
                Number(prod.stock) <= 0
                  ? "opacity-40 cursor-not-allowed border-gray-100"
                  : "hover:shadow-md hover:-translate-y-0.5 border-gray-100 active:scale-95"
              }`}
            >
              <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">{prod.nombre}</h3>
              <p className="text-blue-600 font-semibold">${Number(prod.precio).toLocaleString("es-AR")}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  Number(prod.stock) <= 0 ? "bg-red-50 text-red-500" :
                  Number(prod.stock) <= 5 ? "bg-yellow-50 text-yellow-600" :
                  "bg-green-50 text-green-600"
                }`}>
                  {Number(prod.stock) <= 0
                    ? "Sin stock"
                    : `${Number(prod.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} ${prod.unidad_medida || "u."}`}
                </span>
                <span className={`text-xs font-medium ${prod.tipo_venta === "peso" ? "text-purple-500" : "text-gray-400"}`}>
                  {prod.tipo_venta === "peso" ? "⚖ Granel" : "📦 Unidad"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel carrito ────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/3 bg-white border-t md:border-t-0 md:border-l border-gray-100 p-4 md:p-6 flex flex-col shadow-sm h-[40vh] md:h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrito</h2>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "efectivo",      label: "Efectivo",      emoji: "💵" },
              { value: "transferencia", label: "Transferencia", emoji: "🏦" },
              { value: "fiado",         label: "Fiado",         emoji: "📋" },
            ].map(m => (
              <button key={m.value} type="button"
                onClick={() => { setMetodoPago(m.value); setCliente(null) }}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  metodoPago === m.value
                    ? m.value === "fiado"        ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                    : m.value === "transferencia" ? "bg-blue-50 border-blue-300 text-blue-700"
                    :                              "bg-green-50 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {metodoPago === "fiado" && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Cliente</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors"
              onChange={(e) => setCliente(clientes.find(c => c.id == e.target.value) || null)}
              value={cliente?.id || ""}
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {cliente && (
              <p className="text-xs text-red-500 mt-1.5">
                Deuda actual: ${Number(cliente.saldo_pendiente || 0).toLocaleString("es-AR")}
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {carrito.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Carrito vacío</p>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {item.cantidad.toLocaleString("es-AR", { maximumFractionDigits: 3 })} {item.unidad_medida} × ${item.precio_unitario.toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-blue-600">
                    ${(item.cantidad * item.precio_unitario).toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                  </p>
                  <button onClick={() => quitarProducto(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {metodoPago === "fiado" && (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-medium px-3 py-2 rounded-lg mb-3 text-center">
            ⚠ Esta venta quedará como deuda del cliente
          </div>
        )}
        {metodoPago === "transferencia" && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg mb-3 text-center">
            🏦 Pago por transferencia bancaria
          </div>
        )}

        <button onClick={confirmarVenta} disabled={loading || carrito.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white py-3 rounded-xl font-medium text-sm">
          {loading ? "Procesando..." : "Confirmar venta"}
        </button>

        {ventaExitosa && (
          <div className="flex items-center justify-center gap-2 mt-3 bg-green-50 border border-green-100 text-green-600 text-sm font-medium px-3 py-2 rounded-xl">
            <CheckCircle size={16} /> Venta registrada correctamente
          </div>
        )}
      </div>

      {/* ── Modal granel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {productoGranel && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => triggerShake(setShakeGranel)}  
          >
            <motion.div
              className="bg-white p-6 rounded-2xl w-80 shadow-xl border border-gray-100"
              variants={shakeVariants}
              animate={shakeGranel ? "shake" : "idle"}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">{productoGranel.nombre}</h2>
                <button onClick={() => setProductoGranel(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                  <X size={14} />
                </button>
              </div>

              <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setModoGranel("cantidad")}
                  className={`w-1/2 py-2 rounded-lg text-sm font-medium transition ${
                    modoGranel === "cantidad" ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-200"
                  }`}>
                  {productoGranel.unidad_medida || "kg"}
                </button>
                <button onClick={() => setModoGranel("dinero")}
                  className={`w-1/2 py-2 rounded-lg text-sm font-medium transition ${
                    modoGranel === "dinero" ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-200"
                  }`}>
                  $
                </button>
              </div>

              <input
                type="number" autoFocus
                className="w-full p-3 border border-gray-200 rounded-xl text-center mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                value={cantidadGranel}
                onChange={(e) => setCantidadGranel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmarGranel()}
              />

              <p className="text-center text-xs text-gray-400 mb-2">
                {modoGranel === "cantidad"
                  ? `Ingresar peso en ${productoGranel.unidad_medida || "kg"}`
                  : "Ingresar monto en pesos"}
              </p>

              {cantidadGranel && (
                <p className="text-center text-sm font-medium text-blue-600 mb-3">
                  {modoGranel === "dinero"
                    ? `≈ ${(cantidadGranel / productoGranel.precio).toFixed(3)} ${productoGranel.unidad_medida || "kg"}`
                    : `$${(cantidadGranel * productoGranel.precio).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => setProductoGranel(null)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition">
                  Cancelar
                </button>
                <button onClick={confirmarGranel}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition">
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal pago efectivo ───────────────────────────────────────────── */}
      <AnimatePresence>
        {modalPago && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => triggerShake(setShakePago)} 
          >
            <motion.div
              className="bg-white p-6 rounded-2xl w-80 shadow-xl border border-gray-100"
              variants={shakeVariants}
              animate={shakePago ? "shake" : "idle"}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">Pago en efectivo</h2>
                <button onClick={() => setModalPago(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                  <X size={14} />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Total a cobrar</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Monto recibido
              </label>
              <input
                type="number" autoFocus
                className="w-full p-3 border border-gray-200 rounded-xl text-center mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && Number(montoPagado) >= total && finalizarVenta(Number(montoPagado))}
              />

              {montoPagado && (
                <div className={`text-center text-sm font-medium mb-3 px-3 py-2 rounded-xl ${
                  vuelto >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {vuelto >= 0
                    ? `Vuelto: $${vuelto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                    : `Faltan: $${Math.abs(vuelto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setModalPago(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition">
                  Cancelar
                </button>
                <button
                  disabled={Number(montoPagado) < total || loading}
                  onClick={() => finalizarVenta(Number(montoPagado))}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition">
                  {loading ? "..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
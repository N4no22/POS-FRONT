import { useState, useEffect, useRef } from "react"

export default function Ventas() {

  const [productos, setProductos] = useState([])

  const clientesMock = [
    { id: 1, nombre: "Juan Perez", saldo: 2000 },
    { id: 2, nombre: "Maria Lopez", saldo: 500 }
  ]

  const [carrito, setCarrito] = useState([])
  const [cliente, setCliente] = useState(null)
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [busqueda, setBusqueda] = useState("")

  const [productoGranel, setProductoGranel] = useState(null)
  const [cantidadGranel, setCantidadGranel] = useState("")
  const [modoGranel, setModoGranel] = useState("cantidad")

  const [modalPago, setModalPago] = useState(false)
  const [montoPagado, setMontoPagado] = useState("")

  const inputRef = useRef(null)

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(data => setProductos(data))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const agregarProducto = (producto) => {

    if (producto.stock <= 0) return alert("Sin stock")

    if (producto.tipo_venta === "peso") {
      setProductoGranel(producto)
      setCantidadGranel("")
      return
    }

    const existe = carrito.find(i => i.producto_id === producto.id)

    if (existe) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([
        ...carrito,
        {
          id: Date.now() + Math.random(),
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: Number(producto.precio),
          cantidad: 1
        }
      ])
    }
  }

  const confirmarGranel = () => {

    let cantidadFinal = 0

    if (modoGranel === "cantidad") {
      cantidadFinal = parseFloat(cantidadGranel)
    } else {
      cantidadFinal = parseFloat(cantidadGranel) / Number(productoGranel.precio)
    }

    if (!cantidadFinal || cantidadFinal <= 0) return alert("Valor inválido")
    if (cantidadFinal > productoGranel.stock) return alert("Stock insuficiente")

    const existe = carrito.find(i => i.producto_id === productoGranel.id)

    if (existe) {
      setCarrito(carrito.map(item =>
        item.producto_id === productoGranel.id
          ? { ...item, cantidad: item.cantidad + cantidadFinal }
          : item
      ))
    } else {
      setCarrito([
        ...carrito,
        {
          id: Date.now() + Math.random(),
          producto_id: productoGranel.id,
          nombre: productoGranel.nombre,
          precio_unitario: Number(productoGranel.precio),
          cantidad: cantidadFinal
        }
      ])
    }

    setProductoGranel(null)
    setCantidadGranel("")
  }

  const quitarProducto = (id) => {
    setCarrito(carrito.filter(i => i.id !== id))
  }

  const total = carrito.reduce((acc, item) =>
    acc + item.cantidad * item.precio_unitario, 0
  )

  const confirmarVenta = () => {

    if (metodoPago === "fiado" && !cliente) {
      return alert("Seleccionar cliente")
    }

    if (carrito.length === 0) return alert("Carrito vacío")

    if (metodoPago === "efectivo") {
      setModalPago(true)
      return
    }

    finalizarVenta(0)
  }

  const finalizarVenta = (pagado) => {

    const ventaPayload = {
      venta: {
        fecha: new Date().toISOString(),
        cliente_id: cliente?.id || null,
        metodo_pago: metodoPago,
        estado: metodoPago === "fiado" ? "pendiente" : "pagado",
        total,
        saldo_pendiente: metodoPago === "fiado" ? total : 0,
        usuario_id: 1,
        arqueo_id: 1
      },
      detalles: carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      }))
    }

    console.log("VENTA:", ventaPayload)
    console.log("PAGADO:", pagado)

    alert("Venta realizada")

    setCarrito([])
    setCliente(null)
    setMetodoPago("efectivo")
    setMontoPagado("")
    setModalPago(false)
  }

  const vuelto = Number(montoPagado) - total

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo_barras || "").includes(busqueda)
  )

  return (
    <div className="flex h-screen bg-gray-100">

      {/* PRODUCTOS */}
      <div className="w-2/3 p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Productos</h2>

        <input
          ref={inputRef}
          className="w-full p-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-4">
          {productosFiltrados.map(prod => (
            <div
              key={prod.id}
              onClick={() => agregarProducto(prod)}
              className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-gray-100"
            >
              <h3 className="font-semibold">{prod.nombre}</h3>
              <p className="text-lg">${prod.precio}</p>
              <p className="text-sm text-gray-500">Stock: {prod.stock}</p>

              <p className={`text-xs mt-1 ${
                prod.tipo_venta === "peso"
                  ? "text-purple-600"
                  : "text-green-600"
              }`}>
                {prod.tipo_venta === "peso" ? "⚖ Granel" : "📦 Unidad"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CARRITO */}
      <div className="w-1/3 bg-white p-6 flex flex-col shadow-lg">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Carrito</h2>

        {metodoPago === "fiado" && (
          <>
            <select
              className="border p-2 rounded mb-2"
              onChange={(e) =>
                setCliente(clientesMock.find(c => c.id == e.target.value))
              }
            >
              <option>Cliente</option>
              {clientesMock.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            {cliente && (
              <p className="text-red-500 text-sm">
                Deuda actual: ${cliente.saldo}
              </p>
            )}
          </>
        )}

        <div className="flex-1 overflow-y-auto">
          {carrito.map(item => (
            <div key={item.id} className="flex justify-between border-b py-2">
              <div>
                <p>{item.nombre}</p>
                <p className="text-sm">
                  {item.cantidad} x ${item.precio_unitario}
                </p>
              </div>
              <div>
                <p>${(item.cantidad * item.precio_unitario).toFixed(2)}</p>
                <button
                  className="text-red-500 text-sm"
                  onClick={() => quitarProducto(item.id)}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-2 font-bold text-lg">
          Total: ${total.toFixed(2)}
        </h3>

        {metodoPago === "fiado" && (
          <div className="bg-yellow-100 p-2 rounded mt-2 text-center text-sm">
            ⚠ Venta FIADA
          </div>
        )}

        <select
          className="border p-2 rounded mt-2"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="efectivo">Efectivo</option>
          <option value="fiado">Fiado</option>
        </select>

        <button
          onClick={confirmarVenta}
          className="bg-blue-600 text-white py-3 rounded-xl mt-3 hover:bg-blue-700 transition"
        >
          Confirmar Venta
        </button>
      </div>

      {/* MODAL GRANEL */}
      {productoGranel && (
        <div className="fixed inset-0 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl border border-gray-100 pointer-events-auto">

            <h2 className="text-blue-600 text-center font-bold mb-3">
              {productoGranel.nombre}
            </h2>

            {/* 🔥 TOGGLE PRO */}
            <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setModoGranel("cantidad")}
                className={`w-1/2 py-2 rounded-lg font-medium transition ${
                  modoGranel === "cantidad"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Kg
              </button>

              <button
                onClick={() => setModoGranel("dinero")}
                className={`w-1/2 py-2 rounded-lg font-medium transition ${
                  modoGranel === "dinero"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                $
              </button>
            </div>

            <input
              type="number"
              className="w-full p-3 border border-gray-200 rounded-xl text-center mb-2 focus:ring-2 focus:ring-blue-500"
              value={cantidadGranel}
              onChange={(e) => setCantidadGranel(e.target.value)}
            />

            <p className="text-center text-xs text-gray-400 mb-2">
              {modoGranel === "cantidad"
                ? "Ingresar peso en kg"
                : "Ingresar monto en pesos"}
            </p>

            {cantidadGranel && (
              <p className="text-center text-sm mb-3">
                {modoGranel === "dinero"
                  ? `≈ ${(cantidadGranel / productoGranel.precio).toFixed(3)} kg`
                  : `$${(cantidadGranel * productoGranel.precio).toFixed(2)}`
                }
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setProductoGranel(null)}
                className="w-1/2 bg-gray-300 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGranel}
                className="w-1/2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL EFECTIVO */}
      {modalPago && (
        <div className="fixed inset-0 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl border border-gray-100 pointer-events-auto">

            <h2 className="text-blue-600 text-center font-bold mb-3">
              Pago
            </h2>

            <p className="text-center mb-2">
              Total: ${total.toFixed(2)}
            </p>

            <input
              type="number"
              className="w-full p-3 border border-gray-200 rounded-xl text-center mb-3"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
            />

            {montoPagado && (
              <p className="text-center mb-2">
                {vuelto >= 0
                  ? `Vuelto: $${vuelto.toFixed(2)}`
                  : `Faltan: $${Math.abs(vuelto).toFixed(2)}`
                }
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setModalPago(false)}
                className="w-1/2 bg-gray-300 py-2 rounded-xl"
              >
                Cancelar
              </button>

              <button
                disabled={Number(montoPagado) < total}
                onClick={() => finalizarVenta(Number(montoPagado))}
                className="w-1/2 bg-blue-600 text-white py-2 rounded-xl disabled:bg-gray-400"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
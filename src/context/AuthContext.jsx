import {
  createContext,
  useContext,
  useState
} from "react"

const AuthContext = createContext()
const BASE_URL = "http://localhost:3000/api"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("user")
      const token = sessionStorage.getItem("token")

      if (!saved || !token) return null

      const payload = JSON.parse(
        atob(token.split(".")[1])
      )

      if (payload.exp * 1000 < Date.now()) {
        sessionStorage.clear()
        return null
      }

      return JSON.parse(saved)
    } catch {
      return null
    }
  })

  const [arqueoActivo, setArqueoActivo] =
    useState(() => {
      try {
        const saved =
          sessionStorage.getItem("arqueoActivo")

        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    })

  const [
    showModalAbrirArqueo,
    setShowModalAbrirArqueo
  ] = useState(false)

  const [
    showConfirmarCierre,
    setShowConfirmarCierre
  ] = useState(false)

  const [showModalLogout, setShowModalLogout] =
    useState(false)

  const [saldoInicial, setSaldoInicial] =
    useState("")

  const [resumenPrevio, setResumenPrevio] =
    useState(null)

  const [loadingArqueo, setLoadingArqueo] =
    useState(false)

  const [errorArqueo, setErrorArqueo] =
    useState("")

  const authHeaders = () => ({
    Authorization: `Bearer ${sessionStorage.getItem(
      "token"
    )}`
  })

  // Verificar si existe una caja abierta
  const verificarArqueoActivo = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/arqueo/activo`,
        {
          headers: authHeaders()
        }
      )

      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.id) {
        setArqueoActivo(data)

        sessionStorage.setItem(
          "arqueoActivo",
          JSON.stringify(data)
        )

        return true
      }

      setArqueoActivo(null)
      sessionStorage.removeItem("arqueoActivo")

      return false
    } catch {
      setArqueoActivo(null)
      sessionStorage.removeItem("arqueoActivo")

      return false
    }
  }

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch(
        `${BASE_URL}/usuarios/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        return {
          ok: false,
          message:
            data.message || "Error al iniciar sesión"
        }
      }

      setUser(data.usuario)

      sessionStorage.setItem(
        "user",
        JSON.stringify(data.usuario)
      )

      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem(
        "lastActivity",
        Date.now()
      )

      const tieneArqueo =
        await verificarArqueoActivo()

      if (!tieneArqueo) {
        setShowModalAbrirArqueo(true)
      }

      return {
        ok: true,
        user: data.usuario
      }
    } catch {
      return {
        ok: false,
        message: "Error de conexión"
      }
    }
  }

  // Mostrar modal para abrir caja
  const abrirCaja = () => {
    if (arqueoActivo) return

    setSaldoInicial("")
    setErrorArqueo("")
    setShowModalAbrirArqueo(true)
  }

  const cancelarApertura = () => {
    if (loadingArqueo) return

    setShowModalAbrirArqueo(false)
    setSaldoInicial("")
    setErrorArqueo("")
  }

  // Confirmar apertura
  const confirmarAbrirCaja = async () => {
    if (!user || arqueoActivo) return

    const saldo =
      saldoInicial === ""
        ? undefined
        : Number(saldoInicial)

    if (
      saldo !== undefined &&
      (!Number.isFinite(saldo) || saldo < 0)
    ) {
      setErrorArqueo(
        "El saldo inicial no es válido"
      )
      return
    }

    try {
      setLoadingArqueo(true)
      setErrorArqueo("")

      const res = await fetch(
        `${BASE_URL}/arqueo/abrir`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            usuario_id: user.id,
            saldo_anterior: saldo
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudo abrir la caja"
        )
      }

      setArqueoActivo(data)

      sessionStorage.setItem(
        "arqueoActivo",
        JSON.stringify(data)
      )

      setShowModalAbrirArqueo(false)
      setSaldoInicial("")
      setErrorArqueo("")
    } catch (error) {
      setErrorArqueo(error.message)
    } finally {
      setLoadingArqueo(false)
    }
  }

  // Mostrar resumen antes del cierre
  const cerrarCaja = async () => {
    if (!arqueoActivo) return

    setShowConfirmarCierre(true)
    setResumenPrevio(null)
    setErrorArqueo("")
    setLoadingArqueo(true)

    try {
      const res = await fetch(
        `${BASE_URL}/arqueo/resumen-activo`,
        {
          headers: authHeaders()
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudo calcular el resumen"
        )
      }

      setResumenPrevio(data)
    } catch (error) {
      setErrorArqueo(error.message)
    } finally {
      setLoadingArqueo(false)
    }
  }

  const cancelarCierre = () => {
    if (loadingArqueo) return

    setShowConfirmarCierre(false)
    setResumenPrevio(null)
    setErrorArqueo("")
  }

  // Cerrar realmente la caja
  const confirmarCerrarCaja = async () => {
    if (!arqueoActivo || !resumenPrevio) return

    try {
      setLoadingArqueo(true)
      setErrorArqueo("")

      const res = await fetch(
        `${BASE_URL}/arqueo/cerrar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            usuario_id: user?.id
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudo cerrar la caja"
        )
      }

      setArqueoActivo(null)
      sessionStorage.removeItem("arqueoActivo")

      setShowConfirmarCierre(false)
      setResumenPrevio(null)
      setErrorArqueo("")
    } catch (error) {
      setErrorArqueo(error.message)
    } finally {
      setLoadingArqueo(false)
    }
  }

  // Logout
  const logout = () => {
    setShowModalLogout(true)
  }

  const confirmarLogout = () => {
    setShowModalLogout(false)
    limpiarSesion()
  }

  const limpiarSesion = () => {
    setUser(null)
    setArqueoActivo(null)
    setResumenPrevio(null)
    sessionStorage.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        abrirCaja,
        cerrarCaja,
        arqueoActivo,
        verificarArqueoActivo
      }}
    >
      {children}

      {/* Abrir caja */}
      {showModalAbrirArqueo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🏪
              </div>

              <h2 className="font-semibold text-gray-900">
                Abrir caja
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Ingresá el saldo inicial para comenzar un nuevo turno
              </p>
            </div>

            {errorArqueo && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorArqueo}
              </div>
            )}

            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Saldo inicial
            </label>

            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                $
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                autoFocus
                placeholder="0"
                value={saldoInicial}
                onChange={(event) => {
                  setSaldoInicial(event.target.value)
                  setErrorArqueo("")
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    confirmarAbrirCaja()
                  }
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <p className="mb-5 text-center text-xs text-gray-400">
              Si lo dejás vacío se utilizará el saldo final del último turno
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelarApertura}
                disabled={loadingArqueo}
                className="w-1/2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarAbrirCaja}
                disabled={loadingArqueo}
                className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingArqueo
                  ? "Abriendo..."
                  : "Confirmar apertura"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumen y confirmación de cierre */}
      {showConfirmarCierre && arqueoActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                🔒
              </div>

              <h2 className="font-semibold text-gray-900">
                Confirmar cierre de caja
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Resumen del arqueo #{arqueoActivo.id}
              </p>
            </div>

            {loadingArqueo && !resumenPrevio && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-amber-500" />

                <p className="text-sm text-gray-400">
                  Calculando resumen...
                </p>
              </div>
            )}

            {errorArqueo && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorArqueo}
              </div>
            )}

            {resumenPrevio && (
              <>
                <div className="mb-5 space-y-2">
                  <ResumenFila
                    label="Saldo inicial"
                    value={
                      resumenPrevio.saldo_anterior
                    }
                    className="bg-gray-50 text-gray-700"
                  />

                  <ResumenFila
                    label="Ingresos"
                    value={resumenPrevio.ingresos}
                    prefix="+"
                    className="bg-green-50 text-green-600"
                  />

                  <ResumenFila
                    label="Egresos"
                    value={resumenPrevio.egresos}
                    prefix="-"
                    className="bg-red-50 text-red-500"
                  />

                  <ResumenFila
                    label="Saldo final estimado"
                    value={
                      resumenPrevio.saldo_final
                    }
                    className="border border-blue-100 bg-blue-50 font-bold text-blue-700"
                  />
                </div>

                <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-medium text-amber-800">
                    ¿Confirmás el cierre de este turno?
                  </p>

                  <p className="mt-1 text-xs text-amber-600">
                    Una vez cerrado, el arqueo no podrá modificarse.
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelarCierre}
                disabled={loadingArqueo}
                className="w-1/2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                No, volver
              </button>

              <button
                type="button"
                onClick={confirmarCerrarCaja}
                disabled={
                  loadingArqueo ||
                  !resumenPrevio ||
                  Boolean(errorArqueo)
                }
                className="w-1/2 rounded-xl bg-amber-500 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingArqueo && resumenPrevio
                  ? "Cerrando..."
                  : "Sí, cerrar caja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      {showModalLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                👋
              </div>

              <h2 className="font-semibold text-gray-900">
                ¿Cerrar sesión?
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {arqueoActivo
                  ? "La caja continuará abierta aunque cierres la sesión."
                  : "¿Estás seguro de que querés salir?"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowModalLogout(false)
                }
                className="w-1/2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarLogout}
                className="w-1/2 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

function ResumenFila({
  label,
  value,
  prefix = "",
  className = ""
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${className}`}
    >
      <span className="text-sm">{label}</span>

      <span className="text-sm font-semibold">
        {prefix}$
        {Number(value || 0).toLocaleString("es-AR")}
      </span>
    </div>
  )
}

export const useAuth = () =>
  useContext(AuthContext)
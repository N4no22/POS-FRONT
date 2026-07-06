import {
  useEffect,
  useState
} from "react"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Store
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const BASE_URL = "http://localhost:3000/api"

const inputClass = `
  w-full rounded-xl border border-slate-200
  bg-slate-50 px-4 py-3
  text-sm text-slate-900
  outline-none transition
  placeholder:text-slate-400
  focus:border-blue-400 focus:bg-white
  focus:ring-4 focus:ring-blue-100
`

const buttonClass = `
  w-full rounded-xl bg-blue-600 py-3
  text-sm font-semibold text-white
  transition hover:bg-blue-700
  disabled:cursor-not-allowed
  disabled:opacity-50
`

export default function Login() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [showPassword, setShowPassword] =
    useState(false)

  const [error, setError] = useState("")
  const [mensajeExito, setMensajeExito] =
    useState("")
  const [loading, setLoading] = useState(false)

  // Recuperación
  const [paso, setPaso] = useState(null)
  const [emailRecuperar, setEmailRecuperar] =
    useState("")
  const [codigo, setCodigo] = useState("")
  const [nuevaPassword, setNuevaPassword] =
    useState("")
  const [
    showNuevaPassword,
    setShowNuevaPassword
  ] = useState(false)
  const [
    loadingRecuperar,
    setLoadingRecuperar
  ] = useState(false)
  const [
    mensajeRecuperar,
    setMensajeRecuperar
  ] = useState("")
  const [mensajeTipo, setMensajeTipo] =
    useState("error")

  // Si ya tiene sesión, no mostrar login
  useEffect(() => {
    if (!user) return

    const destino =
      user.rol === "admin"
        ? "/dashboard"
        : "/ventas"

    navigate(destino, { replace: true })
  }, [user, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const email = form.email.trim()
    const password = form.password

    if (!email || !password) {
      setError(
        "Ingresá tu email y contraseña"
      )
      return
    }

    try {
      setLoading(true)
      setError("")
      setMensajeExito("")

      const resultado = await login(
        email,
        password
      )

      if (!resultado.ok) {
        throw new Error(
          resultado.message ||
            "Credenciales incorrectas"
        )
      }

      const destino =
        resultado.user.rol === "admin"
          ? "/dashboard"
          : "/ventas"

      navigate(destino, {
        replace: true
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const mostrarMensaje = (
    texto,
    tipo = "error"
  ) => {
    setMensajeRecuperar(texto)
    setMensajeTipo(tipo)
  }

  const solicitarCodigo = async () => {
    const email = emailRecuperar.trim()

    if (!email) {
      mostrarMensaje("Ingresá tu email")
      return
    }

    try {
      setLoadingRecuperar(true)
      setMensajeRecuperar("")

      const res = await fetch(
        `${BASE_URL}/recuperar/solicitar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudo enviar el código"
        )
      }

      setEmailRecuperar(email)
      setPaso("codigo")

      mostrarMensaje(
        "Código enviado. Revisá tu email.",
        "success"
      )
    } catch (err) {
      mostrarMensaje(err.message)
    } finally {
      setLoadingRecuperar(false)
    }
  }

  const verificarCodigo = async () => {
    if (codigo.length !== 6) {
      mostrarMensaje(
        "El código debe tener 6 dígitos"
      )
      return
    }

    try {
      setLoadingRecuperar(true)
      setMensajeRecuperar("")

      const res = await fetch(
        `${BASE_URL}/recuperar/verificar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailRecuperar,
            codigo
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "El código no es válido"
        )
      }

      setPaso("password")
      setMensajeRecuperar("")
    } catch (err) {
      mostrarMensaje(err.message)
    } finally {
      setLoadingRecuperar(false)
    }
  }

  const cambiarPassword = async () => {
    if (nuevaPassword.length < 6) {
      mostrarMensaje(
        "La contraseña debe tener al menos 6 caracteres"
      )
      return
    }

    try {
      setLoadingRecuperar(true)
      setMensajeRecuperar("")

      const res = await fetch(
        `${BASE_URL}/recuperar/cambiar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailRecuperar,
            codigo,
            nuevaPassword
          })
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.message ||
            "No se pudo cambiar la contraseña"
        )
      }

      const email = emailRecuperar

      resetRecuperar()

      setForm({
        email,
        password: ""
      })

      setMensajeExito(
        "Contraseña actualizada. Ya podés iniciar sesión."
      )
    } catch (err) {
      mostrarMensaje(err.message)
    } finally {
      setLoadingRecuperar(false)
    }
  }

  const resetRecuperar = () => {
    setPaso(null)
    setEmailRecuperar("")
    setCodigo("")
    setNuevaPassword("")
    setShowNuevaPassword(false)
    setMensajeRecuperar("")
    setMensajeTipo("error")
  }

  const volver = () => {
    setMensajeRecuperar("")

    if (paso === "codigo") {
      setPaso("email")
      setCodigo("")
      return
    }

    if (paso === "password") {
      setPaso("codigo")
      setNuevaPassword("")
      return
    }

    resetRecuperar()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">

        {/* Marca */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950">
            <Store size={21} />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Punto de venta
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Acceso al sistema
          </p>
        </div>

        {/* Tarjeta */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">

          {/* Login */}
          {!paso && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Iniciar sesión
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ingresá tus datos para continuar.
                </p>
              </div>

              {mensajeExito && (
                <Mensaje
                  tipo="success"
                  texto={mensajeExito}
                />
              )}

              {error && (
                <Mensaje
                  tipo="error"
                  texto={error}
                />
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>

                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="usuario@ejemplo.com"
                    value={form.email}
                    onChange={(event) => {
                      setForm({
                        ...form,
                        email: event.target.value
                      })
                      setError("")
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Ingresá tu contraseña"
                      value={form.password}
                      onChange={(event) => {
                        setForm({
                          ...form,
                          password:
                            event.target.value
                        })
                        setError("")
                      }}
                      className={`${inputClass} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (actual) => !actual
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={buttonClass}
                >
                  {loading
                    ? "Ingresando..."
                    : "Iniciar sesión"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setPaso("email")
                  setError("")
                  setMensajeExito("")
                }}
                className="mt-5 w-full text-center text-sm font-medium text-slate-500 hover:text-blue-600"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          {/* Recuperar: email */}
          {paso === "email" && (
            <PasoRecuperacion
              titulo="Recuperar contraseña"
              descripcion="Ingresá el email asociado a tu usuario."
              onVolver={volver}
            >
              {mensajeRecuperar && (
                <Mensaje
                  tipo={mensajeTipo}
                  texto={mensajeRecuperar}
                />
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>

                <input
                  type="email"
                  autoFocus
                  placeholder="usuario@ejemplo.com"
                  value={emailRecuperar}
                  onChange={(event) => {
                    setEmailRecuperar(
                      event.target.value
                    )
                    setMensajeRecuperar("")
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      solicitarCodigo()
                    }
                  }}
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                onClick={solicitarCodigo}
                disabled={loadingRecuperar}
                className={buttonClass}
              >
                {loadingRecuperar
                  ? "Enviando..."
                  : "Enviar código"}
              </button>
            </PasoRecuperacion>
          )}

          {/* Recuperar: código */}
          {paso === "codigo" && (
            <PasoRecuperacion
              titulo="Verificar código"
              descripcion={`Ingresá el código enviado a ${emailRecuperar}`}
              onVolver={volver}
            >
              {mensajeRecuperar && (
                <Mensaje
                  tipo={mensajeTipo}
                  texto={mensajeRecuperar}
                />
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Código de seguridad
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    placeholder="000000"
                    value={codigo}
                    onChange={(event) => {
                      setCodigo(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                      setMensajeRecuperar("")
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        verificarCodigo()
                      }
                    }}
                    className={`${inputClass} pl-10 text-center text-lg font-semibold tracking-[0.3em]`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={verificarCodigo}
                disabled={loadingRecuperar}
                className={buttonClass}
              >
                {loadingRecuperar
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaso("email")
                  setCodigo("")
                  setMensajeRecuperar("")
                }}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-blue-600"
              >
                Reenviar código
              </button>
            </PasoRecuperacion>
          )}

          {/* Recuperar: contraseña */}
          {paso === "password" && (
            <PasoRecuperacion
              titulo="Nueva contraseña"
              descripcion="Elegí una contraseña de al menos 6 caracteres."
              onVolver={volver}
            >
              {mensajeRecuperar && (
                <Mensaje
                  tipo={mensajeTipo}
                  texto={mensajeRecuperar}
                />
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
                    autoFocus
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(event) => {
                      setNuevaPassword(
                        event.target.value
                      )
                      setMensajeRecuperar("")
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        cambiarPassword()
                      }
                    }}
                    className={`${inputClass} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNuevaPassword(
                        (actual) => !actual
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNuevaPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={cambiarPassword}
                disabled={loadingRecuperar}
                className={buttonClass}
              >
                {loadingRecuperar
                  ? "Guardando..."
                  : "Cambiar contraseña"}
              </button>
            </PasoRecuperacion>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  )
}

function Mensaje({ tipo, texto }) {
  const success = tipo === "success"

  return (
    <div
      className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        success
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-600"
      }`}
    >
      {success && (
        <CheckCircle
          size={16}
          className="mt-0.5 flex-shrink-0"
        />
      )}

      <span>{texto}</span>
    </div>
  )
}

function PasoRecuperacion({
  titulo,
  descripcion,
  onVolver,
  children
}) {
  return (
    <>
      <button
        type="button"
        onClick={onVolver}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {titulo}
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {descripcion}
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </>
  )
}
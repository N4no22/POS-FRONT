import { useAuth } from "../context/AuthContext"
import {
  LogOut,
  Lock,
  Unlock
} from "lucide-react"

export default function Navbar() {
  const {
    user,
    arqueoActivo,
    logout,
    abrirCaja,
    cerrarCaja
  } = useAuth()

  return (
    <header className="z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">

      {/* Estado */}
      <div className="flex items-center gap-2">
        {arqueoActivo ? (
          <span className="flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
            <Unlock size={12} />
            Caja abierta — #{arqueoActivo.id}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-400">
            <Lock size={12} />
            Sin caja abierta
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {arqueoActivo ? (
          <button
            type="button"
            onClick={cerrarCaja}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
          >
            <Lock size={13} />
            Cerrar caja
          </button>
        ) : (
          <button
            type="button"
            onClick={abrirCaja}
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <Unlock size={13} />
            Abrir caja
          </button>
        )}

        {/* Usuario */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.nombre?.[0]?.toUpperCase()}
          </div>

          <span className="hidden text-xs font-medium text-gray-700 sm:block">
            {user?.nombre}
          </span>
        </div>

        {/* Salir */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={13} />
          Salir
        </button>
      </div>
    </header>
  )
}
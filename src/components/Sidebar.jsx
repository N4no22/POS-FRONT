import {
  useRef,
  useState
} from "react"
import {
  BarChart3,
  Box,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingDown,
  Truck,
  Users,
  X
} from "lucide-react"
import {
  Link,
  useLocation
} from "react-router-dom"

import { useAuth } from "../context/AuthContext"

const NOMBRE_NEGOCIO = "Tu negocio"

const NAV_ITEMS = [
  {
    group: "Principal",
    items: [
      {
        name: "Inicio",
        path: "/dashboard",
        icon: Home,
        roles: ["admin"]
      },
      {
        name: "Nueva venta",
        path: "/ventas",
        icon: ShoppingBag,
        roles: ["admin", "cajero"]
      },
      {
        name: "Historial de ventas",
        path: "/historial-ventas",
        icon: ShoppingCart,
        roles: ["admin", "cajero"]
      }
    ]
  },
  {
    group: "Negocio",
    items: [
      {
        name: "Productos",
        path: "/productos",
        icon: Box,
        roles: ["admin"]
      },
      {
        name: "Clientes fiadores",
        path: "/clientes",
        icon: Users,
        roles: ["admin", "cajero"]
      },
      {
        name: "Proveedores",
        path: "/proveedores",
        icon: Truck,
        roles: ["admin"]
      },
      {
        name: "Egresos",
        path: "/egresos",
        icon: TrendingDown,
        roles: ["admin"]
      }
    ]
  },
  {
    group: "Informes",
    items: [
      {
        name: "Control de stock",
        path: "/reportes",
        icon: BarChart3,
        roles: ["admin"]
      },
      {
        name: "Exportar reportes",
        path: "/reportes-pdf",
        icon: FileText,
        roles: ["admin"]
      }
    ]
  },
  {
    group: "Configuración",
    items: [
      {
        name: "Usuarios",
        path: "/usuarios",
        icon: Settings,
        roles: ["admin"]
      }
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const [hovering, setHovering] =
    useState(false)

  const timerRef = useRef(null)

  const expandido =
    mobileOpen || hovering

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current)
    setHovering(true)
  }

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setHovering(false)
    }, 220)
  }

  const rutaActiva = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`)

  const getIniciales = (nombre) =>
    nombre
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <>
      {/* Botón móvil */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Fondo móvil */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-40
          flex h-screen flex-col
          border-r border-slate-800
          bg-slate-950 text-white
          transition-[width,transform] duration-200
          md:relative md:translate-x-0
          ${
            expandido
              ? "w-64"
              : "w-[68px]"
          }
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Negocio */}
        <div
          className={`
            flex h-[68px] items-center
            border-b border-slate-800
            ${
              expandido
                ? "gap-3 px-3"
                : "justify-center"
            }
          `}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <Store size={19} />
          </div>

          {expandido && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {NOMBRE_NEGOCIO}
              </p>

              <p className="text-xs text-slate-500">
                Punto de venta
              </p>
            </div>
          )}

          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Usuario */}
        <div
          className={`
            border-b border-slate-800 py-3
            ${
              expandido
                ? "px-3"
                : "px-2"
            }
          `}
        >
          <div
            className={`
              flex items-center
              ${
                expandido
                  ? "gap-3"
                  : "justify-center"
              }
            `}
          >
            <div className="relative flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                {getIniciales(user?.nombre)}
              </div>

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
            </div>

            {expandido && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">
                  {user?.nombre || "Usuario"}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user?.rol}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-2 py-4">
          {NAV_ITEMS.map((grupo) => {
            const itemsVisibles =
              grupo.items.filter((item) =>
                item.roles.includes(user?.rol)
              )

            if (!itemsVisibles.length) {
              return null
            }

            return (
              <div key={grupo.group}>
                {expandido ? (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    {grupo.group}
                  </p>
                ) : (
                  <div className="mx-auto mb-2 h-px w-7 bg-slate-800" />
                )}

                <div className="space-y-1">
                  {itemsVisibles.map((item) => {
                    const activo = rutaActiva(
                      item.path
                    )

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={
                          expandido
                            ? undefined
                            : item.name
                        }
                        onClick={() =>
                          setMobileOpen(false)
                        }
                        className={`
                          group relative flex items-center
                          rounded-lg py-2.5 text-sm
                          transition-colors
                          ${
                            expandido
                              ? "gap-3 px-3"
                              : "justify-center px-2"
                          }
                          ${
                            activo
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                          }
                        `}
                      >
                        {activo && (
                          <span className="absolute -left-2 h-5 w-[3px] rounded-r-full bg-blue-500" />
                        )}

                        <item.icon
                          size={18}
                          className={`
                            flex-shrink-0
                            ${
                              activo
                                ? "text-blue-400"
                                : "text-slate-500 group-hover:text-slate-300"
                            }
                          `}
                        />

                        {expandido && (
                          <>
                            <span className="flex-1 whitespace-nowrap">
                              {item.name}
                            </span>

                            {activo && (
                              <ChevronRight
                                size={13}
                                className="text-slate-500"
                              />
                            )}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        
      </aside>
    </>
  )
}
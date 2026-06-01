import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const BASE_URL = "http://localhost:3000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [arqueoActivo, setArqueoActivo] = useState(() => {
    const saved = localStorage.getItem("arqueoActivo");
    return saved ? JSON.parse(saved) : null;
  });

  // Modal states
  const [showModalAbrirArqueo, setShowModalAbrirArqueo] = useState(false);
  const [showModalCerrarArqueo, setShowModalCerrarArqueo] = useState(false);
  const [resumenArqueo, setResumenArqueo] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [loadingArqueo, setLoadingArqueo] = useState(false);

  // ─── Verificar arqueo activo ─────────────────────────────────────────────
  const verificarArqueoActivo = async () => {
  try {
    const res = await fetch(`${BASE_URL}/arqueo/activo`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    console.log("STATUS:", res.status, "DATA:", data); // 👈 agregá esto
    if (res.ok) {
      if (data) {
        setArqueoActivo(data);
        localStorage.setItem("arqueoActivo", JSON.stringify(data));
        return true;
      }
    }
    return false;
  } catch (err) {
    console.log("ERROR:", err); // 👈 y esto
    return false;
  }
};

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message };

      setUser(data.usuario);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      localStorage.setItem("token", data.token);
      localStorage.setItem("lastActivity", Date.now());

      // Verificar si hay arqueo activo, si no mostrar modal
      const tieneArqueo = await verificarArqueoActivo();
      if (!tieneArqueo) {
        setShowModalAbrirArqueo(true);
      }

      return { ok: true, user: data.usuario };
    } catch {
      return { ok: false, message: "Error de conexión" };
    }
  };

  // ─── Abrir arqueo ────────────────────────────────────────────────────────
  const abrirArqueo = async () => {
    if (!user) return;
    setLoadingArqueo(true);
    try {
      const res = await fetch(`${BASE_URL}/arqueo/abrir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          usuario_id: user.id,
          saldo_anterior: saldoInicial !== "" ? Number(saldoInicial) : undefined
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArqueoActivo(data);
      localStorage.setItem("arqueoActivo", JSON.stringify(data));
      setShowModalAbrirArqueo(false);
      setSaldoInicial("");
    } catch {
      alert("Error al abrir el arqueo");
    } finally {
      setLoadingArqueo(false);
    }
  };

  // ─── Logout → cerrar arqueo primero ──────────────────────────────────────
  const logout = async () => {
  if (arqueoActivo) {
    try {
      setLoadingArqueo(true);
      // ✅ Cerrar primero para calcular totales reales
      const res = await fetch(`${BASE_URL}/arqueo/cerrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ usuario_id: user?.id })
      });
      if (res.ok) {
        const data = await res.json(); // ya tiene ingresos y saldo_final calculados
        setResumenArqueo(data);
        setShowModalCerrarArqueo(true);
        setLoadingArqueo(false);
        return;
      }
    } catch {}
    setLoadingArqueo(false);
  }
  limpiarSesion();
};

// ✅ Ya no cierra — solo muestra confirmación y limpia
const confirmarCierreArqueo = () => {
  setShowModalCerrarArqueo(false);
  setResumenArqueo(null);
  limpiarSesion();
};

const limpiarSesion = () => {
  setUser(null);
  setArqueoActivo(null);
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("lastActivity");
  localStorage.removeItem("arqueoActivo");
};

  return (
    <AuthContext.Provider value={{ user, login, logout, arqueoActivo }}>
      {children}

      {/* ── Modal abrir arqueo ──────────────────────────────────────────── */}
      {showModalAbrirArqueo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏪</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Abrir caja</h2>
              <p className="text-xs text-gray-400 mt-1">
                Ingresá el monto inicial en caja para comenzar el turno
              </p>
            </div>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Saldo inicial
            </label>
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                autoFocus
                placeholder="0"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
                onKeyDown={e => e.key === "Enter" && abrirArqueo()}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>

            <p className="text-xs text-gray-400 text-center mb-4">
              Si dejás vacío se usará el saldo final del último turno
            </p>

            <button
              onClick={abrirArqueo}
              disabled={loadingArqueo}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {loadingArqueo ? "Abriendo..." : "Abrir caja"}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal cerrar arqueo ─────────────────────────────────────────── */}
      {showModalCerrarArqueo && resumenArqueo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Cerrar caja</h2>
              <p className="text-xs text-gray-400 mt-1">Resumen del turno</p>
            </div>

            {/* Resumen */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-lg">
                <span className="text-sm text-gray-500">Saldo inicial</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${Number(resumenArqueo.saldo_anterior || 0).toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between items-center bg-green-50 px-4 py-2.5 rounded-lg">
                <span className="text-sm text-green-600">Ingresos</span>
                <span className="text-sm font-semibold text-green-600">
                  +${Number(resumenArqueo.ingresos || 0).toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between items-center bg-red-50 px-4 py-2.5 rounded-lg">
                <span className="text-sm text-red-500">Egresos</span>
                <span className="text-sm font-semibold text-red-500">
                  -${Number(resumenArqueo.egresos || 0).toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-lg border border-blue-100">
                <span className="text-sm font-semibold text-blue-700">Saldo final</span>
                <span className="text-base font-bold text-blue-700">
                  ${Number(resumenArqueo.saldo_final || 0).toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModalCerrarArqueo(false)}
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCierreArqueo}
                disabled={loadingArqueo}
                className="w-1/2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {loadingArqueo ? "Cerrando..." : "Cerrar caja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
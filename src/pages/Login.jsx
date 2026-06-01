import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const BASE_URL = "http://localhost:3000/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Recuperación ────────────────────────────────────────────────────────
  const [paso, setPaso] = useState(null); // null | "email" | "codigo" | "password"
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");

  // ─── Login ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (!res.ok) { setError(res.message || "Credenciales incorrectas"); return; }
    if (res.user.rol === "admin") navigate("/dashboard");
    else navigate("/ventas");
  };

  // ─── Paso 1: solicitar código ─────────────────────────────────────────────
  const solicitarCodigo = async () => {
    if (!emailRecuperar.trim()) { setMensajeRecuperar("Ingresá tu email"); return; }
    try {
      setLoadingRecuperar(true);
      setMensajeRecuperar("");
      const res = await fetch(`${BASE_URL}/recuperar/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRecuperar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPaso("codigo");
      setMensajeRecuperar("Código enviado — revisá tu email");
    } catch (err) {
      setMensajeRecuperar(err.message);
    } finally {
      setLoadingRecuperar(false);
    }
  };

  // ─── Paso 2: verificar código ─────────────────────────────────────────────
  const verificarCodigo = async () => {
    if (codigo.length !== 6) { setMensajeRecuperar("El código tiene 6 dígitos"); return; }
    try {
      setLoadingRecuperar(true);
      setMensajeRecuperar("");
      const res = await fetch(`${BASE_URL}/recuperar/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRecuperar, codigo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPaso("password");
      setMensajeRecuperar("");
    } catch (err) {
      setMensajeRecuperar(err.message);
    } finally {
      setLoadingRecuperar(false);
    }
  };

  // ─── Paso 3: cambiar contraseña ───────────────────────────────────────────
  const cambiarPassword = async () => {
    if (nuevaPassword.length < 4) { setMensajeRecuperar("Mínimo 4 caracteres"); return; }
    try {
      setLoadingRecuperar(true);
      setMensajeRecuperar("");
      const res = await fetch(`${BASE_URL}/recuperar/cambiar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRecuperar, codigo, nuevaPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPaso(null);
      setEmailRecuperar("");
      setCodigo("");
      setNuevaPassword("");
      setError("");
      setMensajeRecuperar("");
      setForm({ email: emailRecuperar, password: "" });
    } catch (err) {
      setMensajeRecuperar(err.message);
    } finally {
      setLoadingRecuperar(false);
    }
  };

  const resetRecuperar = () => {
    setPaso(null);
    setEmailRecuperar("");
    setCodigo("");
    setNuevaPassword("");
    setMensajeRecuperar("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-sm shadow-xl">

        {/* ── Login normal ──────────────────────────────────────────────── */}
        {!paso && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-white text-xl font-semibold">Iniciar sesión</h1>
              <p className="text-gray-400 text-sm mt-1">Sistema de punto de venta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email" placeholder="Email"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-400"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-400"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <button
              onClick={() => setPaso("email")}
              className="w-full mt-4 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}

        {/* ── Paso 1: email ─────────────────────────────────────────────── */}
        {paso === "email" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-white text-xl font-semibold">Recuperar contraseña</h1>
              <p className="text-gray-400 text-sm mt-1">Te enviamos un código a tu email</p>
            </div>

            <div className="space-y-3">
              <input
                type="email" placeholder="Tu email"
                autoFocus
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-400"
                value={emailRecuperar}
                onChange={e => { setEmailRecuperar(e.target.value); setMensajeRecuperar(""); }}
                onKeyDown={e => e.key === "Enter" && solicitarCodigo()}
              />

              {mensajeRecuperar && (
                <p className={`text-sm ${mensajeRecuperar.includes("enviado") ? "text-green-400" : "text-red-400"}`}>
                  {mensajeRecuperar}
                </p>
              )}

              <button onClick={solicitarCodigo} disabled={loadingRecuperar}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                {loadingRecuperar ? "Enviando..." : "Enviar código"}
              </button>

              <button onClick={resetRecuperar}
                className="w-full text-gray-400 hover:text-gray-200 text-sm transition-colors">
                Volver al login
              </button>
            </div>
          </>
        )}

        {/* ── Paso 2: código ────────────────────────────────────────────── */}
        {paso === "codigo" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-white text-xl font-semibold">Ingresá el código</h1>
              <p className="text-gray-400 text-sm mt-1">Revisá tu bandeja de entrada</p>
              <p className="text-blue-400 text-sm mt-1">{emailRecuperar}</p>
            </div>

            <div className="space-y-3">
              <input
                type="text" placeholder="Código de 6 dígitos"
                autoFocus maxLength={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-center tracking-widest text-lg"
                value={codigo}
                onChange={e => { setCodigo(e.target.value.replace(/\D/g, "")); setMensajeRecuperar(""); }}
                onKeyDown={e => e.key === "Enter" && verificarCodigo()}
              />

              {mensajeRecuperar && (
                <p className={`text-sm ${mensajeRecuperar.includes("enviado") ? "text-green-400" : "text-red-400"}`}>
                  {mensajeRecuperar}
                </p>
              )}

              <button onClick={verificarCodigo} disabled={loadingRecuperar}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                {loadingRecuperar ? "Verificando..." : "Verificar código"}
              </button>

              <button onClick={() => { setPaso("email"); setMensajeRecuperar(""); }}
                className="w-full text-gray-400 hover:text-gray-200 text-sm transition-colors">
                Reenviar código
              </button>
            </div>
          </>
        )}

        {/* ── Paso 3: nueva contraseña ──────────────────────────────────── */}
        {paso === "password" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-white text-xl font-semibold">Nueva contraseña</h1>
              <p className="text-gray-400 text-sm mt-1">Elegí una contraseña segura</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showNuevaPassword ? "text" : "password"}
                  placeholder="Mínimo 4 caracteres"
                  autoFocus
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-400"
                  value={nuevaPassword}
                  onChange={e => { setNuevaPassword(e.target.value); setMensajeRecuperar(""); }}
                  onKeyDown={e => e.key === "Enter" && cambiarPassword()}
                />
                <button type="button" onClick={() => setShowNuevaPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showNuevaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {mensajeRecuperar && (
                <p className="text-red-400 text-sm">{mensajeRecuperar}</p>
              )}

              <button onClick={cambiarPassword} disabled={loadingRecuperar}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                {loadingRecuperar ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
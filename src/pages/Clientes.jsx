import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  DollarSign,
  History,
  MapPin,
  Pencil,
  Phone,
  PlusCircle,
  PowerOff,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";

import FormClienteFiador from "../components/FormClienteFiador";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_URL = "http://localhost:3000/api/fiadores";
const PAGOS_URL = "http://localhost:3000/api/pagos";

const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  })}`;

export default function Clientes() {
  const { user, arqueoActivo } = useAuth();
  const esAdmin = user?.rol === "admin";
  const { toast } = useToast();

  const [vista, setVista] = useState("activos");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Desactivación
  const [confirm, setConfirm] = useState({
    visible: false,
    id: null,
    loading: false,
  });

  // Pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [clientePago, setClientePago] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState("");
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // Historial
  const [showHistorial, setShowHistorial] = useState(false);
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = vista === "inactivos" ? `${API_URL}/inactivos` : API_URL;

      const res = await fetch(url);
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || "Error al cargar los clientes");
      }

      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [vista]);

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setSearchTerm("");
  };

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(null);
    setShowForm(true);
  };

  const abrirEdicion = (cliente) => {
    if (!esAdmin) {
      toast.error("Solo un administrador puede editar clientes");
      return;
    }

    setClienteSeleccionado(cliente);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setClienteSeleccionado(null);
  };

  const handleGuardar = async (cliente) => {
    try {
      const editando = Boolean(clienteSeleccionado);

      const url = editando ? `${API_URL}/${cliente.id}` : API_URL;

      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Error al ${editando ? "actualizar" : "crear"} el cliente`,
        );
      }

      toast.success(
        editando
          ? "Cliente actualizado correctamente"
          : "Cliente creado correctamente",
      );

      cerrarFormulario();

      if (vista !== "activos") {
        setVista("activos");
      } else {
        await fetchClientes();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const solicitarDesactivacion = (id) => {
    setConfirm({
      visible: true,
      id,
      loading: false,
    });
  };

  const confirmarDesactivacion = async () => {
    setConfirm((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await fetch(`${API_URL}/${confirm.id}/desactivar`, {
        method: "PATCH",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Error al desactivar el cliente");
      }

      setClientes((prev) =>
        prev.filter((cliente) => cliente.id !== confirm.id),
      );

      setConfirm({
        visible: false,
        id: null,
        loading: false,
      });

      toast.success("Cliente desactivado correctamente");
    } catch (err) {
      toast.error(err.message);

      setConfirm((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const reactivarCliente = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/reactivar`, {
        method: "PATCH",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Error al reactivar el cliente");
      }

      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));

      toast.success("Cliente reactivado correctamente");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const abrirPago = (cliente) => {
    setClientePago(cliente);
    setMontoPago("");
    setMetodoPago("efectivo");
    setErrorPago("");
    setPagoExitoso(false);
    setShowPagoModal(true);
  };

  const cerrarPago = () => {
    if (loadingPago) return;

    setShowPagoModal(false);
    setClientePago(null);
    setMontoPago("");
    setErrorPago("");
    setPagoExitoso(false);
  };

  const confirmarPago = async () => {
    const monto = Number(montoPago);
    const deuda = Number(clientePago?.saldo_pendiente || 0);

    if (!Number.isFinite(monto) || monto <= 0) {
      setErrorPago("Ingresá un monto válido");
      return;
    }

    if (monto > deuda) {
      setErrorPago("El monto no puede superar la deuda actual");
      return;
    }

    try {
      setLoadingPago(true);
      setErrorPago("");

      const res = await fetch(PAGOS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: clientePago.id,
          fecha: new Date().toISOString(),
          monto,
          metodo_pago: metodoPago,
          venta_id: null,
          estado: "pagado",
          usuario_id: user?.id || 1,
          arqueo_id: arqueoActivo?.id || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar el pago");
      }

      const nuevoSaldo = Math.max(0, deuda - monto);

      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clientePago.id
            ? {
                ...cliente,
                saldo_pendiente: nuevoSaldo,
              }
            : cliente,
        ),
      );

      setClientePago((prev) => ({
        ...prev,
        saldo_pendiente: nuevoSaldo,
      }));

      setPagoExitoso(true);
      toast.success("Pago registrado correctamente");

      setTimeout(() => {
        setShowPagoModal(false);
        setClientePago(null);
        setPagoExitoso(false);
        setMontoPago("");
      }, 1500);
    } catch (err) {
      setErrorPago(err.message);
    } finally {
      setLoadingPago(false);
    }
  };

  const abrirHistorial = async (cliente) => {
    setClienteHistorial(cliente);
    setShowHistorial(true);
    setLoadingHistorial(true);

    try {
      const res = await fetch(`${PAGOS_URL}/cliente/${cliente.id}`);

      if (!res.ok) throw new Error();

      const data = await res.json();

      setHistorial(Array.isArray(data) ? data : []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const textoBusqueda = searchTerm.trim().toLowerCase();

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
      cliente.telefono?.toLowerCase().includes(textoBusqueda),
  );

  const totalSaldo = clientes.reduce(
    (total, cliente) => total + Number(cliente.saldo_pendiente || 0),
    0,
  );

  const totalDisponible = clientes.reduce(
    (total, cliente) =>
      total +
      Math.max(
        0,
        Number(cliente.limite_credito || 0) -
          Number(cliente.saldo_pendiente || 0),
      ),
    0,
  );

  const conDeuda = clientes.filter(
    (cliente) => Number(cliente.saldo_pendiente) > 0,
  ).length;

  const getIniciales = (nombre) =>
    nombre
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-200">
              <Users size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Clientes fiadores
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Gestión de clientes, deudas y crédito
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNuevoCliente}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <PlusCircle size={17} />
            Nuevo fiador
          </button>
        </div>

        {/* Activos e inactivos */}
        <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setVista("activos");
              setSearchTerm("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              vista === "activos"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Activos
          </button>

          {esAdmin && (
            <button
              type="button"
              onClick={() => {
                setVista("inactivos");
                setSearchTerm("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                vista === "inactivos"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Inactivos
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={
              vista === "activos" ? "Clientes activos" : "Clientes inactivos"
            }
            value={clientes.length}
          />

          <StatCard
            label="Saldo pendiente"
            value={formatMoney(totalSaldo)}
            detail={`${conDeuda} cliente${conDeuda !== 1 ? "s" : ""} con deuda`}
            valueClass="text-red-600"
          />

          <StatCard
            label="Crédito disponible"
            value={formatMoney(totalDisponible)}
            valueClass="text-emerald-600"
          />
        </div>

        {/* Buscador */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="text-slate-400" size={18} />

            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Cargando */}
        {loading && <ClientesSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchClientes}
              className="font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tarjetas para celular */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {clientesFiltrados.length === 0 ? (
                <EmptyClientes />
              ) : (
                clientesFiltrados.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    vista={vista}
                    esAdmin={esAdmin}
                    getIniciales={getIniciales}
                    abrirHistorial={abrirHistorial}
                    abrirPago={abrirPago}
                    abrirEdicion={abrirEdicion}
                    solicitarDesactivacion={solicitarDesactivacion}
                    reactivarCliente={reactivarCliente}
                  />
                ))
              )}
            </div>

            {/* Tabla para escritorio */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Cliente
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Teléfono
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Dirección
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Saldo
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Límite
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientesFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-16 text-center text-sm text-slate-400"
                        >
                          No se encontraron clientes
                        </td>
                      </tr>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <ClienteRow
                          key={cliente.id}
                          cliente={cliente}
                          vista={vista}
                          esAdmin={esAdmin}
                          getIniciales={getIniciales}
                          abrirHistorial={abrirHistorial}
                          abrirPago={abrirPago}
                          abrirEdicion={abrirEdicion}
                          solicitarDesactivacion={solicitarDesactivacion}
                          reactivarCliente={reactivarCliente}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de pago */}
      <AnimatePresence>
        {showPagoModal && clientePago && (
          <PagoModal
            cliente={clientePago}
            monto={montoPago}
            setMonto={setMontoPago}
            metodo={metodoPago}
            setMetodo={setMetodoPago}
            loading={loadingPago}
            error={errorPago}
            setError={setErrorPago}
            exitoso={pagoExitoso}
            onConfirmar={confirmarPago}
            onClose={cerrarPago}
          />
        )}
      </AnimatePresence>

      {/* Historial */}
      <AnimatePresence>
        {showHistorial && clienteHistorial && (
          <HistorialModal
            cliente={clienteHistorial}
            historial={historial}
            loading={loadingHistorial}
            onClose={() => setShowHistorial(false)}
          />
        )}
      </AnimatePresence>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FormClienteFiador
                cliente={clienteSeleccionado}
                onGuardar={handleGuardar}
                onClose={cerrarFormulario}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        visible={confirm.visible}
        titulo="¿Desactivar cliente?"
        mensaje="No podrá realizar nuevas compras fiadas, pero su historial y deuda continuarán guardados."
        onConfirmar={confirmarDesactivacion}
        onCancelar={() =>
          setConfirm({
            visible: false,
            id: null,
            loading: false,
          })
        }
        loading={confirm.loading}
      />
    </div>
  );
}

function StatCard({ label, value, detail, valueClass = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>

      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}

function ClientesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="mb-2 h-3 w-32 rounded bg-slate-100" />
              <div className="h-2.5 w-20 rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyClientes() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <Users className="mx-auto mb-3 text-slate-300" size={36} />

      <p className="text-sm text-slate-400">No se encontraron clientes</p>
    </div>
  );
}

function ClienteCard({
  cliente,
  vista,
  esAdmin,
  getIniciales,
  abrirHistorial,
  abrirPago,
  abrirEdicion,
  solicitarDesactivacion,
  reactivarCliente,
}) {
  const deuda = Number(cliente.saldo_pendiente || 0);

  const limite = Number(cliente.limite_credito || 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        vista === "inactivos"
          ? "border-slate-200 opacity-90"
          : "border-slate-100"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => abrirHistorial(cliente)}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              vista === "activos"
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {getIniciales(cliente.nombre)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {cliente.nombre}
            </p>

            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                vista === "activos"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {vista === "activos" ? "Activo" : "Inactivo"}
            </span>
          </div>
        </button>

        {deuda > 0 && (
          <span className="flex-shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
            Con deuda
          </span>
        )}
      </div>

      <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone size={14} className="text-slate-400" />

          <span>{cliente.telefono || "Sin teléfono"}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />

          <span>{cliente.direccion || "Sin dirección"}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Saldo pendiente
          </p>

          <p
            className={`mt-1 text-base font-bold ${
              deuda > 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatMoney(deuda)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Límite
          </p>

          <p className="mt-1 text-base font-bold text-slate-700">
            {formatMoney(limite)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => abrirHistorial(cliente)}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
        >
          <History size={14} />
          Historial
        </button>

        {deuda > 0 && (
          <button
            type="button"
            onClick={() => abrirPago(cliente)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <DollarSign size={14} />
            Registrar pago
          </button>
        )}

        {esAdmin &&
          (vista === "activos" ? (
            <>
              <button
                type="button"
                title="Editar cliente"
                onClick={() => abrirEdicion(cliente)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil size={15} />
              </button>

              <button
                type="button"
                title="Desactivar cliente"
                onClick={() => solicitarDesactivacion(cliente.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
              >
                <PowerOff size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => reactivarCliente(cliente.id)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <RotateCcw size={14} />
              Reactivar
            </button>
          ))}
      </div>
    </motion.article>
  );
}

function ClienteRow({
  cliente,
  vista,
  esAdmin,
  getIniciales,
  abrirHistorial,
  abrirPago,
  abrirEdicion,
  solicitarDesactivacion,
  reactivarCliente,
}) {
  const deuda = Number(cliente.saldo_pendiente || 0);

  return (
    <motion.tr
      whileHover={{
        backgroundColor: "#f8fafc",
      }}
      className="border-t border-slate-100"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              vista === "activos"
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {getIniciales(cliente.nombre)}
          </div>

          <div>
            <button
              type="button"
              onClick={() => abrirHistorial(cliente)}
              className="font-semibold text-slate-900 hover:text-blue-600"
            >
              {cliente.nombre}
            </button>

            <p className="mt-0.5 text-xs text-slate-400">
              {vista === "activos" ? "Cliente activo" : "Cliente inactivo"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5 text-slate-500">{cliente.telefono || "—"}</td>

      <td className="px-5 py-3.5 text-slate-500">{cliente.direccion || "—"}</td>

      <td className="px-5 py-3.5">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            deuda > 0
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {formatMoney(deuda)}
        </span>
      </td>

      <td className="px-5 py-3.5 text-slate-500">
        {formatMoney(cliente.limite_credito)}
      </td>

      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-2">
          {deuda > 0 && (
            <button
              type="button"
              onClick={() => abrirPago(cliente)}
              title="Registrar pago"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <DollarSign size={15} />
            </button>
          )}

          {esAdmin &&
            (vista === "activos" ? (
              <>
                <button
                  type="button"
                  title="Editar cliente"
                  onClick={() => abrirEdicion(cliente)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  title="Desactivar cliente"
                  onClick={() => solicitarDesactivacion(cliente.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                >
                  <PowerOff size={15} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => reactivarCliente(cliente.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <RotateCcw size={14} />
                Reactivar
              </button>
            ))}
        </div>
      </td>
    </motion.tr>
  );
}

function PagoModal({
  cliente,
  monto,
  setMonto,
  metodo,
  setMetodo,
  loading,
  error,
  setError,
  exitoso,
  onConfirmar,
  onClose,
}) {
  const saldoRestante = Math.max(
    0,
    Number(cliente.saldo_pendiente || 0) - Number(monto || 0),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">Registrar pago</h2>

            <p className="mt-0.5 text-xs text-slate-400">{cliente.nombre}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {exitoso ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle className="mb-2 text-emerald-500" size={38} />

              <p className="font-semibold text-slate-900">Pago registrado</p>

              <p className="mt-1 text-sm text-slate-400">
                Nuevo saldo: {formatMoney(cliente.saldo_pendiente)}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center">
                <p className="mb-0.5 text-xs text-red-400">Deuda actual</p>

                <p className="text-2xl font-bold text-red-600">
                  {formatMoney(cliente.saldo_pendiente)}
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monto a pagar
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    placeholder="0"
                    value={monto}
                    onChange={(e) => {
                      setMonto(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onConfirmar();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Método de pago
                </label>

                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="efectivo">Efectivo</option>

                  <option value="transferencia">Transferencia</option>

                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              {monto && Number(monto) > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center">
                  <p className="mb-0.5 text-xs text-emerald-500">
                    Saldo restante
                  </p>

                  <p className="text-lg font-bold text-emerald-600">
                    {formatMoney(saldoRestante)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={onConfirmar}
                  disabled={loading}
                  className="w-1/2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Confirmar pago"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function HistorialModal({ cliente, historial, loading, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">Historial de pagos</h2>

            <p className="mt-0.5 text-xs text-slate-400">{cliente.nombre}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Cargando historial...
            </p>
          ) : historial.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Sin pagos registrados
            </p>
          ) : (
            <ul className="space-y-2">
              {historial.map((pago) => (
                <li
                  key={pago.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(pago.monto)}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(pago.fecha).toLocaleDateString("es-AR")} —{" "}
                      {pago.metodo_pago}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-600">
                    {pago.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

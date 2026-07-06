import { useState } from "react";
import { useAlert } from "../context/AlertContext";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalAlert() {
  const { alerts, setAlerts } = useAlert();
  const [expandido, setExpandido] = useState(false);

  if (alerts.length === 0) return null;

  const eliminar = (index) => setAlerts(alerts.filter((_, i) => i !== index));
  const limpiarTodas = () => setAlerts([]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
    >
      <div className="bg-white border border-yellow-200 rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border-b border-yellow-100">
          <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-yellow-800">
              {alerts.length} alerta{alerts.length > 1 ? "s" : ""} de stock
            </p>
          </div>
          <div className="flex items-center gap-1">
            {alerts.length > 1 && (
              <button
                onClick={() => setExpandido(e => !e)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-yellow-500 hover:bg-yellow-100 transition-colors"
              >
                {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            <button
              onClick={limpiarTodas}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-yellow-500 hover:bg-yellow-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Primera alerta siempre visible */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-snug">{alerts[0]}</p>
          {alerts.length === 1 && (
            <button
              onClick={() => eliminar(0)}
              className="text-xs text-yellow-500 hover:text-yellow-700 mt-1.5 transition-colors"
            >
              Descartar
            </button>
          )}
        </div>

        {/* Resto de alertas expandibles */}
        <AnimatePresence>
          {expandido && alerts.length > 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-yellow-100"
            >
              {alerts.slice(1).map((alert, i) => (
                <div key={i + 1} className="flex items-start gap-2 px-4 py-2.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-600 flex-1 leading-snug">{alert}</p>
                  <button
                    onClick={() => eliminar(i + 1)}
                    className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer si hay más de 1 y está colapsado */}
        {!expandido && alerts.length > 1 && (
          <button
            onClick={() => setExpandido(true)}
            className="w-full px-4 py-2 text-xs text-yellow-600 hover:bg-yellow-50 transition-colors border-t border-yellow-100 text-left"
          >
            Ver {alerts.length - 1} alerta{alerts.length - 1 > 1 ? "s" : ""} más →
          </button>
        )}
      </div>
    </motion.div>
  );
}
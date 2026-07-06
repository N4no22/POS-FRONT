import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ visible, titulo, mensaje, onConfirmar, onCancelar, loading }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
          onClick={onCancelar}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                <AlertTriangle className="text-red-500" size={22} />
              </div>
              <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
              {mensaje && <p className="text-sm text-gray-400 mt-1">{mensaje}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={onCancelar}
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={onConfirmar} disabled={loading}
                className="w-1/2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                {loading ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
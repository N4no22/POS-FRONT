import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((mensaje, tipo = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
  };

  const estilos = {
    success: { bg: "bg-green-50 border-green-200",  text: "text-green-700", icon: <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> },
    error:   { bg: "bg-red-50 border-red-200",      text: "text-red-700",   icon: <XCircle size={18} className="text-red-500 flex-shrink-0" /> },
    warning: { bg: "bg-yellow-50 border-yellow-200",text: "text-yellow-700",icon: <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" /> },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => {
            const e = estilos[t.tipo];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${e.bg}`}
              >
                {e.icon}
                <p className={`text-sm font-medium flex-1 ${e.text}`}>{t.mensaje}</p>
                <button onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
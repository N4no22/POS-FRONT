import { createContext, useContext, useState, useEffect } from "react";

const AlertContext = createContext();
const BASE_URL = "http://localhost:3000/api";

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const checkLowStock = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/bajo-stock`);
      if (!res.ok) return;
      const productos = await res.json();

      if (productos.length > 0) {
        setAlerts(
          productos.map(
            (p) => `⚠️ ${p.nombre} tiene solo ${Number(p.stock).toLocaleString("es-AR", { maximumFractionDigits: 3 })} ${p.unidad_medida} en stock`
          )
        );
      } else {
        setAlerts([]); // limpiar si ya no hay productos bajos
      }
    } catch {
      // silencioso, no romper la app por esto
    }
  };

  useEffect(() => {
    checkLowStock();
    const interval = setInterval(checkLowStock, 5 * 60 * 1000); // cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
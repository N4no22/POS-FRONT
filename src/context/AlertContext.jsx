// src/context/AlertContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Simulación: chequea cada 24 horas si hay productos bajos en stock
  useEffect(() => {
    const checkLowStock = async () => {
      // Esto en el futuro lo vas a reemplazar con una llamada al backend:
      const productosBajos = [
        { nombre: "Yerba Playadito 1kg", stock: 2 },
        { nombre: "Azúcar Ledesma 1kg", stock: 3 },
      ];

      if (productosBajos.length > 0) {
        setAlerts(
          productosBajos.map(
            (p) => `⚠️ ${p.nombre} tiene solo ${p.stock} unidades en stock`
          )
        );
      }
    };

    checkLowStock();

    // Repetir cada 24 horas
    const interval = setInterval(checkLowStock, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

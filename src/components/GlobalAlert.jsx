// src/components/GlobalAlert.jsx
import { useAlert } from "../context/AlertContext";

export default function GlobalAlert() {
  const { alerts, setAlerts } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-lg w-80"
        >
          <p className="font-semibold">{alert}</p>
          <button
            onClick={() =>
              setAlerts(alerts.filter((_, i) => i !== index))
            }
            className="text-sm mt-2 text-yellow-600 hover:text-yellow-800"
          >
            Cerrar
          </button>
        </div>
      ))}
    </div>
  );
}

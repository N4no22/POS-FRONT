import { useState } from "react";

const productosMock = [
  {
    id: 1,
    nombre: "Cámara Hikvision 2MP",
    stock: 0,
    stock_minimo: 3,
    proveedor: {
      empresa: "Distribuidora CCTV SRL",
      contacto: "Juan Pérez",
      telefono: "5492615555555",
    },
  },
  {
    id: 2,
    nombre: "DVR 8 Canales",
    stock: 1,
    stock_minimo: 2,
    proveedor: {
      empresa: "Seguridad Total",
      contacto: "María López",
      telefono: "5492614444444",
    },
  },
];

export default function Reportes() {
  const [productos] = useState(productosMock);

  const contactarProveedor = (telefono, producto) => {
    const mensaje = encodeURIComponent(
      `Hola! Nos estamos quedando sin stock del producto "${producto}". ¿Podemos reponerlo?`
    );

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Reportes</h1>

      {/* Productos con stock bajo */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          📦 Productos con stock bajo / sin stock
        </h2>

        {productos.length === 0 ? (
          <p className="text-gray-500">No hay alertas de stock 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Producto</th>
                  <th className="border px-3 py-2">Stock</th>
                  <th className="border px-3 py-2">Mínimo</th>
                  <th className="border px-3 py-2">Proveedor</th>
                  <th className="border px-3 py-2">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {productos
                  .filter((p) => p.stock <= p.stock_minimo)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{p.nombre}</td>

                      <td className="border px-3 py-2 text-center font-bold text-red-600">
                        {p.stock}
                      </td>

                      <td className="border px-3 py-2 text-center">
                        {p.stock_minimo}
                      </td>

                      <td className="border px-3 py-2">
                        <div className="font-semibold">
                          {p.proveedor.empresa}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.proveedor.contacto}
                        </div>
                      </td>

                      <td className="border px-3 py-2 text-center">
                        <button
                          onClick={() =>
                            contactarProveedor(
                              p.proveedor.telefono,
                              p.nombre
                            )
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

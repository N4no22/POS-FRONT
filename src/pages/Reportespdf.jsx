import { useState } from "react";
import {
  FileText,
  Printer,
  TrendingUp,
  Archive,
  Package,
  Users,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "http://localhost:3000/api/reportes";

const hoy = new Date().toISOString().split("T")[0];
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .split("T")[0];

const TIPOS = [
  {
    id: "ventas",
    label: "Ventas",
    icon: TrendingUp,
    color: "blue",
    conFecha: true,
  },
  {
    id: "arqueos",
    label: "Arqueos de caja",
    icon: Archive,
    color: "purple",
    conFecha: true,
  },
  {
    id: "stock",
    label: "Stock actual",
    icon: Package,
    color: "green",
    conFecha: false,
  },
  {
    id: "deudas",
    label: "Deudas de clientes",
    icon: Users,
    color: "red",
    conFecha: false,
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    btn: "bg-blue-600 hover:bg-blue-700",
    header: "bg-blue-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    btn: "bg-purple-600 hover:bg-purple-700",
    header: "bg-purple-600",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    btn: "bg-green-600 hover:bg-green-700",
    header: "bg-green-600",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    btn: "bg-red-600 hover:bg-red-700",
    header: "bg-red-600",
  },
};

const PDF_COLORS = {
  ventas: [30, 64, 175],
  arqueos: [109, 40, 217],
  stock: [22, 101, 52],
  deudas: [185, 28, 28],
};

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

// ─── Tarjetas de resumen por tipo ────────────────────────────────────────────
function getSummaryCards(tipo, datos) {
  if (tipo === "ventas") {
    const total = datos.reduce((a, v) => a + Number(v.total), 0);
    const pendiente = datos.reduce((a, v) => a + Number(v.saldo_pendiente), 0);
    return [
      { label: "Total facturado", value: fmt(total), color: "blue" },
      { label: "Cobrado", value: fmt(total - pendiente), color: "green" },
      { label: "Pendiente de cobro", value: fmt(pendiente), color: "red" },
      { label: "Cant. de ventas", value: String(datos.length), color: "blue" },
    ];
  }
  if (tipo === "arqueos") {
    return [
      { label: "Arqueos", value: String(datos.length), color: "purple" },
      {
        label: "Total ingresos",
        value: fmt(datos.reduce((a, x) => a + Number(x.ingresos), 0)),
        color: "green",
      },
      {
        label: "Total egresos",
        value: fmt(datos.reduce((a, x) => a + Number(x.egresos), 0)),
        color: "red",
      },
      {
        label: "Saldo final acum.",
        value: fmt(datos.reduce((a, x) => a + Number(x.saldo_final), 0)),
        color: "purple",
      },
    ];
  }
  if (tipo === "stock") {
    const sinStock = datos.filter((p) => Number(p.stock) === 0).length;
    const stockBajo = datos.filter(
      (p) => Number(p.stock) > 0 && Number(p.stock) <= 5,
    ).length;
    return [
      { label: "Total productos", value: String(datos.length), color: "green" },
      { label: "Sin stock", value: String(sinStock), color: "red" },
      { label: "Stock bajo (≤ 5)", value: String(stockBajo), color: "blue" },
      {
        label: "Stock OK",
        value: String(datos.length - sinStock - stockBajo),
        color: "green",
      },
    ];
  }
  if (tipo === "deudas") {
    const total = datos.reduce((a, d) => a + Number(d.saldo_pendiente), 0);
    return [
      {
        label: "Clientes con deuda",
        value: String(datos.length),
        color: "red",
      },
      { label: "Deuda total", value: fmt(total), color: "red" },
      {
        label: "Deuda promedio",
        value: fmt(total / (datos.length || 1)),
        color: "blue",
      },
      {
        label: "Mayor deuda",
        value: fmt(Math.max(...datos.map((d) => Number(d.saldo_pendiente)))),
        color: "red",
      },
    ];
  }
  return [];
}

export default function ReportesPDF() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(hoy);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tipo = TIPOS.find((t) => t.id === tipoSeleccionado);
  const summaryCards = datos ? getSummaryCards(tipoSeleccionado, datos) : [];

  const cargarDatos = async () => {
    if (!tipoSeleccionado) return;
    try {
      setLoading(true);
      setError("");
      setDatos(null);
      let url = `${BASE_URL}/${tipoSeleccionado}`;
      if (tipo.conFecha) url += `?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar los datos");
      setDatos(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const imprimir = () => window.print();

  // ─── PDF mejorado ─────────────────────────────────────────────────────────
  const exportarPDF = () => {
    if (!datos || !tipo) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const color = PDF_COLORS[tipoSeleccionado];
    const fechaStr = new Date().toLocaleDateString("es-AR");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Franja header ──
    doc.setFillColor(...color);
    doc.rect(0, 0, pageW, 32, "F");

    // Acento lateral
    doc.setFillColor(255, 255, 255, 0.15);
    doc.rect(0, 0, 5, 32, "F");

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(tipo.label.toUpperCase(), 14, 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 230, 255);
    if (tipo.conFecha) {
      doc.text(`Periodo: ${desde} - ${hasta}`, 14, 22);

    }
    doc.text(`Generado: ${fechaStr} | ${datos.length} registro${datos.length !== 1 ? "s" : ""}`, tipo.conFecha ? 110 : 14, 22);

    // Nombre sistema (derecha)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Sistema POS", pageW - 14, 14, { align: "right" });

    // ── Tarjetas resumen ──
    const cards = getSummaryCards(tipoSeleccionado, datos);
    const cardW = (pageW - 28 - (cards.length - 1) * 4) / cards.length;
    cards.forEach((card, i) => {
      const x = 14 + i * (cardW + 4);
      const y = 38;
      doc.setFillColor(248, 250, 255);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, cardW, 18, 2, 2, "FD");

      // Barra superior de color
      doc.setFillColor(...color);
      doc.roundedRect(x, y, cardW, 3, 1, 1, "F");

      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.setFont("helvetica", "normal");
      doc.text(card.label.toUpperCase(), x + 4, y + 9);

      doc.setFontSize(11);
      doc.setTextColor(...color);
      doc.setFont("helvetica", "bold");
      doc.text(card.value, x + 4, y + 16);
    });

    // ── Tabla ──
    const tableOpts = {
      startY: 62,
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        lineColor: [230, 232, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: color,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      footStyles: {
        fillColor: [245, 246, 250],
        textColor: [40, 40, 40],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 251, 255] },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(8);
        doc.setTextColor(170);
        doc.setFont("helvetica", "normal");
        doc.text(`Sistema POS  ·  ${fechaStr}`, 14, pageH - 8);
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          pageW - 14,
          pageH - 8,
          { align: "right" },
        );
        // Línea separadora footer
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(14, pageH - 12, pageW - 14, pageH - 12);
      },
    };

    if (tipoSeleccionado === "ventas") {
      autoTable(doc, {
        ...tableOpts,
        head: [
          [
            "#",
            "Fecha",
            "Cliente",
            "Método de pago",
            "Estado",
            "Total",
            "Pendiente",
          ],
        ],
        body: datos.map((v) => [
          v.id,
          v.fecha,
          v.cliente || "—",
          v.metodo_pago,
          v.estado,
          fmt(v.total),
          fmt(v.saldo_pendiente),
        ]),
        foot: [
          [
            "",
            "",
            "",
            "",
            "TOTAL",
            fmt(datos.reduce((a, v) => a + Number(v.total), 0)),
            fmt(datos.reduce((a, v) => a + Number(v.saldo_pendiente), 0)),
          ],
        ],
        columnStyles: {
          0: { halign: "center", cellWidth: 14 },
          5: { halign: "right" },
          6: { halign: "right" },
        },
      });
    }
    if (tipoSeleccionado === "arqueos") {
      autoTable(doc, {
        ...tableOpts,
        head: [
          [
            "#",
            "Fecha",
            "Usuario",
            "Saldo inicial",
            "Ingresos",
            "Egresos",
            "Saldo final",
            "Estado",
          ],
        ],
        body: datos.map((a) => [
          a.id,
          a.fecha,
          a.usuario,
          fmt(a.saldo_anterior),
          fmt(a.ingresos),
          fmt(a.egresos),
          fmt(a.saldo_final),
          a.estado,
        ]),
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
        },
      });
    }
    if (tipoSeleccionado === "stock") {
      autoTable(doc, {
        ...tableOpts,
        head: [
          [
            "Producto",
            "Código",
            "Stock",
            "Unidad",
            "Precio",
            "Tipo venta",
            "Categoría",
            "Proveedor",
          ],
        ],
        body: datos.map((p) => [
          p.nombre,
          p.codigo_barras || "—",
          p.stock,
          p.unidad_medida,
          fmt(p.precio),
          p.tipo_venta,
          p.categoria,
          p.proveedor,
        ]),
        columnStyles: { 4: { halign: "right" } },
      });
    }
    if (tipoSeleccionado === "deudas") {
      autoTable(doc, {
        ...tableOpts,
        head: [
          [
            "Cliente",
            "Teléfono",
            "Dirección",
            "Deuda",
            "Límite crédito",
            "Ventas fiadas",
          ],
        ],
        body: datos.map((d) => [
          d.nombre,
          d.telefono,
          d.direccion || "—",
          fmt(d.saldo_pendiente),
          fmt(d.limite_credito),
          d.cantidad_ventas_fiadas,
        ]),
        foot: [
          [
            "",
            "",
            "TOTAL DEUDA",
            fmt(datos.reduce((a, d) => a + Number(d.saldo_pendiente), 0)),
            "",
            "",
          ],
        ],
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "center" },
        },
      });
    }

    doc.save(`reporte_${tipoSeleccionado}_${fechaStr.replace(/\//g, "-")}.pdf`);
  };

  const c = tipo ? colorMap[tipo.color] : null;

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 md:px-6 py-5 md:py-7">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" size={22} /> Reportes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generá, visualizá e imprimí reportes del sistema
        </p>
      </div>

      {/* Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 print:hidden">
        {TIPOS.map((t) => {
          const cm = colorMap[t.color];
          const activo = tipoSeleccionado === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTipoSeleccionado(t.id);
                setDatos(null);
                setError("");
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activo
                  ? `${cm.bg} ${cm.border} ${cm.text}`
                  : "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <t.icon
                size={20}
                className={activo ? cm.text : "text-gray-400"}
              />
              <p
                className={`text-sm font-semibold mt-2 ${activo ? cm.text : "text-gray-700"}`}
              >
                {t.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      {tipoSeleccionado && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 mb-5 print:hidden">
          <div className="flex flex-wrap items-end gap-3">
            {tipo?.conFecha && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </>
            )}
            <button
              onClick={cargarDatos}
              disabled={loading}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${colorMap[tipo?.color]?.btn}`}
            >
              {loading ? "Cargando..." : "Generar reporte"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm print:hidden">
          {error}
        </div>
      )}

      {/* Resultado */}
      {datos && (
        <div id="reporte-print" className="space-y-4">
          {/* Header imprimible */}
          <div className={`hidden print:block rounded-xl overflow-hidden`}>
            <div className="bg-gray-900 text-white px-8 py-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                  Sistema POS
                </p>
                <h1 className="text-2xl font-bold">{tipo?.label}</h1>
                {tipo?.conFecha && (
                  <p className="text-sm text-gray-300 mt-0.5">
                    Período: {desde} al {hasta}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">
                  {new Date().toLocaleDateString("es-AR")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {datos.length} registros
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summaryCards.map((card, i) => {
              const cm = colorMap[card.color];
              return (
                <div
                  key={i}
                  className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm`}
                >
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                    {card.label}
                  </p>
                  <p className={`text-xl font-bold ${cm.text}`}>{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center print:hidden">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {tipo?.label}
                </h2>
                {tipo?.conFecha && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {desde} al {hasta} — {datos.length} registros
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={imprimir}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Printer size={15} /> Imprimir
                </button>
                <button
                  onClick={exportarPDF}
                  className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${c?.btn}`}
                >
                  <FileText size={15} /> Descargar PDF
                </button>
              </div>
            </div>

            {datos.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12">
                Sin datos para el período seleccionado
              </p>
            ) : (
              <div className="overflow-x-auto">
                {/* Ventas */}
                {tipoSeleccionado === "ventas" && (
                  <table className="w-full text-sm">
                    <thead className={`border-b border-gray-100`}>
                      <tr className="bg-gray-50">
                        {[
                          "#",
                          "Fecha",
                          "Cliente",
                          "Método",
                          "Estado",
                          "Total",
                          "Pendiente",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((v, i) => (
                        <tr
                          key={v.id}
                          className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-blue-50/30"} hover:bg-gray-50`}
                        >
                          <td className="px-4 py-2.5 text-gray-400 text-xs">
                            {v.id}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {v.fecha}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {v.cliente || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                v.metodo_pago === "efectivo"
                                  ? "bg-green-50 text-green-600"
                                  : v.metodo_pago === "transferencia"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-yellow-50 text-yellow-600"
                              }`}
                            >
                              {v.metodo_pago}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                v.estado === "pagado"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-yellow-50 text-yellow-600"
                              }`}
                            >
                              {v.estado}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900 text-right">
                            {fmt(v.total)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className={
                                Number(v.saldo_pendiente) > 0
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600"
                              }
                            >
                              {fmt(v.saldo_pendiente)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-sm font-bold text-gray-700"
                        >
                          TOTAL
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 text-right">
                          {fmt(datos.reduce((a, v) => a + Number(v.total), 0))}
                        </td>
                        <td className="px-4 py-3 font-bold text-red-600 text-right">
                          {fmt(
                            datos.reduce(
                              (a, v) => a + Number(v.saldo_pendiente),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* Arqueos */}
                {tipoSeleccionado === "arqueos" && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {[
                          "#",
                          "Fecha",
                          "Usuario",
                          "Saldo inicial",
                          "Ingresos",
                          "Egresos",
                          "Saldo final",
                          "Estado",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((a, i) => (
                        <tr
                          key={a.id}
                          className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-purple-50/30"} hover:bg-gray-50`}
                        >
                          <td className="px-4 py-2.5 text-gray-400 text-xs">
                            {a.id}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {a.fecha}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {a.usuario}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 text-right">
                            {fmt(a.saldo_anterior)}
                          </td>
                          <td className="px-4 py-2.5 text-green-600 font-semibold text-right">
                            +{fmt(a.ingresos)}
                          </td>
                          <td className="px-4 py-2.5 text-red-500 text-right">
                            -{fmt(a.egresos)}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-gray-900 text-right">
                            {fmt(a.saldo_final)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                a.estado === "cerrado"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-green-50 text-green-600"
                              }`}
                            >
                              {a.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Stock */}
                {tipoSeleccionado === "stock" && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {[
                          "Producto",
                          "Código",
                          "Stock",
                          "Precio",
                          "Tipo venta",
                          "Categoría",
                          "Proveedor",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((p, i) => (
                        <tr
                          key={i}
                          className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-green-50/30"} hover:bg-gray-50`}
                        >
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {p.nombre}
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">
                            {p.codigo_barras || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                Number(p.stock) === 0
                                  ? "bg-red-50 text-red-600"
                                  : Number(p.stock) <= 5
                                    ? "bg-yellow-50 text-yellow-600"
                                    : "bg-green-50 text-green-600"
                              }`}
                            >
                              {Number(p.stock).toLocaleString("es-AR", {
                                maximumFractionDigits: 3,
                              })}{" "}
                              {p.unidad_medida}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900 text-right">
                            {fmt(p.precio)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {p.tipo_venta}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {p.categoria}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {p.proveedor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Deudas */}
                {tipoSeleccionado === "deudas" && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {[
                          "Cliente",
                          "Teléfono",
                          "Dirección",
                          "Deuda",
                          "Límite",
                          "Ventas fiadas",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((d, i) => (
                        <tr
                          key={i}
                          className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-red-50/20"} hover:bg-gray-50`}
                        >
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {d.nombre}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {d.telefono}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {d.direccion || "—"}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-red-600 text-right">
                            {fmt(d.saldo_pendiente)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 text-right">
                            {fmt(d.limite_credito)}
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-500">
                            {d.cantidad_ventas_fiadas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-bold text-gray-700"
                        >
                          TOTAL DEUDA
                        </td>
                        <td className="px-4 py-3 font-bold text-red-600 text-right">
                          {fmt(
                            datos.reduce(
                              (a, d) => a + Number(d.saldo_pendiente),
                              0,
                            ),
                          )}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page { margin: 1.2cm; size: A4 landscape; }
          body * { visibility: hidden; }
          #reporte-print, #reporte-print * { visibility: visible; }
          #reporte-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
          .hidden.print\\:block { display: block !important; }

          table { border-collapse: collapse; width: 100%; font-size: 10px; }
          th { background-color: #f1f5f9 !important; border-bottom: 2px solid #cbd5e1; padding: 7px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          td { border-bottom: 1px solid #f1f5f9; padding: 5px 10px; }
          tr:nth-child(even) td { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          tfoot td { border-top: 2px solid #94a3b8; font-weight: bold; background-color: #f1f5f9 !important; }

          .shadow-sm, .shadow { box-shadow: none !important; }
          .rounded-xl, .rounded-lg { border-radius: 0 !important; }
          .border { border: 1px solid #e2e8f0 !important; }

          /* Tarjetas resumen en impresión */
          .grid { display: grid !important; }
          .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .gap-3 { gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}

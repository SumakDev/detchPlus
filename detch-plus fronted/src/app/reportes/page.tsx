"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Printer,
  CheckCircle2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ReportesPage() {
  const [reportesResumen, setReportesResumen] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"ventas" | "stock" | "servicios" | "clientes">("ventas");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFactura, setSelectedFactura] = useState<any | null>(null);

  async function loadResumen() {
    try {
      const res = await fetch(`${API}/reportes/resumen`, {
        headers: { ...getAuthHeaders() },
        cache: "no-store",
      });
      if (res.ok) {
        setReportesResumen(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTypeData(tipo: string) {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reportes/datos?tipo=${tipo}`, {
        headers: { ...getAuthHeaders() },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResumen();
    loadTypeData("ventas");
  }, []);

  function handleSelectType(type: "ventas" | "stock" | "servicios" | "clientes") {
    setSelectedType(type);
    loadTypeData(type);
  }

  function formatReportData(tipo: "ventas" | "stock" | "servicios" | "clientes", rawData: any[]) {
    if (!rawData || !rawData.length) return { headers: [], rows: [] };

    if (tipo === "stock") {
      const headers = [
        "ID",
        "Código Barras",
        "Producto / Descripción",
        "Marca",
        "Modelo",
        "Categoría",
        "Condición",
        "Stock Disponible",
        "Stock Reservado",
        "Stock Mínimo",
        "Stock Máximo",
        "Situación",
        "Última Actualización",
      ];
      const rows = rawData.map((r) => {
        const disp = Number(r.CAN_DIS_STO || 0);
        const min = Number(r.STO_MIN || 0);
        const situacion = disp === 0 ? "AGOTADO" : disp <= min ? "CRÍTICO" : "NORMAL";
        const marca = r.producto?.marca?.NOM_MAR || "";
        const modelo = r.producto?.modelo?.NOM_MOD || "";
        const cat = r.producto?.categoria?.NOM_CAT || "";
        const descRaw = (r.producto?.DES_PRO || "").trim();
        const desc = descRaw || [marca, modelo].filter(Boolean).join(" ") || `Producto #${r.ID_PRO}`;

        return [
          r.ID_PRO ?? "",
          r.producto?.COD_BAR_PRO ?? "S/C",
          desc,
          marca || "—",
          modelo || "—",
          cat || "—",
          r.producto?.EST_PRO ?? "NUEVO",
          disp,
          Number(r.CAN_RES_STO || 0),
          min,
          Number(r.STO_MAX || 0),
          situacion,
          r.FEC_ACT_STO ? new Date(r.FEC_ACT_STO).toLocaleDateString() : "—",
        ];
      });
      return { headers, rows };
    }

    if (tipo === "ventas") {
      const headers = [
        "Factura",
        "Cédula",
        "Cliente",
        "Fecha",
        "Subtotal ($)",
        "IVA 15% ($)",
        "Total ($)",
        "Estado",
        "Dirección",
      ];
      const rows = rawData.map((r) => [
        `FAC-${String(r.NUM_FAC).padStart(5, "0")}`,
        r.CED_CLI ?? "",
        r.cliente ? `${r.cliente.NOM_CLI || ""} ${r.cliente.APE_CLI || ""}`.trim() : r.CED_CLI,
        r.FEC_FAC ? new Date(r.FEC_FAC).toLocaleDateString() : "—",
        Number(r.SUB_FAC || 0).toFixed(2),
        Number(r.IVA_FAC || 0).toFixed(2),
        Number(r.TOT_FAC || 0).toFixed(2),
        r.EST_FAC ?? "PAGADA",
        r.DIR_FAC ?? "Venta en mostrador",
      ]);
      return { headers, rows };
    }

    if (tipo === "servicios") {
      const headers = [
        "Orden #",
        "Cédula",
        "Cliente",
        "Técnico",
        "Fecha Recepción",
        "Dispositivo / Detalle",
        "Base ($)",
        "IVA ($)",
        "Total ($)",
        "Estado",
      ];
      const rows = rawData.map((r) => [
        `OT-${String(r.NUM_SER).padStart(4, "0")}`,
        r.CED_CLI ?? "",
        r.cliente ? `${r.cliente.NOM_CLI || ""} ${r.cliente.APE_CLI || ""}`.trim() : r.CED_CLI,
        r.tecnico?.NOM_TEC ?? `Técnico #${r.ID_TEC || "1"}`,
        r.FEC_SER ? new Date(r.FEC_SER).toLocaleDateString() : "—",
        r.detalle?.DES_REP_TEL_SER || r.detalle?.PROB_REP_SER || "Servicio Técnico",
        Number(r.PRE_SER || 0).toFixed(2),
        Number(r.IVA_SER || 0).toFixed(2),
        Number(r.PRE_VEN_SER || 0).toFixed(2),
        r.EST_SER ?? "RECIBIDO",
      ]);
      return { headers, rows };
    }

    if (tipo === "clientes") {
      const headers = [
        "Cédula / RUC",
        "Nombres",
        "Apellidos",
        "Correo Electrónico",
        "Teléfono",
        "Dirección",
        "Estado",
        "Fecha Registro",
      ];
      const rows = rawData.map((r) => [
        r.CED_CLI ?? "",
        r.NOM_CLI ?? "",
        r.APE_CLI ?? "",
        r.COR_CLI ?? "",
        r.NUM_CLI ?? "",
        r.DIR_CLI ?? "—",
        r.ACT_CLI ? "ACTIVO" : "INACTIVO",
        r.FEC_REG_CLI ? new Date(r.FEC_REG_CLI).toLocaleDateString() : "—",
      ]);
      return { headers, rows };
    }

    return { headers: [], rows: [] };
  }

  function downloadCsv() {
    const { headers, rows } = formatReportData(selectedType, reportData);
    if (!rows.length) return alert("No hay datos para exportar");

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";")),
    ];

    const csvContent = "\uFEFF" + csvLines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_${selectedType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const formatted = formatReportData(selectedType, reportData);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Centro de Reportes & Analítica</h1>
            <p className="text-gray-600">Exporta informes y audita el rendimiento del negocio</p>
          </div>
          <Button onClick={downloadCsv} className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar a Excel (CSV)
          </Button>
        </div>

        {/* Tarjetas informativas de reportes predefinidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            onClick={() => handleSelectType("ventas")}
            className={`cursor-pointer transition-all border-2 ${
              selectedType === "ventas" ? "border-blue-600 bg-blue-50/20 shadow-sm" : "border-transparent hover:border-gray-200"
            }`}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">SRI / Facturas</span>
              </div>
              <h3 className="font-bold text-gray-900">Ventas & Ingresos</h3>
              <p className="text-xs text-gray-500">Historial de facturación, subtotales, IVA y estados.</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => handleSelectType("stock")}
            className={`cursor-pointer transition-all border-2 ${
              selectedType === "stock" ? "border-blue-600 bg-blue-50/20 shadow-sm" : "border-transparent hover:border-gray-200"
            }`}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">Inventario</span>
              </div>
              <h3 className="font-bold text-gray-900">Stock & Existencias</h3>
              <p className="text-xs text-gray-500">Niveles disponibles, stock mínimo y productos agotados.</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => handleSelectType("servicios")}
            className={`cursor-pointer transition-all border-2 ${
              selectedType === "servicios" ? "border-blue-600 bg-blue-50/20 shadow-sm" : "border-transparent hover:border-gray-200"
            }`}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Taller</span>
              </div>
              <h3 className="font-bold text-gray-900">Servicio Técnico</h3>
              <p className="text-xs text-gray-500">Órdenes recibidas, reparadas, entregadas y facturadas.</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => handleSelectType("clientes")}
            className={`cursor-pointer transition-all border-2 ${
              selectedType === "clientes" ? "border-blue-600 bg-blue-50/20 shadow-sm" : "border-transparent hover:border-gray-200"
            }`}
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Cartera</span>
              </div>
              <h3 className="font-bold text-gray-900">Base de Clientes</h3>
              <p className="text-xs text-gray-500">Contactos, cédulas, teléfonos y niveles de recurrencia.</p>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa de datos */}
        <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 capitalize">Vista Previa: Reporte de {selectedType}</h2>
              <p className="text-xs text-gray-500">Mostrando {formatted.rows.length} registros estructurados</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              Formato: Excel Compatible (;)
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Generando reporte y cargando registros...</div>
          ) : formatted.rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No se encontraron registros para este tipo de reporte.</div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0 border-b">
                  <tr>
                    {formatted.headers.map((col, idx) => (
                      <th key={idx} className="p-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    {selectedType === "ventas" && (
                      <th className="p-2.5 text-center font-semibold text-gray-700 whitespace-nowrap">
                        Acción
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formatted.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50 transition">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="p-2.5 text-gray-700 whitespace-nowrap">
                          {String(cell ?? "—")}
                        </td>
                      ))}
                      {selectedType === "ventas" && (
                        <td className="p-2 text-center whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFactura(reportData[rowIdx])}
                            className="h-7 text-xs flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-700 border-blue-200 text-blue-700 font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver Factura
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Visualizador e Impresor de Factura */}
        <Dialog open={!!selectedFactura} onOpenChange={(open) => !open && setSelectedFactura(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-2xl">
            <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
              {/* Barra de control / botones de acción */}
              <div className="bg-gray-900 text-white p-4 px-6 flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="font-bold text-sm tracking-wider uppercase">
                    Factura Comercial Electrónica
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm"
                  >
                    <Printer className="h-4 w-4" /> Imprimir / PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFactura(null)}
                    className="text-gray-300 hover:text-white text-xs hover:bg-gray-800"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>

              {/* Documento de Factura Imprimible */}
              <div id="invoice-print-area" className="p-8 md:p-10 space-y-8 bg-white text-gray-900">
                {/* Cabecera de la Factura */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                      DETCH<span className="text-blue-600">PLUS</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Soluciones Tecnológicas, Retail & Servicio Técnico Especializado
                    </p>
                    <div className="text-xs text-gray-600 mt-3 space-y-0.5">
                      <p><strong>RUC:</strong> 1792345678001</p>
                      <p><strong>Matriz:</strong> Av. Amazonas y República, Edif. Torre Norte</p>
                      <p><strong>Teléfono:</strong> +593 99 999 9999 | <strong>Quito - Ecuador</strong></p>
                      <p><strong>Obligado a llevar contabilidad:</strong> SÍ</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-right space-y-1.5 min-w-[240px]">
                    <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                      Factura Nº
                    </span>
                    <p className="font-mono text-2xl font-black text-gray-900">
                      FAC-{String(selectedFactura?.NUM_FAC || "").padStart(5, "0")}
                    </p>
                    <div className="pt-2 text-xs text-gray-600 space-y-1">
                      <p>
                        <strong>Fecha de Emisión:</strong>{" "}
                        {selectedFactura?.FEC_FAC
                          ? new Date(selectedFactura.FEC_FAC).toLocaleDateString("es-EC", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            selectedFactura?.EST_FAC === "ANULADA"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {selectedFactura?.EST_FAC || "PAGADA"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos del Cliente y Vendedor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/60 p-4 rounded-xl border text-xs">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                      Datos del Adquiriente / Cliente
                    </h4>
                    <p>
                      <strong className="text-gray-700">Razón Social / Nombre:</strong>{" "}
                      {selectedFactura?.cliente
                        ? [selectedFactura.cliente.NOM_CLI, selectedFactura.cliente.APE_CLI].filter(Boolean).join(" ")
                        : selectedFactura?.CED_CLI}
                    </p>
                    <p>
                      <strong className="text-gray-700">Identificación / RUC:</strong> {selectedFactura?.CED_CLI}
                    </p>
                    <p>
                      <strong className="text-gray-700">Teléfono:</strong>{" "}
                      {selectedFactura?.cliente?.NUM_CLI || "No registrado"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Correo Electrónico:</strong>{" "}
                      {selectedFactura?.cliente?.COR_CLI || "No registrado"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Dirección:</strong>{" "}
                      {selectedFactura?.DIR_FAC || selectedFactura?.cliente?.DIR_CLI || "Venta en mostrador"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                      Emisión & Atención
                    </h4>
                    <p>
                      <strong className="text-gray-700">Atendido por:</strong>{" "}
                      {selectedFactura?.empleado
                        ? [selectedFactura.empleado.NOM_EMP, selectedFactura.empleado.APE_EMP].filter(Boolean).join(" ")
                        : selectedFactura?.CED_EMP || "Sistema Central"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Identificación Empleado:</strong>{" "}
                      {selectedFactura?.CED_EMP || "EMP-001"}
                    </p>
                    <p>
                      <strong className="text-gray-700">Forma de Pago:</strong> Efectivo / Transferencia / Tarjeta
                    </p>
                    <p>
                      <strong className="text-gray-700">Moneda:</strong> Dólares Americanos (USD)
                    </p>
                  </div>
                </div>

                {/* Tabla de Productos / Detalles */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Detalle de Productos y Servicios Facturados
                  </h4>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 border-b text-gray-700 font-bold">
                        <tr>
                          <th className="p-3 text-left w-12">Cant.</th>
                          <th className="p-3 text-left w-24">Código</th>
                          <th className="p-3 text-left">Descripción del Artículo</th>
                          <th className="p-3 text-right w-28">P. Unitario ($)</th>
                          <th className="p-3 text-right w-28">Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-gray-800">
                        {selectedFactura?.detalles && selectedFactura.detalles.length > 0 ? (
                          selectedFactura.detalles.map((d: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="p-3 font-semibold text-center">{d.CAN_PRO}</td>
                              <td className="p-3 font-mono text-gray-500 text-[11px]">
                                {d.producto?.COD_BAR_PRO || `ID-${d.ID_PRO}`}
                              </td>
                              <td className="p-3 font-medium">
                                {d.producto?.DES_PRO || `Producto #${d.ID_PRO}`}
                              </td>
                              <td className="p-3 text-right font-mono">
                                ${Number(d.PRE_UNI_FAC || 0).toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-bold font-mono">
                                ${Number(d.PRE_TOT_FAC || (d.CAN_PRO * d.PRE_UNI_FAC) || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-3 font-semibold text-center">1</td>
                            <td className="p-3 font-mono text-gray-500 text-[11px]">GEN-001</td>
                            <td className="p-3 font-medium">Consumo / Venta de mostrador detallada</td>
                            <td className="p-3 text-right font-mono">
                              ${Number(selectedFactura?.SUB_FAC || 0).toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-bold font-mono">
                              ${Number(selectedFactura?.SUB_FAC || 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Desglose de Totales e Impuestos */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
                  <div className="text-xs text-gray-500 max-w-sm space-y-1">
                    <p className="font-semibold text-gray-700">Términos y Condiciones:</p>
                    <p>• Los equipos y repuestos cuentan con garantía limitada de fábrica.</p>
                    <p>• Este comprobante ha sido generado digitalmente por el sistema DetchPlus.</p>
                  </div>

                  <div className="w-full md:w-72 border rounded-xl p-4 bg-gray-50/70 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Tarifa 0%:</span>
                      <span className="font-mono font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Tarifa 15%:</span>
                      <span className="font-mono font-medium">
                        ${Number(selectedFactura?.SUB_FAC || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>IVA 15%:</span>
                      <span className="font-mono font-medium">
                        ${Number(selectedFactura?.IVA_FAC || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-base font-extrabold text-gray-900">
                      <span>TOTAL A PAGAR:</span>
                      <span className="font-mono text-blue-600">
                        ${Number(selectedFactura?.TOT_FAC || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie de Factura */}
                <div className="border-t pt-6 text-center text-xs text-gray-400 space-y-1">
                  <p className="font-medium text-gray-600">
                    ¡Gracias por su compra en DETCH PLUS!
                  </p>
                  <p>Documento oficial emitido conforme a la normativa tributaria del SRI.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reglas CSS para impresión limpia y perfecta en papel o PDF */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible !important;
          }
          #invoice-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}


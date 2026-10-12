"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

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

    // Formato con punto y coma (;) para compatibilidad total con Excel en Windows / Español
    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";")),
    ];

    // UTF-8 BOM (\uFEFF) para visualización perfecta de tildes y caracteres especiales en Excel
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
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formatted.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="p-2.5 text-gray-700 whitespace-nowrap">
                          {String(cell ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

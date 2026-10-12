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

  function downloadCsv() {
    if (!reportData.length) return alert("No hay datos para exportar");
    const headers = Object.keys(reportData[0] || {}).filter((k) => typeof reportData[0][k] !== "object");
    const rows = reportData.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_${selectedType}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Centro de Reportes & Analítica</h1>
            <p className="text-gray-600">Exporta informes y audita el rendimiento del negocio</p>
          </div>
          <Button onClick={downloadCsv} className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar a CSV
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
              <p className="text-xs text-gray-500">Mostrando {reportData.length} registros obtenidos de la base de datos</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              Formato: Tabular
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Generando reporte y cargando registros...</div>
          ) : reportData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No se encontraron registros para este tipo de reporte.</div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0 border-b">
                  <tr>
                    {Object.keys(reportData[0] || {})
                      .filter((k) => typeof reportData[0][k] !== "object")
                      .slice(0, 8)
                      .map((col) => (
                        <th key={col} className="p-2.5 text-left font-semibold text-gray-600">
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.keys(row)
                        .filter((k) => typeof row[k] !== "object")
                        .slice(0, 8)
                        .map((col) => (
                          <td key={col} className="p-2.5 text-gray-700 truncate max-w-[200px]">
                            {String(row[col] ?? "—")}
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

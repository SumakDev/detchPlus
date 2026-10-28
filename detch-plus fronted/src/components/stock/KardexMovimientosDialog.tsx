"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, ArrowDownLeft, ArrowUpRight, RefreshCw, Download, Search, FileText } from "lucide-react";
import type { MovimientoInventario, StockItem } from "@/types/stock";
import { fetchMovimientosStock } from "@/lib/api/stock";

export default function KardexMovimientosDialog({
  open,
  setOpen,
  item,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  item?: StockItem | null;
}) {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipMov, setTipMov] = useState<"TODOS" | "ENTRADA" | "SALIDA" | "AJUSTE">("TODOS");
  const [q, setQ] = useState("");

  async function loadMovimientos() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMovimientosStock({
        idPro: item?.id,
        tipMov,
        q: q.trim() || undefined,
      });
      setMovimientos(data);
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el historial de movimientos (MOV_INV)");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadMovimientos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id, tipMov]);

  function getNombreProducto(m: MovimientoInventario) {
    const p = m.producto;
    if (!p) return `Producto #${m.ID_PRO}`;
    const marca = p.marca?.NOM_MAR;
    const modelo = p.modelo?.NOM_MOD;
    if (marca || modelo) return [marca, modelo].filter(Boolean).join(" ");
    if (p.DES_PRO) return String(p.DES_PRO).split("\n")[0].slice(0, 60);
    return p.COD_BAR_PRO || `Producto #${m.ID_PRO}`;
  }

  function exportKardexCsv() {
    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["ID Movimiento", "Fecha", "Producto", "Código", "Tipo", "Cantidad", "Motivo / Detalle", "Documento Ref.", "Empleado"],
      ...movimientos.map((m) => [
        m.ID_MOV,
        m.FEC_MOV ? new Date(m.FEC_MOV).toLocaleString("es-EC") : "-",
        getNombreProducto(m),
        m.producto?.COD_BAR_PRO || "S/C",
        m.TIP_MOV,
        m.CAN_MOV,
        m.MOT_MOV || "-",
        m.NUM_DOC_MOV || "-",
        m.empleado ? `${m.empleado.NOM_EMP} ${m.empleado.APE_EMP}` : m.CED_EMP || "Sistema",
      ]),
    ];

    const csvLines = rows.map((row) => row.map(escapeCsv).join(";"));
    const csvContent = "\uFEFF" + csvLines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kardex_mov_inv_${item ? `prod_${item.id}_` : ""}${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalEntradas = movimientos
    .filter((m) => m.TIP_MOV === "ENTRADA" || (m.TIP_MOV === "AJUSTE" && Number(m.CAN_MOV) > 0))
    .reduce((acc, m) => acc + Math.abs(Number(m.CAN_MOV || 0)), 0);

  const totalSalidas = movimientos
    .filter((m) => m.TIP_MOV === "SALIDA" || (m.TIP_MOV === "AJUSTE" && Number(m.CAN_MOV) < 0))
    .reduce((acc, m) => acc + Math.abs(Number(m.CAN_MOV || 0)), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-indigo-600" />
            <span>
              {item
                ? `Kardex del Producto: ${item.producto?.nombre || `#${item.id}`}`
                : "Kardex General de Movimientos de Inventario (MOV_INV)"}
            </span>
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Auditoría trazable de todas las entradas, salidas por ventas POS/Online, altas de teléfonos y ajustes de stock.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen rápido del Kardex */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-xs text-slate-500 font-medium">Total Movimientos Listados</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{movimientos.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <span className="text-xs text-emerald-700 font-medium">Unidades Ingresadas (+)</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">+{totalEntradas}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3">
              <span className="text-xs text-rose-700 font-medium">Unidades Egresadas (-)</span>
              <p className="text-xl font-bold text-rose-800 mt-0.5">-{totalSalidas}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                <Input
                  placeholder="Buscar por motivo, factura, pedido o producto..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadMovimientos()}
                  className="pl-8 bg-white text-sm h-9"
                />
              </div>
              <select
                value={tipMov}
                onChange={(e) => setTipMov(e.target.value as any)}
                className="border border-gray-300 bg-white rounded-md px-2.5 py-1.5 text-xs font-medium h-9"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="ENTRADA">Entradas (+)</option>
                <option value="SALIDA">Salidas (-)</option>
                <option value="AJUSTE">Ajustes (±)</option>
              </select>
              <Button size="sm" variant="outline" onClick={loadMovimientos} className="h-9 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Filtrar
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={exportKardexCsv}
              disabled={movimientos.length === 0}
              className="h-9 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Exportar Kardex CSV
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Tabla de Movimientos */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr className="text-left font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-2.5">Fecha y Hora</th>
                    {!item && <th className="p-2.5">Producto</th>}
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Cant.</th>
                    <th className="p-2.5">Motivo / Operación</th>
                    <th className="p-2.5">Documento Ref.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={item ? 5 : 6} className="p-6 text-center text-gray-500">
                        Cargando movimientos de inventario...
                      </td>
                    </tr>
                  ) : movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={item ? 5 : 6} className="p-6 text-center text-gray-500">
                        No se encontraron movimientos registrados en MOV_INV para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((m) => {
                      const isEntrada =
                        m.TIP_MOV === "ENTRADA" || (m.TIP_MOV === "AJUSTE" && Number(m.CAN_MOV) > 0);
                      const isSalida =
                        m.TIP_MOV === "SALIDA" || (m.TIP_MOV === "AJUSTE" && Number(m.CAN_MOV) < 0);

                      return (
                        <tr key={m.ID_MOV} className="hover:bg-slate-50/70">
                          <td className="p-2.5 whitespace-nowrap text-gray-600 font-mono">
                            {m.FEC_MOV
                              ? new Date(m.FEC_MOV).toLocaleString("es-EC", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </td>
                          {!item && (
                            <td className="p-2.5 font-semibold text-gray-900">
                              <div>{getNombreProducto(m)}</div>
                              <div className="text-[10px] font-mono text-gray-400">
                                ID #{m.ID_PRO} {m.producto?.COD_BAR_PRO ? `• ${m.producto.COD_BAR_PRO}` : ""}
                              </div>
                            </td>
                          )}
                          <td className="p-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                m.TIP_MOV === "ENTRADA"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : m.TIP_MOV === "SALIDA"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                              }`}
                            >
                              {isEntrada ? (
                                <ArrowDownLeft className="w-3 h-3" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3" />
                              )}
                              {m.TIP_MOV}
                            </span>
                          </td>
                          <td
                            className={`p-2.5 font-extrabold text-sm ${
                              isEntrada ? "text-emerald-700" : isSalida ? "text-rose-700" : "text-gray-800"
                            }`}
                          >
                            {isEntrada && Number(m.CAN_MOV) > 0
                              ? `+${m.CAN_MOV}`
                              : m.TIP_MOV === "SALIDA"
                              ? `-${Math.abs(Number(m.CAN_MOV))}`
                              : m.CAN_MOV}
                          </td>
                          <td className="p-2.5 text-gray-700">{m.MOT_MOV || "Movimiento de inventario"}</td>
                          <td className="p-2.5 font-mono text-gray-500">
                            {m.NUM_DOC_MOV ? (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                <FileText className="w-3 h-3" />
                                {m.NUM_DOC_MOV}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


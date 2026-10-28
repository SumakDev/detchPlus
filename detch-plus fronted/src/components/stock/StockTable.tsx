"use client";

import { useState, Fragment } from "react";
import { StockItem } from "@/types/stock";
import { formatEstadoProducto } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Smartphone, ChevronDown, ChevronUp } from "lucide-react";

export default function StockTable({
  items,
  onAdjust,
  onUpdateMin,
}: {
  items: StockItem[];
  onAdjust: (row: StockItem) => void;
  onUpdateMin: (row: StockItem) => void;
}) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Producto / Desglose (Color • Almacenamiento)</th>
            <th className="p-3">Código</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Disponible</th>
            <th className="p-3">Reservado</th>
            <th className="p-3">Mínimo</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-64">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500">
                No hay registros de stock
              </td>
            </tr>
          )}
          {items.map((r) => {
            const colorBadge =
              r.estado === "AGOTADO"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : r.estado === "CRITICO"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-green-50 text-green-700 border-green-200";

            const variantes = r.producto?.resumenVariantes || [];
            const unidades = r.producto?.detallesTelefono || [];
            const isPhoneWithUnits = unidades.length > 0;
            const isExpanded = expandedRowId === r.id;

            return (
              <Fragment key={r.id}>
                <tr className="border-t hover:bg-gray-50/40">
                  <td className="p-3 font-medium text-gray-900">
                    <div className="flex items-start gap-3">
                      {r.producto?.img ? (
                        <img
                          src={r.producto.img}
                          alt={r.producto.nombre || `Producto ${r.id}`}
                          className="h-10 w-10 rounded object-cover border shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded border bg-gray-50 shrink-0 mt-0.5 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <div className="truncate font-semibold">{r.producto?.nombre || `#${r.id}`}</div>
                        {r.producto?.marca || r.producto?.modelo ? (
                          <div className="text-xs text-gray-500 truncate">
                            {[r.producto?.marca, r.producto?.modelo].filter(Boolean).join(" ")}
                          </div>
                        ) : null}

                        {/* Chips con el conteo exacto por Color y Almacenamiento */}
                        {variantes.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {variantes.map((v, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                              >
                                <span className="font-bold">{v.disponibles}x</span> {v.color} • {v.almacenamiento}
                                <span className="text-[10px] text-blue-600">
                                  ({formatEstadoProducto(v.estadoFisico)})
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{r.producto?.codigo || "-"}</td>
                  <td className="p-3">{r.ubicacion || "-"}</td>
                  <td className="p-3 font-bold text-gray-900">{r.disponible}</td>
                  <td className="p-3">{r.reservado}</td>
                  <td className="p-3">{r.minimo}</td>
                  <td className="p-3">
                    <span className={`text-xs rounded-full px-2 py-1 border ${colorBadge}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {isPhoneWithUnits && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                          className="text-blue-700 border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-xs"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 mr-1" />
                          )}
                          IMEIs ({unidades.length})
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onAdjust(r)} className="text-xs">
                        Ajustar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onUpdateMin(r)} className="text-xs">
                        Mínimo
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandible con el detalle de cada teléfono físico (DET_TELE) */}
                {isExpanded && isPhoneWithUnits && (
                  <tr className="bg-slate-50/80 border-t border-slate-200">
                    <td colSpan={8} className="p-3.5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Unidades físicas registradas en DET_TELE para {r.producto?.nombre}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Total disponibles: {r.disponible} de {unidades.length} registradas
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {unidades.map((u, i) => (
                            <div
                              key={u.ID_DET_TEL || i}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">
                                  {u.COL_TEL || "Sin color"} • {u.ALM_TEL || "S/A"}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    (u.DIS_TEL || "DISPONIBLE") === "DISPONIBLE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : u.DIS_TEL === "RESERVADO"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {u.DIS_TEL || "DISPONIBLE"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>
                                  IMEI: <strong className="font-mono">{u.IME_TEL || "No registrado"}</strong>
                                </span>
                                <span>{formatEstadoProducto(u.EST_FIS_TEL)}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 flex flex-wrap gap-2 pt-0.5 border-t border-slate-100">
                                <span>Bat: {u.EST_BAT_TEL ?? 10}/10</span>
                                <span>Pant: {u.EST_PAN_TEL ?? 10}/10</span>
                                <span>Carc: {u.EST_CAR_TEL ?? 10}/10</span>
                                <span>Cám: {u.EST_CAM_TEL ?? 10}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState, Fragment } from "react";
import { StockItem } from "@/types/stock";
import { formatEstadoProducto } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Smartphone, ChevronDown, ChevronUp, Tag, Layers } from "lucide-react";

export default function StockTable({
  items,
  onAdjust,
  onManagePhoneUnits,
  onUpdateMin,
}: {
  items: StockItem[];
  onAdjust: (row: StockItem) => void;
  onManagePhoneUnits: (row: StockItem) => void;
  onUpdateMin: (row: StockItem) => void;
}) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th className="p-3">Producto</th>
            <th className="p-3">Clasificación</th>
            <th className="p-3">Colores y Almacenamiento</th>
            <th className="p-3">Disponible</th>
            <th className="p-3">Reservado</th>
            <th className="p-3">Mínimo</th>
            <th className="p-3">Estado Stock</th>
            <th className="p-3 w-64">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="p-6 text-center text-gray-500">
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

            const isPhone =
              Number(r.producto?.idCat) === 1 ||
              r.producto?.categoria?.toUpperCase() === "TELEFONO";
            const variantes = r.producto?.resumenVariantes || [];
            const unidades = r.producto?.detallesTelefono || [];
            const isExpanded = expandedRowId === r.id;

            return (
              <Fragment key={r.id}>
                <tr className="border-t hover:bg-gray-50/40">
                  {/* Producto */}
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
                      <div className="min-w-0 space-y-0.5">
                        <div className="truncate font-semibold">{r.producto?.nombre || `#${r.id}`}</div>
                        {r.producto?.marca || r.producto?.modelo ? (
                          <div className="text-xs text-gray-500 truncate">
                            {[r.producto?.marca, r.producto?.modelo].filter(Boolean).join(" • ")}
                          </div>
                        ) : null}
                        <div className="text-[11px] font-mono text-gray-400">
                          Cód: {r.producto?.codigo || "S/C"} {r.ubicacion ? `• ${r.ubicacion}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Clasificación (Categoría + Condición) */}
                  <td className="p-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {r.producto?.categoria || "General"}
                      </span>
                      {r.producto?.estadoFisico && (
                        <span className="text-[11px] text-gray-600 font-medium px-1">
                          {formatEstadoProducto(r.producto.estadoFisico)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Colores y Almacenamiento (Desglose de variantes) */}
                  <td className="p-3">
                    {isPhone ? (
                      variantes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {variantes.map((v, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-medium"
                            >
                              <span className="font-extrabold text-blue-700">{v.disponibles}x</span>
                              <span className="font-semibold">{v.color}</span>
                              <span className="text-blue-400">•</span>
                              <span className="font-mono font-bold">{v.almacenamiento}</span>
                              <span className="text-[10px] bg-white/80 px-1.5 py-0.2 rounded text-blue-700 border border-blue-100">
                                {formatEstadoProducto(v.estadoFisico)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1 inline-flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Sin equipos registrados (usa &quot;Gestionar Equipos&quot;)</span>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-gray-400 italic">Conteo general por unidad</span>
                    )}
                  </td>

                  <td className="p-3 font-bold text-gray-900 text-base">{r.disponible}</td>
                  <td className="p-3 text-gray-600">{r.reservado}</td>
                  <td className="p-3 text-gray-600">{r.minimo}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${colorBadge}`}>
                      {r.estado}
                    </span>
                  </td>

                  {/* Acciones coherentes según Categoría */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {isPhone ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onManagePhoneUnits(r)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                          >
                            <Smartphone className="w-3.5 h-3.5 mr-1" />
                            Gestionar Equipos
                          </Button>
                          {unidades.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                              className="text-xs"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                              )}
                              IMEIs ({unidades.length})
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => onAdjust(r)} className="text-xs">
                          Ajustar cantidad
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onUpdateMin(r)} className="text-xs">
                        Mínimo
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandible con el detalle de cada teléfono físico (DET_TELE) */}
                {isExpanded && unidades.length > 0 && (
                  <tr className="bg-slate-50/80 border-t border-slate-200">
                    <td colSpan={8} className="p-3.5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Unidades físicas en DET_TELE para {r.producto?.nombre}
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
                                <span className="font-medium text-blue-700">
                                  {formatEstadoProducto(u.EST_FIS_TEL)}
                                </span>
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

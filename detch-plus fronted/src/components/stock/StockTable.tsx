"use client";

import { StockItem } from "@/types/stock";
import { Button } from "@/components/ui/button";

export default function StockTable({
  items,
  onAdjust,
  onUpdateMin,
}: {
  items: StockItem[];
  onAdjust: (row: StockItem) => void;
  onUpdateMin: (row: StockItem) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Producto</th>
            <th className="p-3">Código</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Disponible</th>
            <th className="p-3">Reservado</th>
            <th className="p-3">Mínimo</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-56">Acciones</th>
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

            return (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {r.producto?.img ? (
                      <img
                        src={r.producto.img}
                        alt={r.producto.nombre || `Producto ${r.id}`}
                        className="h-10 w-10 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded border bg-gray-50" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate">{r.producto?.nombre || `#${r.id}`}</div>
                      {r.producto?.marca || r.producto?.modelo ? (
                        <div className="text-xs text-gray-500 truncate">
                          {[r.producto?.marca, r.producto?.modelo].filter(Boolean).join(" ")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="p-3">{r.producto?.codigo || "-"}</td>
                <td className="p-3">{r.ubicacion || "-"}</td>
                <td className="p-3">{r.disponible}</td>
                <td className="p-3">{r.reservado}</td>
                <td className="p-3">{r.minimo}</td>
                <td className="p-3">
                  <span className={`text-xs rounded-full px-2 py-1 border ${colorBadge}`}>
                    {r.estado}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onAdjust(r)}>
                      Ajustar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onUpdateMin(r)}>
                      Cambiar mínimo
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
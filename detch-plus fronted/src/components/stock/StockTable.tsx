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
            <th className="p-3">SKU</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Mínimo</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-56">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">No hay registros de stock</td>
            </tr>
          )}
          {items.map((r) => {
            const critico = r.STOCK <= r.MIN_STOCK && r.STOCK > 0;
            const agotado = r.STOCK === 0;
            return (
              <tr key={r.ID_PRO} className="border-t">
                <td className="p-3 font-medium text-gray-900">{r.NOM_PRO}</td>
                <td className="p-3">{r.SKU || "-"}</td>
                <td className="p-3">{r.UBICACION || "-"}</td>
                <td className="p-3">{r.STOCK}</td>
                <td className="p-3">{r.MIN_STOCK}</td>
                <td className="p-3">
                  <span
                    className={`text-xs rounded-full px-2 py-1 border ${
                      agotado
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : critico
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {agotado ? "Agotado" : critico ? "Crítico" : "OK"}
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
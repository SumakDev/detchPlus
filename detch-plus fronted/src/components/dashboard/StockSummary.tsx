"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { StockResumen } from "@/lib/api/dashboard";

export default function StockSummary({
  data,
  error,
  loading,
}: {
  data: StockResumen | null;
  error: string | null;
  loading: boolean;
}) {
  const criticos = data?.criticos ?? 0;
  const agotados = data?.agotados ?? 0;
  const total = data?.totalProductos ?? 1;
  const pctCriticos = Math.min(100, Math.round((criticos / Math.max(1, total)) * 100));
  const pctAgotados = Math.min(100, Math.round((agotados / Math.max(1, total)) * 100));

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Estado de Stock</h2>
          <span className="text-sm text-gray-500">Inventario</span>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 mb-4 text-sm">Error: {error}</div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Productos</p>
            <p className="text-2xl font-semibold text-gray-900">{loading ? "…" : data?.totalProductos ?? "—"}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Críticos</p>
            <p className="text-2xl font-semibold text-amber-600">{loading ? "…" : criticos}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Agotados</p>
            <p className="text-2xl font-semibold text-rose-600">{loading ? "…" : agotados}</p>
          </div>
        </div>

        {/* Barras de estado */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>% Críticos</span>
              <span>{loading ? "…" : `${pctCriticos}%`}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded">
              <div className="h-2 bg-amber-500 rounded" style={{ width: `${pctCriticos}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>% Agotados</span>
              <span>{loading ? "…" : `${pctAgotados}%`}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded">
              <div className="h-2 bg-rose-500 rounded" style={{ width: `${pctAgotados}%` }} />
            </div>
          </div>
        </div>

        {/* Top críticos */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Top productos críticos</h3>
          {!loading && (data?.topCriticos?.length ?? 0) === 0 && (
            <p className="text-sm text-gray-500">No hay productos críticos</p>
          )}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {(data?.topCriticos ?? []).slice(0, 6).map((p) => (
              <div key={p.sku} className="flex items-center justify-between rounded border p-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>{p.stock} u</p>
                  <p className="text-xs text-gray-500">Mín: {p.min}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
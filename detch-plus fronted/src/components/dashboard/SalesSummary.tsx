"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { VentasResumen } from "@/lib/api/dashboard";

export default function SalesSummary({
  data,
  error,
  loading,
}: {
  data: VentasResumen | null;
  error: string | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resumen de Ventas</h2>
          <span className="text-sm text-gray-500">Hoy</span>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 mb-4 text-sm">Error: {error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Total del día</p>
            <p className="text-2xl font-semibold text-green-600">{loading ? "…" : data?.totalHoyFmt ?? "—"}</p>
            {data && (
              <p className="text-[11px] text-gray-500 mt-1">
                Mostrador: ${(data.facturasHoyTotal ?? 0).toFixed(2)} | Online: ${(data.pedidosOnlineHoyTotal ?? 0).toFixed(2)}
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Tickets / Pedidos</p>
            <p className="text-2xl font-semibold text-blue-600">{loading ? "…" : data?.ticketsHoy ?? "—"}</p>
            {data && (
              <p className="text-[11px] text-gray-500 mt-1">
                {data.totalPedidosOnline ?? 0} pedidos web registrados
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Promedio ticket</p>
            <p className="text-2xl font-semibold text-gray-900">
              {loading ? "…" : data ? `$${data.promedioTicket.toFixed(2)}` : "—"}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Crecimiento vs ayer</p>
            <p className={`text-2xl font-semibold ${!loading && data && data.crecimientoVsAyerPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {loading ? "…" : data ? `${data.crecimientoVsAyerPct}%` : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
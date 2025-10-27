"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { ReportesResumen } from "@/lib/api/dashboard";

export default function ReportsPanel({
  data,
  error,
  loading,
}: {
  data: ReportesResumen | null;
  error: string | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reportes</h2>
          <Link href="/reportes" className="text-sm text-blue-600 hover:underline">
            Ver más
          </Link>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 mb-4 text-sm">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Generados este mes</p>
            <p className="text-2xl font-semibold text-purple-600">{loading ? "…" : data?.generadosMes ?? "—"}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-semibold text-amber-600">{loading ? "…" : data?.pendientes ?? "—"}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Última actualización</p>
            <p className="text-2xl font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-900 mb-2">Recientes</h3>
        {(!loading && (data?.recientes?.length ?? 0) === 0) && (
          <p className="text-sm text-gray-500">No hay reportes recientes</p>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(data?.recientes ?? []).slice(0, 6).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border p-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{r.nombre}</p>
                <p className="text-xs text-gray-500">{new Date(r.fecha).toLocaleString()}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  r.estado === "LISTO"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : r.estado === "PENDIENTE"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {r.estado}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/reportes">
            <button className="border border-gray-200 rounded-md px-3 py-2 text-sm hover:bg-gray-50">Generar reporte</button>
          </Link>
          <Link href="/reportes">
            <button className="border border-gray-200 rounded-md px-3 py-2 text-sm hover:bg-gray-50">Ver histórico</button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
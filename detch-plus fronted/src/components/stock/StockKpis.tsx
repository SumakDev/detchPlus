"use client";

export default function StockKpis({
  total,
  criticos,
  agotados,
}: {
  total: number;
  criticos: number;
  agotados: number;
}) {
  const ok = Math.max(0, total - criticos - agotados);
  const tiles = [
    { label: "Productos", value: total, color: "text-gray-900" },
    { label: "Críticos", value: criticos, color: "text-amber-600" },
    { label: "Agotados", value: agotados, color: "text-rose-600" },
    { label: "OK", value: ok, color: "text-emerald-600" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">{t.label}</p>
          <p className={`text-2xl font-semibold ${t.color}`}>{t.value}</p>
        </div>
      ))}
    </div>
  );
}
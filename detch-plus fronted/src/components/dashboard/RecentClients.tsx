"use client";

type Item = {
  CED_CLI: string;
  NOMBRE: string;
  CORREO: string;
  ACTIVO: boolean;
  FECHA_REGISTRO: string;
};

export default function RecentClients({ items, loading }: { items: Item[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 rounded bg-gray-100" />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-600">No hay actividad reciente</div>;
  }
  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {items.map((c) => (
        <div key={c.CED_CLI} className="flex items-center justify-between p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{c.NOMBRE}</p>
            <p className="text-xs text-gray-500 truncate">{c.CORREO || "Sin correo"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs rounded-full px-2 py-1 ${
                c.ACTIVO ? "bg-green-50 text-green-700 border border-green-200" : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {c.ACTIVO ? "Activo" : "Inactivo"}
            </span>
            <span className="text-xs text-gray-500">{new Date(c.FECHA_REGISTRO).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
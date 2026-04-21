"use client";

import { Button } from "@/components/ui/button";
import type { SesionUsuario } from "@/types/sesionUsuario";

function fmt(dt?: string) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function MySessionsTable({
  items,
  currentId,
  onClose,
  onCloseOthers,
}: {
  items: SesionUsuario[];
  currentId?: string | null;
  onClose: (row: SesionUsuario) => void;
  onCloseOthers: (keepId?: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onCloseOthers(currentId || undefined)}>
          Cerrar otras sesiones
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">IP</th>
              <th className="p-3">Agente</th>
              <th className="p-3">Inicio</th>
              <th className="p-3">Última act.</th>
              <th className="p-3">Expira</th>
              <th className="p-3">Actual</th>
              <th className="p-3 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">No hay sesiones</td></tr>
            )}
            {items.map((s) => {
              const isCurrent = currentId && s.ID_SES_USU === currentId;
              const exp = new Date(s.EXP_SES_USU).getTime() <= Date.now();
              return (
                <tr key={s.ID_SES_USU} className="border-t align-top">
                  <td className="p-3 font-mono text-xs break-all">{s.ID_SES_USU}</td>
                  <td className="p-3">{s.IP_SES_USU || "-"}</td>
                  <td className="p-3 max-w-[320px]">
                    <span className="line-clamp-2" title={s.UA_SES_USU || ""}>{s.UA_SES_USU || "-"}</span>
                  </td>
                  <td className="p-3">{fmt(s.FEC_INI_SES)}</td>
                  <td className="p-3">{fmt(s.FEC_ULG_SES)}</td>
                  <td className="p-3">{fmt(s.EXP_SES_USU)}</td>
                  <td className="p-3">{isCurrent ? "Sí" : "No"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" disabled={!!isCurrent} onClick={() => onClose(s)}>
                        Cerrar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!currentId && (
        <p className="text-xs text-amber-600">
          Nota: no se detectó la sesión actual (session_id). Puedes habilitarla guardando el ID de sesión retornado en el login.
        </p>
      )}
    </div>
  );
}
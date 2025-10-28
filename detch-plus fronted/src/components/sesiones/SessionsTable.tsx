"use client";

import { Button } from "@/components/ui/button";
import type { SesionUsuario } from "@/types/sesionUsuario";

function fmt(dt?: string) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function SessionsTable({
  items,
  onClose,
  onDelete,
}: {
  items: SesionUsuario[];
  onClose: (row: SesionUsuario) => void;
  onDelete?: (row: SesionUsuario) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Usuario</th>
            <th className="p-3">IP</th>
            <th className="p-3">Agente</th>
            <th className="p-3">Inicio</th>
            <th className="p-3">Última act.</th>
            <th className="p-3">Expira</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={9} className="p-4 text-center text-gray-500">No hay sesiones</td></tr>
          )}
          {items.map((s) => {
            const exp = new Date(s.EXP_SES_USU).getTime() <= Date.now();
            const active = s.ACT_SES_USU && !exp;
            const chip = active
              ? "bg-green-50 text-green-700 border-green-200"
              : exp
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <tr key={s.ID_SES_USU} className="border-t align-top">
                <td className="p-3 font-mono text-xs break-all">{s.ID_SES_USU}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {s.usuario ? [s.usuario.NOM_USU, s.usuario.APE_USU].filter(Boolean).join(" ") || s.usuario.USR_USU : `#${s.ID_USU}`}
                    </span>
                    {s.usuario?.USR_USU && <span className="text-xs text-gray-500">{s.usuario.USR_USU}</span>}
                  </div>
                </td>
                <td className="p-3">{s.IP_SES_USU || "-"}</td>
                <td className="p-3 max-w-[320px]">
                  <span className="line-clamp-2" title={s.UA_SES_USU || ""}>{s.UA_SES_USU || "-"}</span>
                </td>
                <td className="p-3">{fmt(s.FEC_INI_SES)}</td>
                <td className="p-3">{fmt(s.FEC_ULG_SES)}</td>
                <td className="p-3">{fmt(s.EXP_SES_USU)}</td>
                <td className="p-3">
                  <span className={`text-xs rounded-full px-2 py-1 border inline-flex items-center gap-1 ${chip}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${active ? "bg-green-600" : exp ? "bg-rose-600" : "bg-gray-500"}`} />
                    {active ? "Activa" : exp ? "Expirada" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onClose(s)}>Cerrar</Button>
                    {onDelete && (
                      <Button variant="outline" size="sm" onClick={() => onDelete(s)}>Eliminar</Button>
                    )}
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
"use client";

import { Button } from "@/components/ui/button";
import type { ServicioTecnico } from "@/lib/api/servicio-tecnico";

type Estado = ServicioTecnico["EST_SER"];

const STATUS_META: Record<
  Estado,
  { text: string; bg: string; border: string }
> = {
  RECIBIDO: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  EN_PROCESO: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  TERMINADO: { text: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  ENTREGADO: { text: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
};

export default function ServiceTechTable({
  items,
  onEdit,
  onChangeStatus,
  onDetail,
}: {
  items: ServicioTecnico[];
  onEdit: (row: ServicioTecnico) => void;
  onChangeStatus: (row: ServicioTecnico) => void;
  onDetail: (row: ServicioTecnico) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Orden</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Técnico</th>
            <th className="p-3">Base</th>
            <th className="p-3">IVA</th>
            <th className="p-3">Total</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-[260px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500">
                No hay servicios técnicos
              </td>
            </tr>
          )}
          {items.map((r) => {
            const meta = STATUS_META[r.EST_SER];
            return (
              <tr key={r.NUM_SER} className="border-t">
                <td className="p-3 font-medium">{r.NUM_SER}</td>
                <td className="p-3">{new Date(r.FEC_SER).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {r.cliente?.nombreCompleto || r.CED_CLI}
                    </span>
                    <span className="text-xs text-gray-500">{r.CED_CLI}</span>
                  </div>
                </td>
                <td className="p-3">{r.tecnico?.NOM_TEC || r.ID_TEC}</td>
                <td className="p-3">${Number(r.PRE_SER).toFixed(2)}</td>
                <td className="p-3">${Number(r.IVA_SER).toFixed(2)}</td>
                <td className="p-3 font-semibold">${Number(r.PRE_VEN_SER).toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={[
                      "text-xs rounded-full px-2 py-1 border inline-flex items-center gap-1",
                      meta.bg,
                      meta.text,
                      meta.border,
                    ].join(" ")}
                  >
                    {/* little colored dot for consistency */}
                    <span
                      className={[
                        "inline-block h-1.5 w-1.5 rounded-full",
                        meta.text.replace("text-", "bg-"),
                      ].join(" ")}
                    />
                    {r.EST_SER}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onChangeStatus(r)}>
                      Cambiar estado
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
"use client";

import { Button } from "@/components/ui/button";
import type { ServicioTecnico } from "@/lib/api/servicio-tecnico";

export default function ServiceTechTable({
  items,
  onEdit,
  onChangeStatus,
}: {
  items: ServicioTecnico[];
  onEdit: (row: ServicioTecnico) => void;
  onChangeStatus: (row: ServicioTecnico) => void;
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
            <th className="p-3 w-40">Acciones</th>
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
          {items.map((r) => (
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
                <span className="text-xs rounded-full px-2 py-1 border bg-gray-50 text-gray-700">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
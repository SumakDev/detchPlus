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
  onChangeStatus: (row: ServicioTecnico, newStatus?: ServicioTecnico["EST_SER"]) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-gray-600 font-semibold">
            <th className="p-3">Orden #</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Técnico</th>
            <th className="p-3">Base</th>
            <th className="p-3">IVA (15%)</th>
            <th className="p-3">Total</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-40 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="p-8 text-center text-gray-500">
                No hay órdenes de servicio técnico registradas.
              </td>
            </tr>
          )}
          {items.map((r) => (
            <tr key={r.NUM_SER} className="hover:bg-gray-50/70 transition">
              <td className="p-3 font-mono font-bold text-gray-900">OT-{String(r.NUM_SER).padStart(4, "0")}</td>
              <td className="p-3 text-gray-600">{new Date(r.FEC_SER).toLocaleDateString()}</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {r.cliente?.nombreCompleto || r.CED_CLI}
                  </span>
                  <span className="text-xs text-gray-500">{r.CED_CLI}</span>
                </div>
              </td>
              <td className="p-3 text-gray-800">{r.tecnico?.NOM_TEC || `Técnico #${r.ID_TEC}`}</td>
              <td className="p-3 text-gray-700">${Number(r.PRE_SER).toFixed(2)}</td>
              <td className="p-3 text-gray-700">${Number(r.IVA_SER).toFixed(2)}</td>
              <td className="p-3 font-bold text-gray-900">${Number(r.PRE_VEN_SER).toFixed(2)}</td>
              <td className="p-3">
                <select
                  value={r.EST_SER}
                  onChange={(e) => onChangeStatus(r, e.target.value as ServicioTecnico["EST_SER"])}
                  className={`text-xs rounded-lg px-2.5 py-1.5 font-bold border cursor-pointer transition shadow-xs ${
                    r.EST_SER === "TERMINADO"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : r.EST_SER === "ENTREGADO"
                      ? "bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100"
                      : r.EST_SER === "EN_PROCESO"
                      ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      : "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                  }`}
                >
                  <option value="RECIBIDO">RECIBIDO</option>
                  <option value="EN_PROCESO">EN_PROCESO</option>
                  <option value="TERMINADO">TERMINADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                </select>
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => onEdit(r)} className="h-8 text-xs">
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeStatus(r)}
                    className="h-8 text-xs bg-gray-50 hover:bg-gray-100"
                  >
                    Estado
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
"use client";

import { Button } from "@/components/ui/button";
import type { Tecnico } from "@/types/tecnico";

export default function TecnicosTable({
  items,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  items: Tecnico[];
  onEdit: (row: Tecnico) => void;
  onToggleStatus: (row: Tecnico) => void;
  onDelete: (row: Tecnico) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            
            <th className="p-3">Nombre</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Especialidad</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-40">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">No hay técnicos</td>
            </tr>
          )}
          {items.map((t) => (
            <tr key={t.ID_TEC} className="border-t">
              
              <td className="p-3 font-medium text-gray-900">{t.NOM_TEC}</td>
              <td className="p-3">{t.TEL_TEC || "-"}</td>
              <td className="p-3">{t.ESP_TEC || "-"}</td>
              <td className="p-3">
                <span className={`text-xs rounded-full px-2 py-1 border ${t.EST_TEC ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                  {t.EST_TEC ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onDelete(t)} className="text-rose-600 hover:bg-rose-50 border-rose-200">Eliminar</Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(t)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => onToggleStatus(t)}>
                    {t.EST_TEC ? "Desactivar" : "Activar"}
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
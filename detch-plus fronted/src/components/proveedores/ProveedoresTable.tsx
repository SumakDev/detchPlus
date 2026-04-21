"use client";

import { Button } from "@/components/ui/button";
import type { Proveedor } from "@/types/proveedor";

export default function ProveedoresTable({
  items,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  items: Proveedor[];
  onEdit: (row: Proveedor) => void;
  onToggleStatus: (row: Proveedor) => void;
  onDelete?: (row: Proveedor) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Id</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">RUC</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Email</th>
            <th className="p-3">Contacto</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500">No hay proveedores</td>
            </tr>
          )}
          {items.map((p) => (
            <tr key={p.ID_PRV} className="border-t">
              <td className="p-3 font-medium">{p.ID_PRV}</td>
              <td className="p-3 font-medium text-gray-900">{p.NOM_PRV}</td>
              <td className="p-3">{p.RUC_PRV || "-"}</td>
              <td className="p-3">{p.TEL_PRV || "-"}</td>
              <td className="p-3">{p.COR_PRV || "-"}</td>
              <td className="p-3">{p.CON_PRI_PRV || "-"}</td>
              <td className="p-3">
                <span className={`text-xs rounded-full px-2 py-1 border ${p.EST_PRV ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                  {p.EST_PRV ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => onToggleStatus(p)}>
                    {p.EST_PRV ? "Desactivar" : "Activar"}
                  </Button>
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={() => onDelete(p)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
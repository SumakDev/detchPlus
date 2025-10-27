"use client";

import { Button } from "@/components/ui/button";
import type { Producto } from "@/types/product";

export default function ProductTable({
  productos,
  onEdit,
  onDelete,
}: {
  productos: Producto[];
  onEdit: (p: Producto) => void;
  onDelete: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Código</th>
            <th className="p-3">Marca</th>
            <th className="p-3">Modelo</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-40">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 && (
            <tr><td colSpan={8} className="p-4 text-center text-gray-500">No hay productos</td></tr>
          )}
          {productos.map((p) => (
            <tr key={p.ID_PRO} className="border-t">
              <td className="p-3">
                {p.IMG_URL ? (
                  <img src={p.IMG_URL} alt={p.NOMBRE} className="h-12 w-12 object-cover rounded border" />
                ) : (
                  <div className="h-12 w-12 rounded border bg-gray-50" />
                )}
              </td>
              <td className="p-3 font-medium text-gray-900">
                {p.NOMBRE}
                {p.DES_PRO ? <div className="text-xs text-gray-500 truncate max-w-xs">{p.DES_PRO}</div> : null}
              </td>
              <td className="p-3">{p.COD_BAR_PRO || "-"}</td>
              <td className="p-3">{p.marca?.NOM_MAR || "-"}</td>
              <td className="p-3">{p.modelo?.NOM_MOD || "-"}</td>
              <td className="p-3">{p.categoria?.NOM_CAT || "-"}</td>
              <td className="p-3">
                <span className={`text-xs rounded-full px-2 py-1 border ${p.ACT_PRO ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                  {p.ACT_PRO ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(p.ID_PRO)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
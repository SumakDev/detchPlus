"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Precio } from "@/types/precio";

function nombreProducto(p: Precio) {
  if (p.productoNombre) return p.productoNombre;
  const marca = p.producto?.marca?.NOM_MAR || "";
  const modelo = p.producto?.modelo?.NOM_MOD || "";
  const name = [marca, modelo].filter(Boolean).join(" ").trim();
  return name || "-";
}

export default function PreciosTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Precio[];
  onEdit: (row: Precio) => void;
  onDelete: (row: Precio) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Producto</th>
            <th className="p-3">ID_PRO</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Valor</th>
            <th className="p-3 w-52">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No hay precios</td></tr>
          )}
          {items.map((p) => (
            <tr key={p.ID_PRE} className="border-t"> 
              <td className="p-3">
                <div className="flex items-center gap-3">
                  {p.producto?.IMG_URL ? (
                    <Image
                      src={p.producto.IMG_URL}
                      alt={nombreProducto(p)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 border" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{nombreProducto(p)}</span>
                    <span className="text-xs text-gray-500">#{p.ID_PRO}</span>
                  </div>
                </div>
              </td>
              <td className="p-3">{p.ID_PRO}</td>
              <td className="p-3">{p.TIP_PRE}</td>
              <td className="p-3 font-semibold">${Number(p.VAL_PRE).toFixed(2)}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(p)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
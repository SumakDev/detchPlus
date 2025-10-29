"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { DetTelefono } from "@/types/telefonos";

function nombreProducto(t: DetTelefono) {
  const marca = t.producto?.marca?.NOM_MAR || "";
  const modelo = t.producto?.modelo?.NOM_MOD || "";
  const nm = [marca, modelo].filter(Boolean).join(" ").trim();
  return nm || `${t.ID_PRO}`;
}

export default function TelefonosTable({
  items,
  onEdit,
  onDelete,
}: {
  items: DetTelefono[];
  onEdit: (row: DetTelefono) => void;
  onDelete?: (row: DetTelefono) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Producto</th>
            <th className="p-3">Color</th>
            <th className="p-3">Almacenamiento</th>
            <th className="p-3">Batería</th>
            <th className="p-3">Pantalla</th>
            <th className="p-3">Cargador</th>
            <th className="p-3">Cámara</th>
            <th className="p-3">Software</th>
            <th className="p-3 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={9} className="p-4 text-center text-gray-500">No hay teléfonos</td></tr>
          )}
          {items.map((t) => (
            <tr key={t.ID_PRO} className="border-t">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  {t.producto?.IMG_URL ? (
                    <Image
                      src={t.producto.IMG_URL}
                      alt={nombreProducto(t)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 border" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{nombreProducto(t)}</span>
                    <span className="text-xs text-gray-500">{t.producto?.DES_PRO}</span>
                  </div>
                </div>
              </td>
              <td className="p-3">{t.COL_TEL || "-"}</td>
              <td className="p-3">{t.ALM_TEL || "-"}</td>
              <td className="p-3">{t.EST_BAT_TEL ?? "-"}</td>
              <td className="p-3">{t.EST_PAN_TEL ?? "-"}</td>
              <td className="p-3">{t.EST_CAR_TEL ?? "-"}</td>
              <td className="p-3">{t.EST_CAM_TEL ?? "-"}</td>
              <td className="p-3">{t.EST_SOF_TEL ?? "-"}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(t)}>Editar</Button>
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={() => onDelete(t)}>Eliminar</Button>
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
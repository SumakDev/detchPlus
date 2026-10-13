"use client";

import { Button } from "@/components/ui/button";
import type { Producto } from "@/types/product";
import { Edit2, Trash2, Tag, Smartphone } from "lucide-react";

export default function ProductTable({
  productos,
  onEdit,
  onDelete,
}: {
  productos: Producto[];
  onEdit: (p: Producto) => void;
  onDelete: (id: string) => void | Promise<void>;
}) {
  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 text-sm">
        No hay productos registrados
      </div>
    );
  }

  return (
    <div>
      {/* Vista Móvil: Tarjetas Adaptativas (sin scroll horizontal) */}
      <div className="md:hidden space-y-3">
        {productos.map((p) => (
          <div
            key={p.ID_PRO}
            className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs space-y-3"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="h-16 w-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                {p.IMG_URL ? (
                  <img
                    src={p.IMG_URL}
                    alt={p.NOMBRE}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.endsWith("/images/iphone15.jpg")) {
                        target.src = "/images/iphone15.jpg";
                      }
                    }}
                  />
                ) : (
                  <Smartphone className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold text-blue-600 truncate">
                    {p.marca?.NOM_MAR || "Original"} {p.modelo?.NOM_MOD ? `• ${p.modelo.NOM_MOD}` : ""}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      p.ACT_PRO
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {p.ACT_PRO ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 truncate">{p.NOMBRE}</h3>
                {p.DES_PRO && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.DES_PRO}</p>
                )}
              </div>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 rounded-lg p-2 text-gray-600">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Categoría</span>
                <span className="font-medium truncate block">{p.categoria?.NOM_CAT || "General"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Código / Barcode</span>
                <span className="font-mono text-gray-800 truncate block">{p.COD_BAR_PRO || "—"}</span>
              </div>
            </div>

            {/* Acciones móviles */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(p)}
                className="w-full text-xs h-9 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1 text-gray-600" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(p.ID_PRO)}
                className="w-full text-xs h-9 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop: Tabla Tradicional */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/75 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-3.5">Imagen</th>
              <th className="p-3.5">Nombre</th>
              <th className="p-3.5">Código</th>
              <th className="p-3.5">Marca</th>
              <th className="p-3.5">Modelo</th>
              <th className="p-3.5">Categoría</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 w-36 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p) => (
              <tr key={p.ID_PRO} className="hover:bg-gray-50/50 transition">
                <td className="p-3.5">
                  <div className="h-12 w-12 rounded-lg border bg-gray-50 flex items-center justify-center p-1 overflow-hidden">
                    {p.IMG_URL ? (
                      <img
                        src={p.IMG_URL}
                        alt={p.NOMBRE}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.endsWith("/images/iphone15.jpg")) {
                            target.src = "/images/iphone15.jpg";
                          }
                        }}
                      />
                    ) : (
                      <Smartphone className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-medium text-gray-900">
                  <div className="font-semibold">{p.NOMBRE}</div>
                  {p.DES_PRO ? <div className="text-xs text-gray-500 truncate max-w-xs">{p.DES_PRO}</div> : null}
                </td>
                <td className="p-3.5 text-xs font-mono text-gray-600">{p.COD_BAR_PRO || "—"}</td>
                <td className="p-3.5 text-gray-700">{p.marca?.NOM_MAR || "—"}</td>
                <td className="p-3.5 text-gray-700">{p.modelo?.NOM_MOD || "—"}</td>
                <td className="p-3.5 text-gray-700">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    <Tag className="w-3 h-3 text-gray-400" /> {p.categoria?.NOM_CAT || "General"}
                  </span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`text-xs rounded-full px-2.5 py-0.5 border font-medium ${
                      p.ACT_PRO
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {p.ACT_PRO ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => onEdit(p)} className="h-8 text-xs">
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(p.ID_PRO)} className="h-8 text-xs">
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
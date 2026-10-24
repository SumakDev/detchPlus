"use client";

import { Cliente } from "@/types/client";
import { Button } from "@/components/ui/button";

type Props = {
  clientes: Cliente[];
  onEdit: (c: Cliente) => void;
  onDelete: (c: Cliente) => void;
  onView: (c: Cliente) => void;
  onReactivate?: (c: Cliente) => void | Promise<void>;
};

export default function ClientTable({ clientes, onEdit, onDelete, onView, onReactivate }: Props) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="p-3">Cédula/RUC</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Dificultad</th>
            <th className="p-3">Estado</th>
            <th className="p-3 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                No hay clientes para mostrar
              </td>
            </tr>
          )}
          {clientes.map((c) => (
            <tr key={c.CED_CLI} className="border-t hover:bg-gray-50">
              <td className="p-3 font-mono">{c.CED_CLI}</td>
              <td className="p-3 font-medium">
                {c.NOM_CLI} {c.APE_CLI}
              </td>
              <td className="p-3">{c.COR_CLI || "-"}</td>
              <td className="p-3">{c.NUM_CLI || "-"}</td>
              <td className="p-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    c.DIF_CLI === "ALTA"
                      ? "bg-rose-50 text-rose-700 border border-rose-100"
                      : c.DIF_CLI === "MEDIA"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {c.DIF_CLI}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    c.ACTIVO ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.ACTIVO ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(c)}>
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(c)}>
                    Editar
                  </Button>
                  {c.ACTIVO ? (
                    <Button variant="destructive" size="sm" onClick={() => onDelete(c)}>
                      Eliminar
                    </Button>
                  ) : onReactivate ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      onClick={() => onReactivate(c)}
                    >
                      Reactivar
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
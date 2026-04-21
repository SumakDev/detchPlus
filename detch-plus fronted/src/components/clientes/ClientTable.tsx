"use client";

import { Cliente } from "@/types/client";
import { Button } from "@/components/ui/button";

type Props = {
  clientes: Cliente[];
  onEdit: (c: Cliente) => void;
  onDelete: (cedula: string) => void | Promise<void>;
  onView: (c: Cliente) => void;
};

export default function ClientTable({ clientes, onEdit, onDelete, onView }: Props) {
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
            <th className="p-3 w-40">Acciones</th>
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
            <tr key={c.CED_CLI} className="border-t">
              <td className="p-3">{c.CED_CLI}</td>
              <td className="p-3">
                {c.NOM_CLI} {c.APE_CLI}
              </td>
              <td className="p-3">{c.COR_CLI || "-"}</td>
              <td className="p-3">{c.NUM_CLI || "-"}</td>
              <td className="p-3">{c.DIF_CLI}</td>
              <td className="p-3">
                <span className={c.ACTIVO ? "text-green-600" : "text-red-600"}>
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
                  <Button variant="destructive" size="sm" onClick={() => onDelete(c.CED_CLI)}>
                    Eliminar
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
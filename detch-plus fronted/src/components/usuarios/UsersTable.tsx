"use client";

import { Button } from "@/components/ui/button";
import type { Usuario } from "@/types/usuario";

export default function UsersTable({
  items,
  onEditUser,
}: {
  items: Usuario[];
  onEditUser: (row: Usuario) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            
            <th className="p-3">Usuario</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rol</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Tipo de usuario</th>
            <th className="p-3">CEDULA</th>
            <th className="p-3 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                No hay usuarios
              </td>
            </tr>
          )}
          {items.map((u) => (
            <tr key={u.ID_USU} className="border-t">
              
              <td className="p-3">{u.USR_USU}</td>
              <td className="p-3">{[u.NOM_USU, u.APE_USU].filter(Boolean).join(" ")}</td>
              <td className="p-3">{u.COR_USU}</td>
              <td className="p-3">{u.rol?.NOM_ROL || `${u.ID_ROL}`}</td>
              <td className="p-3">
                <span
                  className={`text-xs rounded-full px-2 py-1 border ${
                    u.EST_USU === "ACTIVO"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : u.EST_USU === "BLOQUEADO"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {u.EST_USU}
                </span>
              </td>
              <td className="p-3">{u.TIPO_PERSONA}</td>
              <td className="p-3">{u.ID_PERSONA}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditUser(u)}>
                    Editar
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
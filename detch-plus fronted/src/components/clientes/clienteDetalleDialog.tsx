"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ObservacionesCliente from "@/components/clientes/ObservacionesCliente";
import type { Cliente } from "@/types/client";

export default function ClienteDetalleDialog({
  open,
  onOpenChange,
  cliente,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cliente: Cliente | null;
  onEdit?: (c: Cliente) => void;
}) {
  const [active, setActive] = useState<"info" | "obs">("info");

  if (!cliente) return null;
  const nombre = [cliente.NOM_CLI, cliente.APE_CLI].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cliente: {nombre || cliente.CED_CLI}</DialogTitle>
          <DialogDescription>
            Consulta la información y registra observaciones del cliente {cliente.CED_CLI}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conmutador simple de secciones (sin dependencia de Tabs) */}
          <div role="tablist" aria-label="Detalles de cliente" className="inline-flex gap-2 rounded-lg bg-gray-100 p-1">
            <button
              role="tab"
              aria-selected={active === "info"}
              aria-controls="panel-info"
              id="tab-info"
              onClick={() => setActive("info")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                active === "info" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              type="button"
            >
              Información
            </button>
            <button
              role="tab"
              aria-selected={active === "obs"}
              aria-controls="panel-obs"
              id="tab-obs"
              onClick={() => setActive("obs")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                active === "obs" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              type="button"
            >
              Observaciones
            </button>
          </div>

          {/* Panel: Información */}
          <section
            role="tabpanel"
            id="panel-info"
            aria-labelledby="tab-info"
            hidden={active !== "info"}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Cédula/RUC</div>
                <div className="font-medium">{cliente.CED_CLI}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Nombre</div>
                <div className="font-medium">{nombre || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Correo</div>
                <div className="font-medium">{cliente.COR_CLI || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Teléfono</div>
                <div className="font-medium">{cliente.NUM_CLI || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Dirección</div>
                <div className="font-medium">{cliente.DIR_CLI || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Dificultad</div>
                <div className="font-medium">{cliente.DIF_CLI ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Estado</div>
                <div
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs border ${
                    cliente.ACTIVO ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {cliente.ACTIVO ? "Activo" : "Inactivo"}
                </div>
              </div>
              {cliente.FECHA_REGISTRO && (
                <div>
                  <div className="text-xs text-gray-500">Fecha de Registro</div>
                  <div className="font-medium">
                    {new Date(cliente.FECHA_REGISTRO).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            {onEdit && (
              <div className="pt-2">
                <Button variant="outline" onClick={() => onEdit(cliente)}>
                  Editar cliente
                </Button>
              </div>
            )}
          </section>

          {/* Panel: Observaciones */}
          <section role="tabpanel" id="panel-obs" aria-labelledby="tab-obs" hidden={active !== "obs"}>
            <ObservacionesCliente cedula={cliente.CED_CLI} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
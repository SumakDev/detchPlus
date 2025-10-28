"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ServicioTecnico } from "@/lib/api/servicio-tecnico";

type Estado = ServicioTecnico["EST_SER"];

export default function ServiceStatusDialog({
  open,
  onOpenChange,
  current,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current?: Estado;
  onSubmit: (estado: Estado) => Promise<void> | void;
}) {
  const [sel, setSel] = useState<Estado>(current || "RECIBIDO");

  useEffect(() => {
    if (open && current) {
      setSel(current);
    }
  }, [open, current]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <label className="text-sm text-gray-700">Estado del servicio</label>
          <select
            className="border rounded px-2 py-2 text-sm w-full"
            value={sel}
            onChange={(e) => setSel(e.target.value as Estado)}
          >
            <option value="RECIBIDO">RECIBIDO</option>
            <option value="EN_PROCESO">EN PROCESO</option>
            <option value="TERMINADO">TERMINADO</option>
            <option value="ENTREGADO">ENTREGADO</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await onSubmit(sel);
                onOpenChange(false);
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
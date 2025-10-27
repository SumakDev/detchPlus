
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {Usuario}  from "@/types/usuario";
export default function UserStatusDialog({
  open,
  onOpenChange,
    currentStatus,
    onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
    currentStatus: string;
    onSubmit: (newStatus: Usuario["EST_USU"]) => Promise<void> | void;
}) {
  const [sel, setSel] = useState<Usuario["EST_USU"]>(currentStatus as Usuario["EST_USU"]);

   return (
   <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <select
            className="border rounded px-2 py-2 text-sm w-full"
            value={sel}
            onChange={(e) => setSel(e.target.value as Usuario["EST_USU"])}
            >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="BLOQUEADO">Bloqueado</option>
            <option value="PEND_VER">Pendiente de revision</option>
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!sel) return;
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
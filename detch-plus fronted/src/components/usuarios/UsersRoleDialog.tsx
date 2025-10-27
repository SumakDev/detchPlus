"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchRoles, type RolOption } from "@/lib/api/usuarios";

export default function UserRoleDialog({
  open,
  onOpenChange,
  currentRoleId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRoleId: number | null;
  onSubmit: (newRoleId: number) => Promise<void> | void;
}) {
  const [roles, setRoles] = useState<RolOption[]>([]);
  const [sel, setSel] = useState<number | "">("");

  useEffect(() => {
    if (!open) return;
    fetchRoles()
      .then((r) => {
        setRoles(r);
        setSel(currentRoleId ?? "");
      })
      .catch(() => setRoles([]));
  }, [open, currentRoleId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar rol</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <select
            className="border rounded px-2 py-2 text-sm w-full"
            value={sel}
            onChange={(e) => setSel(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((r) => (
              <option key={r.ID_ROL} value={r.ID_ROL}>
                {r.NOM_ROL}: {r.DES_ROL}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (sel === "" || Number.isNaN(Number(sel))) return;
                await onSubmit(Number(sel));
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
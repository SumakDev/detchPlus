"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdjustStockDialog({
  open,
  setOpen,
  onConfirm,
  producto,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  onConfirm: (delta: number, motivo?: string) => Promise<void> | void;
  producto?: { nombre: string; stock: number };
}) {
  const [delta, setDelta] = useState<number>(0);
  const [motivo, setMotivo] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
          <DialogDescription>
            {producto ? `${producto.nombre} — Stock actual: ${producto.stock}` : "Define el ajuste a aplicar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="delta">Cantidad (+ aumenta, - disminuye)</Label>
            <Input
              id="delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              placeholder="Ej. -2 o 5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Inventario, merma, ajuste..." />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={async () => {
              await onConfirm(delta, motivo);
              setOpen(false);
            }}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
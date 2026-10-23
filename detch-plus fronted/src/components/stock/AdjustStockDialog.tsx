"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setDelta(0);
      setMotivo("");
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }, [open]);

  async function handleApply() {
    // Protección estricta contra doble click / peticiones concurrentes
    if (submittingRef.current || isSubmitting) return;
    if (!delta || delta === 0) {
      alert("Por favor ingresa una cantidad diferente de 0.");
      return;
    }

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      await onConfirm(delta, motivo);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (isSubmitting) return; // No permitir cerrar mientras se aplica
      setOpen(o);
    }}>
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
              value={delta === 0 ? "" : delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              placeholder="Ej. -2 o 5"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Inventario, merma, ajuste..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={isSubmitting || delta === 0}
            className="bg-gray-900 text-white hover:bg-gray-800 font-semibold"
          >
            {isSubmitting ? "Aplicando ajuste..." : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
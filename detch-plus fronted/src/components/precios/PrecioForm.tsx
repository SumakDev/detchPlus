"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PrecioForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { ID_PRO?: number; TIP_PRE?: "COMPRA" | "VENTA" | "PARTE_PAGO"; VAL_PRE?: number };
  onSubmit: (data: { ID_PRO: number; TIP_PRE: "COMPRA" | "VENTA" | "PARTE_PAGO"; VAL_PRE: number }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    ID_PRO: initial?.ID_PRO ?? 0,
    TIP_PRE: initial?.TIP_PRE ?? "COMPRA",
    VAL_PRE: initial?.VAL_PRE ?? 0,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_PRO) return alert("Debe indicar ID_PRO");
    onSubmit({ ID_PRO: Number(form.ID_PRO), TIP_PRE: form.TIP_PRE, VAL_PRE: Number(form.VAL_PRE) });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>ID producto</Label>
          <Input type="number" value={form.ID_PRO} onChange={(e) => setForm((f) => ({ ...f, ID_PRO: Number(e.target.value) }))} required />
        </div>
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <select className="border rounded px-2 py-2 text-sm" value={form.TIP_PRE}
            onChange={(e) => setForm((f) => ({ ...f, TIP_PRE: e.target.value as any }))}>
            <option value="COMPRA">COMPRA</option>
            <option value="VENTA">VENTA</option>
            <option value="PARTE_PAGO">PARTE_PAGO</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Valor</Label>
          <Input type="number" step="0.01" value={form.VAL_PRE} onChange={(e) => setForm((f) => ({ ...f, VAL_PRE: Number(e.target.value) }))} required />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
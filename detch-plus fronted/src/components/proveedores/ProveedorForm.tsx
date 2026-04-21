"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProveedorForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: {
    NOM_PRV?: string;
    RUC_PRV?: string | null;
    TEL_PRV?: string | null;
    COR_PRV?: string | null;
    DIR_PRV?: string | null;
    CON_PRI_PRV?: string | null;
    EST_PRV?: boolean;
  };
  onSubmit: (data: {
    NOM_PRV: string;
    RUC_PRV?: string | null;
    TEL_PRV?: string | null;
    COR_PRV?: string | null;
    DIR_PRV?: string | null;
    CON_PRI_PRV?: string | null;
    EST_PRV?: boolean;
  }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    NOM_PRV: initial?.NOM_PRV || "",
    RUC_PRV: initial?.RUC_PRV || "",
    TEL_PRV: initial?.TEL_PRV || "",
    COR_PRV: initial?.COR_PRV || "",
    DIR_PRV: initial?.DIR_PRV || "",
    CON_PRI_PRV: initial?.CON_PRI_PRV || "",
    EST_PRV: initial?.EST_PRV ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.NOM_PRV.trim()) return;
    onSubmit({
      NOM_PRV: form.NOM_PRV.trim(),
      RUC_PRV: form.RUC_PRV || null,
      TEL_PRV: form.TEL_PRV || null,
      COR_PRV: form.COR_PRV || null,
      DIR_PRV: form.DIR_PRV || null,
      CON_PRI_PRV: form.CON_PRI_PRV || null,
      EST_PRV: form.EST_PRV,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label>Nombre</Label>
        <Input value={form.NOM_PRV} onChange={(e) => setForm((f) => ({ ...f, NOM_PRV: e.target.value }))} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>RUC</Label>
          <Input value={form.RUC_PRV || ""} onChange={(e) => setForm((f) => ({ ...f, RUC_PRV: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Teléfono</Label>
          <Input value={form.TEL_PRV || ""} onChange={(e) => setForm((f) => ({ ...f, TEL_PRV: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={form.COR_PRV || ""} onChange={(e) => setForm((f) => ({ ...f, COR_PRV: e.target.value }))} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Dirección</Label>
        <textarea className="min-h-[80px] border rounded px-3 py-2 text-sm"
          value={form.DIR_PRV || ""}
          onChange={(e) => setForm((f) => ({ ...f, DIR_PRV: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Contacto principal</Label>
        <Input value={form.CON_PRI_PRV || ""} onChange={(e) => setForm((f) => ({ ...f, CON_PRI_PRV: e.target.value }))} />
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!form.EST_PRV} onChange={(e) => setForm((f) => ({ ...f, EST_PRV: e.target.checked }))} />
        Activo
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
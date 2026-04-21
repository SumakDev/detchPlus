"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ServicioDetalle } from "@/lib/api/servicio-tecnico";

export default function ServiceTechDetailForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ServicioDetalle;
  onSubmit: (data: ServicioDetalle) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ServicioDetalle>({
    IME_TEL_SER: initial?.IME_TEL_SER || "",
    MAR_TEL_SER: initial?.MAR_TEL_SER || "",
    MOD_TEL_SER: initial?.MOD_TEL_SER || "",
    CAP_TEL_SER: initial?.CAP_TEL_SER || "",
    DES_REP_TEL_SER: initial?.DES_REP_TEL_SER || "",
    DIR_SER: initial?.DIR_SER || "",
    PROB_REP_SER: initial?.PROB_REP_SER || "",
    SOL_APL_SER: initial?.SOL_APL_SER || "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>IMEI</Label>
          <Input value={form.IME_TEL_SER || ""} onChange={(e) => setForm((f) => ({ ...f, IME_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Marca</Label>
          <Input value={form.MAR_TEL_SER || ""} onChange={(e) => setForm((f) => ({ ...f, MAR_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Modelo</Label>
          <Input value={form.MOD_TEL_SER || ""} onChange={(e) => setForm((f) => ({ ...f, MOD_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Capacidad</Label>
          <Input value={form.CAP_TEL_SER || ""} onChange={(e) => setForm((f) => ({ ...f, CAP_TEL_SER: e.target.value }))} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descripción del equipo</Label>
        <textarea
          className="min-h-[80px] border rounded px-3 py-2 text-sm"
          value={form.DES_REP_TEL_SER || ""}
          onChange={(e) => setForm((f) => ({ ...f, DES_REP_TEL_SER: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Dirección de servicio</Label>
        <textarea
          className="min-h-[60px] border rounded px-3 py-2 text-sm"
          value={form.DIR_SER || ""}
          onChange={(e) => setForm((f) => ({ ...f, DIR_SER: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Problema reportado</Label>
        <textarea
          className="min-h-[80px] border rounded px-3 py-2 text-sm"
          value={form.PROB_REP_SER || ""}
          onChange={(e) => setForm((f) => ({ ...f, PROB_REP_SER: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>Solución aplicada</Label>
        <textarea
          className="min-h-[80px] border rounded px-3 py-2 text-sm"
          value={form.SOL_APL_SER || ""}
          onChange={(e) => setForm((f) => ({ ...f, SOL_APL_SER: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
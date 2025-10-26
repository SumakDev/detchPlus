"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TecnicoForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: {
    NOM_TEC?: string;
    TEL_TEC?: string | null;
    DIR_TEC?: string | null;
    ESP_TEC?: string | null;
    EST_TEC?: boolean;
  };
  onSubmit: (data: {
    NOM_TEC: string;
    TEL_TEC?: string | null;
    DIR_TEC?: string | null;
    ESP_TEC?: string | null;
    EST_TEC?: boolean;
  }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    NOM_TEC: initial?.NOM_TEC || "",
    TEL_TEC: initial?.TEL_TEC || "",
    DIR_TEC: initial?.DIR_TEC || "",
    ESP_TEC: initial?.ESP_TEC || "",
    EST_TEC: initial?.EST_TEC ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.NOM_TEC.trim()) return;
    onSubmit({
      NOM_TEC: form.NOM_TEC.trim(),
      TEL_TEC: form.TEL_TEC || null,
      DIR_TEC: form.DIR_TEC || null,
      ESP_TEC: form.ESP_TEC || null,
      EST_TEC: form.EST_TEC,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label>Nombre del técnico</Label>
        <Input
          value={form.NOM_TEC}
          onChange={(e) => setForm((f) => ({ ...f, NOM_TEC: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Teléfono</Label>
          <Input
            value={form.TEL_TEC || ""}
            onChange={(e) => setForm((f) => ({ ...f, TEL_TEC: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Especialidad</Label>
          <Input
            value={form.ESP_TEC || ""}
            onChange={(e) => setForm((f) => ({ ...f, ESP_TEC: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Dirección</Label>
        <textarea
          className="min-h-[80px] border rounded px-3 py-2 text-sm"
          value={form.DIR_TEC || ""}
          onChange={(e) => setForm((f) => ({ ...f, DIR_TEC: e.target.value }))}
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!form.EST_TEC}
          onChange={(e) => setForm((f) => ({ ...f, EST_TEC: e.target.checked }))}
        />
        Activo
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
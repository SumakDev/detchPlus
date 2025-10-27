"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchServTecOptions } from "@/lib/api/servicio-tecnico";

export default function ServiceTechForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: {
    ID_TEC?: number;
    CED_CLI?: string;
    PRE_SER?: number;
    IVA_SER?: number;
    PRE_VEN_SER?: number;
    EST_SER?: "RECIBIDO" | "EN_PROCESO" | "TERMINADO" | "ENTREGADO";
  };
  onSubmit: (data: {
    ID_TEC: number;
    CED_CLI: string;
    PRE_SER: number;
    IVA_SER?: number;
    PRE_VEN_SER?: number;
    EST_SER?: "RECIBIDO" | "EN_PROCESO" | "TERMINADO" | "ENTREGADO";
  }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [tecnicos, setTecnicos] = useState<Array<{ ID_TEC: number; NOM_TEC: string }>>([]);
  const [clientes, setClientes] = useState<Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string }>>([]);

  const [form, setForm] = useState({
    ID_TEC: initial?.ID_TEC || 0,
    CED_CLI: initial?.CED_CLI || "",
    PRE_SER: initial?.PRE_SER ?? 0,
    IVA_SER: initial?.IVA_SER ?? 0,
    PRE_VEN_SER: initial?.PRE_VEN_SER ?? (initial?.PRE_SER ?? 0) + (initial?.IVA_SER ?? 0),
    EST_SER: initial?.EST_SER || "RECIBIDO" as const,
  });

  useEffect(() => {
    fetchServTecOptions()
      .then(({ tecnicos, clientes }) => {
        setTecnicos(tecnicos);
        setClientes(clientes);
      })
      .catch(() => {
        setTecnicos([]);
        setClientes([]);
      });
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, PRE_VEN_SER: Number(f.PRE_SER) + Number(f.IVA_SER) }));
  }, [form.PRE_SER, form.IVA_SER]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_TEC || !form.CED_CLI) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Técnico</Label>
          <select
            value={form.ID_TEC}
            onChange={(e) => setForm((f) => ({ ...f, ID_TEC: Number(e.target.value) }))}
            className="border rounded px-2 py-2 text-sm"
            required
          >
            <option value={0}>Seleccionar</option>
            {tecnicos.map((t) => (
              <option key={t.ID_TEC} value={t.ID_TEC}>
                {t.NOM_TEC}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Cliente</Label>
          <select
            value={form.CED_CLI}
            onChange={(e) => setForm((f) => ({ ...f, CED_CLI: e.target.value }))}
            className="border rounded px-2 py-2 text-sm"
            required
          >
            <option value="">Seleccionar</option>
            {clientes.map((c) => (
              <option key={c.CED_CLI} value={c.CED_CLI}>
                {[c.NOM_CLI, c.APE_CLI].filter(Boolean).join(" ") || c.CED_CLI}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Precio base</Label>
          <Input
            type="number"
            step="0.01"
            value={form.PRE_SER}
            onChange={(e) => setForm((f) => ({ ...f, PRE_SER: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>IVA</Label>
          <Input
            type="number"
            step="0.01"
            value={form.IVA_SER}
            onChange={(e) => setForm((f) => ({ ...f, IVA_SER: Number(e.target.value) }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Total</Label>
          <Input type="number" step="0.01" value={form.PRE_VEN_SER} readOnly />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Estado</Label>
        <select
          value={form.EST_SER}
          onChange={(e) => setForm((f) => ({ ...f, EST_SER: e.target.value as any }))}
          className="border rounded px-2 py-2 text-sm"
        >
          <option value="RECIBIDO">RECIBIDO</option>
          <option value="EN_PROCESO">EN_PROCESO</option>
          <option value="TERMINADO">TERMINADO</option>
          <option value="ENTREGADO">ENTREGADO</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
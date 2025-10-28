"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchServTecOptions } from "@/lib/api/servicio-tecnico";

type ServicioBase = {
  ID_TEC: number;
  CED_CLI: string;
  PRE_SER: number;
  IVA_SER?: number;
  PRE_VEN_SER?: number;
  EST_SER?: "RECIBIDO" | "EN_PROCESO" | "TERMINADO" | "ENTREGADO";
};

type DetalleBase = {
  IME_TEL_SER?: string | null;
  MAR_TEL_SER?: string | null;
  MOD_TEL_SER?: string | null;
  CAP_TEL_SER?: string | null;
  DES_REP_TEL_SER?: string | null;
  DIR_SER?: string | null;
  PROB_REP_SER?: string | null;
  SOL_APL_SER?: string | null;
};

export default function ServiceTechFullForm({
  initialServicio,
  initialDetalle,
  onSubmit,
  onCancel,
}: {
  initialServicio?: Partial<ServicioBase>;
  initialDetalle?: Partial<DetalleBase>;
  onSubmit: (data: ServicioBase, detalle: DetalleBase) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [tecnicos, setTecnicos] = useState<Array<{ ID_TEC: number; NOM_TEC: string }>>([]);
  const [clientes, setClientes] = useState<Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string }>>([]);

  const [form, setForm] = useState({
    ID_TEC: initialServicio?.ID_TEC ?? 0,
    CED_CLI: initialServicio?.CED_CLI ?? "",
    PRE_SER: initialServicio?.PRE_SER ?? 0,
    IVA_SER: initialServicio?.IVA_SER ?? 0,
    PRE_VEN_SER: initialServicio?.PRE_VEN_SER ?? (initialServicio?.PRE_SER ?? 0) + (initialServicio?.IVA_SER ?? 0),
    EST_SER: initialServicio?.EST_SER ?? "RECIBIDO",

    IME_TEL_SER: initialDetalle?.IME_TEL_SER ?? "",
    MAR_TEL_SER: initialDetalle?.MAR_TEL_SER ?? "",
    MOD_TEL_SER: initialDetalle?.MOD_TEL_SER ?? "",
    CAP_TEL_SER: initialDetalle?.CAP_TEL_SER ?? "",
    DES_REP_TEL_SER: initialDetalle?.DES_REP_TEL_SER ?? "",
    DIR_SER: initialDetalle?.DIR_SER ?? "",
    PROB_REP_SER: initialDetalle?.PROB_REP_SER ?? "",
    SOL_APL_SER: initialDetalle?.SOL_APL_SER ?? "",
  });

  // sincronizar cuando cambien los initial (al abrir editar después de cargar detalle)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ID_TEC: initialServicio?.ID_TEC ?? prev.ID_TEC,
      CED_CLI: initialServicio?.CED_CLI ?? prev.CED_CLI,
      PRE_SER: initialServicio?.PRE_SER ?? prev.PRE_SER,
      IVA_SER: initialServicio?.IVA_SER ?? prev.IVA_SER,
      PRE_VEN_SER:
        initialServicio?.PRE_VEN_SER ??
        (initialServicio?.PRE_SER ?? prev.PRE_SER) + (initialServicio?.IVA_SER ?? prev.IVA_SER),
      EST_SER: initialServicio?.EST_SER ?? prev.EST_SER,

      IME_TEL_SER: initialDetalle?.IME_TEL_SER ?? prev.IME_TEL_SER,
      MAR_TEL_SER: initialDetalle?.MAR_TEL_SER ?? prev.MAR_TEL_SER,
      MOD_TEL_SER: initialDetalle?.MOD_TEL_SER ?? prev.MOD_TEL_SER,
      CAP_TEL_SER: initialDetalle?.CAP_TEL_SER ?? prev.CAP_TEL_SER,
      DES_REP_TEL_SER: initialDetalle?.DES_REP_TEL_SER ?? prev.DES_REP_TEL_SER,
      DIR_SER: initialDetalle?.DIR_SER ?? prev.DIR_SER,
      PROB_REP_SER: initialDetalle?.PROB_REP_SER ?? prev.PROB_REP_SER,
      SOL_APL_SER: initialDetalle?.SOL_APL_SER ?? prev.SOL_APL_SER,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServicio, initialDetalle]);

  // cargar técnicos y clientes
  useEffect(() => {
    fetchServTecOptions()
      .then(({ tecnicos, clientes }) => {
        setTecnicos(tecnicos || []);
        setClientes(clientes || []);
      })
      .catch(() => {
        setTecnicos([]);
        setClientes([]);
      });
  }, []);

  // actualizar total automáticamente cuando cambian base o IVA
  useEffect(() => {
    setForm((f) => ({
      ...f,
      PRE_VEN_SER: Number(f.PRE_SER) + Number(f.IVA_SER),
    }));
  }, [form.PRE_SER, form.IVA_SER]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_TEC || !form.CED_CLI) return alert("Debe seleccionar técnico y cliente");

    const {
      IME_TEL_SER,
      MAR_TEL_SER,
      MOD_TEL_SER,
      CAP_TEL_SER,
      DES_REP_TEL_SER,
      DIR_SER,
      PROB_REP_SER,
      SOL_APL_SER,
      ...servicio
    } = form;

    const detalle = {
      IME_TEL_SER,
      MAR_TEL_SER,
      MOD_TEL_SER,
      CAP_TEL_SER,
      DES_REP_TEL_SER,
      DIR_SER,
      PROB_REP_SER,
      SOL_APL_SER,
    };

    onSubmit(servicio as ServicioBase, detalle as DetalleBase);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* CABECERA DEL SERVICIO */}
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

      {/* PRECIOS */}
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

      {/* DETALLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>IMEI</Label>
          <Input value={form.IME_TEL_SER} onChange={(e) => setForm((f) => ({ ...f, IME_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Marca</Label>
          <Input value={form.MAR_TEL_SER} onChange={(e) => setForm((f) => ({ ...f, MAR_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Modelo</Label>
          <Input value={form.MOD_TEL_SER} onChange={(e) => setForm((f) => ({ ...f, MOD_TEL_SER: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label>Capacidad</Label>
          <Input value={form.CAP_TEL_SER} onChange={(e) => setForm((f) => ({ ...f, CAP_TEL_SER: e.target.value }))} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descripción</Label>
        <textarea
          className="border rounded px-3 py-2 text-sm"
          value={form.DES_REP_TEL_SER}
          onChange={(e) => setForm((f) => ({ ...f, DES_REP_TEL_SER: e.target.value })) }
        />
      </div>

      <div className="grid gap-2">
        <Label>Dirección</Label>
        <textarea
          className="border rounded px-3 py-2 text-sm"
          value={form.DIR_SER}
          onChange={(e) => setForm((f) => ({ ...f, DIR_SER: e.target.value })) }
        />
      </div>

      <div className="grid gap-2">
        <Label>Problema reportado</Label>
        <textarea
          className="border rounded px-3 py-2 text-sm"
          value={form.PROB_REP_SER}
          onChange={(e) => setForm((f) => ({ ...f, PROB_REP_SER: e.target.value })) }
        />
      </div>

      <div className="grid gap-2">
        <Label>Solución aplicada</Label>
        <textarea
          className="border rounded px-3 py-2 text-sm"
          value={form.SOL_APL_SER}
          onChange={(e) => setForm((f) => ({ ...f, SOL_APL_SER: e.target.value })) }
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchServTecOptions, type ServicioTecnicoInput } from "@/lib/api/servicio-tecnico";

export default function ServiceTechForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ServicioTecnicoInput>;
  onSubmit: (data: ServicioTecnicoInput) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [tecnicos, setTecnicos] = useState<Array<{ ID_TEC: number; NOM_TEC: string }>>([]);
  const [clientes, setClientes] = useState<Array<{ CED_CLI: string; NOM_CLI?: string; APE_CLI?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ServicioTecnicoInput>({
    ID_TEC: initial?.ID_TEC || 0,
    CED_CLI: initial?.CED_CLI || "",
    PRE_SER: initial?.PRE_SER ?? 0,
    IVA_SER: initial?.IVA_SER ?? 0,
    PRE_VEN_SER: initial?.PRE_VEN_SER ?? (initial?.PRE_SER ?? 0) + (initial?.IVA_SER ?? 0),
    EST_SER: initial?.EST_SER || "RECIBIDO",
    MAR_TEL_SER: initial?.MAR_TEL_SER || "",
    MOD_TEL_SER: initial?.MOD_TEL_SER || "",
    IME_TEL_SER: initial?.IME_TEL_SER || "",
    CAP_TEL_SER: initial?.CAP_TEL_SER || "",
    PROB_REP_SER: initial?.PROB_REP_SER || "",
    DES_REP_TEL_SER: initial?.DES_REP_TEL_SER || "",
    SOL_APL_SER: initial?.SOL_APL_SER || "",
    DIR_SER: initial?.DIR_SER || "",
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

  // Calcular IVA y total automáticamente al ingresar precio base
  function handleBasePriceChange(val: number) {
    const ivaCalculado = Number((val * 0.15).toFixed(2));
    const totalCalculado = Number((val + ivaCalculado).toFixed(2));
    setForm((f) => ({
      ...f,
      PRE_SER: val,
      IVA_SER: ivaCalculado,
      PRE_VEN_SER: totalCalculado,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_TEC || !form.CED_CLI) {
      alert("Por favor seleccione un técnico y un cliente.");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto px-1 pr-2">
      {/* 1. Cliente y Técnico */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Asignación del Servicio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Técnico Asignado *</Label>
            <select
              value={form.ID_TEC}
              onChange={(e) => setForm((f) => ({ ...f, ID_TEC: Number(e.target.value) }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value={0}>Seleccionar técnico...</option>
              {tecnicos.map((t) => (
                <option key={t.ID_TEC} value={t.ID_TEC}>
                  {t.NOM_TEC}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Cliente *</Label>
            <select
              value={form.CED_CLI}
              onChange={(e) => setForm((f) => ({ ...f, CED_CLI: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.CED_CLI} value={c.CED_CLI}>
                  {[c.NOM_CLI, c.APE_CLI].filter(Boolean).join(" ") || c.CED_CLI} ({c.CED_CLI})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Datos del Dispositivo */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Datos del Dispositivo Móvil
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Marca del Teléfono</Label>
            <Input
              placeholder="Ej. Apple, Samsung, Xiaomi..."
              value={form.MAR_TEL_SER}
              onChange={(e) => setForm((f) => ({ ...f, MAR_TEL_SER: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Modelo</Label>
            <Input
              placeholder="Ej. iPhone 13 Pro Max, Galaxy S23..."
              value={form.MOD_TEL_SER}
              onChange={(e) => setForm((f) => ({ ...f, MOD_TEL_SER: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">IMEI (Identificador Único)</Label>
            <Input
              placeholder="Ej. 356789123456789"
              maxLength={20}
              value={form.IME_TEL_SER}
              onChange={(e) => setForm((f) => ({ ...f, IME_TEL_SER: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Capacidad / Almacenamiento</Label>
            <Input
              placeholder="Ej. 128 GB, 256 GB, 512 GB..."
              value={form.CAP_TEL_SER}
              onChange={(e) => setForm((f) => ({ ...f, CAP_TEL_SER: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* 3. Diagnóstico, Problema y Solución */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Diagnóstico y Trabajo Técnico
        </h4>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Falla / Problema Reportado por el Cliente</Label>
          <textarea
            rows={2}
            placeholder="Describa el motivo de ingreso (ej. no carga, pantalla parpadea, mojado)..."
            value={form.PROB_REP_SER}
            onChange={(e) => setForm((f) => ({ ...f, PROB_REP_SER: e.target.value }))}
            className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Estado Físico / Observaciones de Recepción</Label>
          <textarea
            rows={2}
            placeholder="Detalles estéticos al recibir (ej. rayón en tapa, pantalla rota, sin golpes)..."
            value={form.DES_REP_TEL_SER}
            onChange={(e) => setForm((f) => ({ ...f, DES_REP_TEL_SER: e.target.value }))}
            className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Solución Aplicada / Reparación Realizada</Label>
          <textarea
            rows={2}
            placeholder="Trabajo o repuestos instalados por el técnico..."
            value={form.SOL_APL_SER}
            onChange={(e) => setForm((f) => ({ ...f, SOL_APL_SER: e.target.value }))}
            className="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold">Dirección de Entrega / Notas Adicionales</Label>
          <Input
            placeholder="Ej. Retiro en local Matriz, entrega a domicilio..."
            value={form.DIR_SER}
            onChange={(e) => setForm((f) => ({ ...f, DIR_SER: e.target.value }))}
          />
        </div>
      </div>

      {/* 4. Costos y Estado */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Valores y Estado del Servicio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Costo Base ($) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.PRE_SER}
              onChange={(e) => handleBasePriceChange(Number(e.target.value))}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">IVA 15% ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.IVA_SER}
              onChange={(e) => {
                const iva = Number(e.target.value);
                setForm((f) => ({ ...f, IVA_SER: iva, PRE_VEN_SER: Number((Number(f.PRE_SER) + iva).toFixed(2)) }));
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Total a Cobrar ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.PRE_VEN_SER}
              readOnly
              className="bg-gray-100 font-bold text-gray-900"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Estado Actual</Label>
            <select
              value={form.EST_SER}
              onChange={(e) => setForm((f) => ({ ...f, EST_SER: e.target.value as any }))}
              className="border rounded-lg px-2.5 py-2 text-sm bg-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="RECIBIDO">RECIBIDO</option>
              <option value="EN_PROCESO">EN PROCESO</option>
              <option value="TERMINADO">TERMINADO</option>
              <option value="ENTREGADO">ENTREGADO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t sticky bottom-0 bg-white py-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-gray-900 text-white hover:bg-gray-800">
          {isSubmitting ? "Guardando..." : "Guardar Orden de Servicio"}
        </Button>
      </div>
    </form>
  );
}
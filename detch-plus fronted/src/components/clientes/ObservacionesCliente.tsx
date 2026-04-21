"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // si no tienes, usar <textarea className="...">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fetchObservacionesCliente, createObservacionCliente, deleteObservacion, updateObservacion } from "@/lib/api/obs";
import type { Observacion } from "@/types/observacion";

function fmt(dt?: string) {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ObservacionesCliente({ cedula }: { cedula: string }) {
  const [items, setItems] = useState<Observacion[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<Observacion | null>(null);

  const [form, setForm] = useState<{ DES_OBS: string; NUM_REF_OBS?: string }>({ DES_OBS: "", NUM_REF_OBS: "" });

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchObservacionesCliente(cedula);
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Error al cargar observaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cedula) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cedula]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((o) => {
      return (
        !term ||
        o.DES_OBS.toLowerCase().includes(term) ||
        (o.NUM_REF_OBS || "").toLowerCase().includes(term) ||
        (o.CED_EMP || "").toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Observaciones del cliente</h3>
        <Button onClick={() => { setForm({ DES_OBS: "", NUM_REF_OBS: "" }); setOpenNew(true); }}>
          Nueva observación
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Buscar por descripción, referencia o empleado" value={q} onChange={(e) => setQ(e.target.value)} className="w-80" />
      </div>

      {loading && <div className="rounded border bg-white p-3">Cargando…</div>}
      {err && <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {err}</div>}

      {!loading && !err && (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-3">Fecha</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Referencia</th>
                <th className="p-3 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-3 text-center text-gray-500">Sin observaciones</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.ID_OBS} className="border-t align-top">
                  <td className="p-3 whitespace-nowrap">{fmt(o.FEC_OBS)}</td>
                  <td className="p-3">{o.CED_EMP || "admin"}</td>
                  <td className="p-3">
                    <div className="whitespace-pre-wrap">{o.DES_OBS}</div>
                  </td>
                  <td className="p-3">{o.NUM_REF_OBS || "-"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditRow(o);
                          setForm({ DES_OBS: o.DES_OBS, NUM_REF_OBS: o.NUM_REF_OBS || "" });
                          setOpenEdit(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("¿Eliminar observación?")) return;
                          await deleteObservacion(o.ID_OBS);
                          await load();
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Crear */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva observación</DialogTitle>
            <DialogDescription>Registra una observación para el cliente {cedula}.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await createObservacionCliente(cedula, { DES_OBS: form.DES_OBS, NUM_REF_OBS: form.NUM_REF_OBS || undefined });
              setOpenNew(false);
              await load();
            }}
          >
            <div className="grid gap-2">
              <label className="text-sm text-gray-700">Descripción</label>
              {/* Usa tu Textarea de UI o sustituye por <textarea> */}
              <Textarea
                value={form.DES_OBS}
                onChange={(e: any) => setForm((f) => ({ ...f, DES_OBS: e.target.value }))}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-gray-700">Referencia (opcional)</label>
              <Input
                value={form.NUM_REF_OBS || ""}
                onChange={(e) => setForm((f) => ({ ...f, NUM_REF_OBS: e.target.value }))}
                placeholder="Ej: #orden, #ticket, etc."
              />
            </div>
            <div className="text-xs text-gray-500">
              El empleado se registrará automáticamente como tu usuario; si no hay, se usará “admin”.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenNew(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar observación #{editRow?.ID_OBS}</DialogTitle>
            <DialogDescription>Modifica la descripción o referencia.</DialogDescription>
          </DialogHeader>
          {editRow && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateObservacion(editRow.ID_OBS, {
                  DES_OBS: form.DES_OBS,
                  NUM_REF_OBS: form.NUM_REF_OBS || null,
                });
                setOpenEdit(false);
                await load();
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm text-gray-700">Descripción</label>
                <Textarea
                  value={form.DES_OBS}
                  onChange={(e: any) => setForm((f) => ({ ...f, DES_OBS: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-700">Referencia (opcional)</label>
                <Input
                  value={form.NUM_REF_OBS || ""}
                  onChange={(e) => setForm((f) => ({ ...f, NUM_REF_OBS: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
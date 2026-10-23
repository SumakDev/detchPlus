"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceTechTable from "@/components/servicio-tecnico/ServiceTechTable";
import ServiceTechForm from "@/components/servicio-tecnico/ServiceTechForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  fetchServicios,
  createServicio,
  updateServicio,
  updateServicioEstado,
  type ServicioTecnico,
} from "@/lib/api/servicio-tecnico";
import { getMe } from "@/lib/api/auth/me";

export default function ServicioTecnicoPage() {
  const router = useRouter();
  const [items, setItems] = useState<ServicioTecnico[]>([]);
  const [q, setQ] = useState("");
  const [est, setEst] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [editRow, setEditRow] = useState<ServicioTecnico | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [statusRow, setStatusRow] = useState<ServicioTecnico | null>(null);
  const [modalStatus, setModalStatus] = useState<ServicioTecnico["EST_SER"]>("RECIBIDO");
  const [savingStatus, setSavingStatus] = useState(false);

  // Protección: bloquear rol 4 y no autenticados
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    getMe()
      .then(({ user }) => {
        if (!user) router.replace("/");
        else if (user.ID_ROL === 4) router.replace("/mi-cuenta");
      })
      .catch(() => router.replace("/"));
  }, [router]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServicios({ q, est });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((r) => {
      const matchesQ =
        !term ||
        r.CED_CLI.toLowerCase().includes(term) ||
        (r.cliente?.nombreCompleto || "").toLowerCase().includes(term) ||
        (r.tecnico?.NOM_TEC || "").toLowerCase().includes(term) ||
        String(r.NUM_SER).includes(term);
      const matchesEst = !est || r.EST_SER === est;
      return matchesQ && matchesEst;
    });
  }, [items, q, est]);

  return (
    <Layout>
    <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Servicio Técnico</h1>
          <p className="text-gray-600">Gestión de órdenes de servicio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenNew(true)}>Nuevo servicio</Button>
          <Button variant="outline" onClick={load}>
            Refrescar
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-3 items-center">
          <Input placeholder="Buscar por cliente, cédula, técnico o #"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <select
            value={est}
            onChange={(e) => setEst(e.target.value)}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="RECIBIDO">RECIBIDO</option>
            <option value="EN_PROCESO">EN_PROCESO</option>
            <option value="TERMINADO">TERMINADO</option>
            <option value="ENTREGADO">ENTREGADO</option>
          </select>
          <Button variant="outline" onClick={load}>Aplicar</Button>
        </div>
      </div>

      {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {error}</div>
      )}

      {!loading && !error && (
        <ServiceTechTable
          items={filtered}
          onEdit={(row) => {
            setEditRow(row);
            setOpenEdit(true);
          }}
          onChangeStatus={async (row, newStatus) => {
            if (newStatus) {
              try {
                await updateServicioEstado(row.NUM_SER, newStatus);
                await load();
              } catch (e: any) {
                alert(e?.message || "Error al actualizar estado");
              }
            } else {
              setStatusRow(row);
              setModalStatus(row.EST_SER);
            }
          }}
        />
      )}

      {/* Modal Cambiar Estado */}
      <Dialog open={!!statusRow} onOpenChange={(open) => !open && setStatusRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Estado — OT #{statusRow?.NUM_SER}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-gray-500">
              Cliente: <strong className="text-gray-800">{statusRow?.cliente?.nombreCompleto || statusRow?.CED_CLI}</strong> | Técnico: <strong className="text-gray-800">{statusRow?.tecnico?.NOM_TEC || statusRow?.ID_TEC}</strong>
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { val: "RECIBIDO", title: "RECIBIDO", desc: "Dispositivo ingresado al taller, esperando revisión", color: "blue" },
                { val: "EN_PROCESO", title: "EN PROCESO", desc: "Técnico trabajando activamente en el diagnóstico o reparación", color: "amber" },
                { val: "TERMINADO", title: "TERMINADO", desc: "Reparación completada y verificada, listo para retiro", color: "emerald" },
                { val: "ENTREGADO", title: "ENTREGADO", desc: "Equipo entregado formalmente al cliente", color: "purple" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  onClick={() => setModalStatus(opt.val as any)}
                  className={`p-3 rounded-xl border-2 flex items-start justify-between cursor-pointer transition ${
                    modalStatus === opt.val
                      ? "border-gray-900 bg-gray-50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{opt.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="statusSelect"
                    checked={modalStatus === opt.val}
                    onChange={() => setModalStatus(opt.val as any)}
                    className="mt-1"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setStatusRow(null)}>
                Cancelar
              </Button>
              <Button
                disabled={savingStatus}
                onClick={async () => {
                  if (!statusRow) return;
                  try {
                    setSavingStatus(true);
                    await updateServicioEstado(statusRow.NUM_SER, modalStatus);
                    setStatusRow(null);
                    await load();
                  } catch (err: any) {
                    alert(err?.message || "Error al actualizar estado");
                  } finally {
                    setSavingStatus(false);
                  }
                }}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                {savingStatus ? "Guardando..." : "Guardar Estado"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crear */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Servicio Técnico</DialogTitle>
          </DialogHeader>
          <ServiceTechForm
            onCancel={() => setOpenNew(false)}
            onSubmit={async (data) => {
              await createServicio(data);
              setOpenNew(false);
              await load();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Servicio Técnico — OT #{editRow?.NUM_SER}</DialogTitle>
          </DialogHeader>
          {editRow && (
            <ServiceTechForm
              initial={{
                ID_TEC: editRow.ID_TEC,
                CED_CLI: editRow.CED_CLI,
                PRE_SER: editRow.PRE_SER,
                IVA_SER: editRow.IVA_SER,
                PRE_VEN_SER: editRow.PRE_VEN_SER,
                EST_SER: editRow.EST_SER,
                MAR_TEL_SER: editRow.detalle?.MAR_TEL_SER || "",
                MOD_TEL_SER: editRow.detalle?.MOD_TEL_SER || "",
                IME_TEL_SER: editRow.detalle?.IME_TEL_SER || "",
                CAP_TEL_SER: editRow.detalle?.CAP_TEL_SER || "",
                PROB_REP_SER: editRow.detalle?.PROB_REP_SER || "",
                DES_REP_TEL_SER: editRow.detalle?.DES_REP_TEL_SER || "",
                SOL_APL_SER: editRow.detalle?.SOL_APL_SER || "",
                DIR_SER: editRow.detalle?.DIR_SER || "",
              }}
              onCancel={() => setOpenEdit(false)}
              onSubmit={async (data) => {
                await updateServicio(editRow.NUM_SER, data);
                setOpenEdit(false);
                await load();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
    </Layout>
  );
}
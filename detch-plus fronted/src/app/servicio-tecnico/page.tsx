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
          onChangeStatus={async (row) => {
            const next = prompt(
              `Nuevo estado para servicio #${row.NUM_SER} (RECIBIDO, EN_PROCESO, TERMINADO, ENTREGADO):`,
              row.EST_SER
            );
            if (!next) return;
            const val = next.toUpperCase().trim();
            if (!["RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"].includes(val)) {
              alert("Estado inválido");
              return;
            }
            await updateServicioEstado(row.NUM_SER, val as any);
            await load();
          }}
        />
      )}

      {/* Crear */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo servicio</DialogTitle>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar servicio #{editRow?.NUM_SER}</DialogTitle>
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
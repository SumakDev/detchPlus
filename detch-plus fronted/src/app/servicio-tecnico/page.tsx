"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceTechTable from "@/components/servicio-tecnico/ServiceTechTable";
import ServiceTechFullForm from "@/components/servicio-tecnico/ServiceTechFullForm";
import ServiceStatusDialog from "@/components/servicio-tecnico/ServiceStatusDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  fetchServicios,
  createServicio,
  updateServicio,
  updateServicioEstado,
  fetchServicioDetalle,
  upsertServicioDetalle,
  type ServicioTecnico,
  type ServicioDetalle,
} from "@/lib/api/servicio-tecnico";
import { getMe } from "@/lib/api/auth/me";
import Layout from "@/components/Layout";

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

  const [detailRow, setDetailRow] = useState<ServicioTecnico | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detalle, setDetalle] = useState<ServicioDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // NUEVO: diálogo de cambio de estado
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusRow, setStatusRow] = useState<ServicioTecnico | null>(null);

  // Protección
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
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Servicio Técnico</h1>
            <p className="text-gray-600">Gestión de órdenes y detalles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenNew(true)}>Nuevo servicio</Button>
            <Button variant="outline" onClick={load}>
              Refrescar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Buscar por cliente, cédula, técnico o #"
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
              <option value="EN_PROCESO">EN PROCESO</option>
              <option value="TERMINADO">TERMINADO</option>
              <option value="ENTREGADO">ENTREGADO</option>
            </select>
            <Button variant="outline" onClick={load}>
              Aplicar
            </Button>
          </div>
        </div>

        {/* Tabla */}
        {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <ServiceTechTable
            items={filtered}
            onEdit={async (row) => {
              setEditRow(row);
              const det = await fetchServicioDetalle(row.NUM_SER).catch(() => null);
              setDetalle(det);
              setOpenEdit(true);
            }}
            onChangeStatus={async (row) => {
              setStatusRow(row);
              setStatusOpen(true);
            }}
            onDetail={async (row) => {
              setDetailRow(row);
              setOpenDetail(true);
              setLoadingDetalle(true);
              try {
                const det = await fetchServicioDetalle(row.NUM_SER).catch(() => null);
                setDetalle(det);
              } finally {
                setLoadingDetalle(false);
              }
            }}
          />
        )}

        {/* Crear */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuevo servicio</DialogTitle>
            </DialogHeader>
            <ServiceTechFullForm
              onCancel={() => setOpenNew(false)}
              onSubmit={async (data, detalle) => {
                await createServicio(data, detalle);
                setOpenNew(false);
                await load();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Editar */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar servicio</DialogTitle>
            </DialogHeader>
            {editRow && (
              <ServiceTechFullForm
                initialServicio={{
                  ID_TEC: editRow.ID_TEC,
                  CED_CLI: editRow.CED_CLI,
                  PRE_SER: editRow.PRE_SER,
                  IVA_SER: editRow.IVA_SER,
                  PRE_VEN_SER: editRow.PRE_VEN_SER,
                  EST_SER: editRow.EST_SER,
                }}
                initialDetalle={detalle || undefined}
                onCancel={() => setOpenEdit(false)}
                onSubmit={async (data, detalleForm) => {
                  await updateServicio(editRow.NUM_SER, data);
                  await upsertServicioDetalle(editRow.NUM_SER, detalleForm || {});
                  setOpenEdit(false);
                  await load();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Cambiar estado */}
        <ServiceStatusDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          current={statusRow?.EST_SER}
          onSubmit={async (estado) => {
            if (!statusRow) return;
            await updateServicioEstado(statusRow.NUM_SER, estado);
            await load();
          }}
        />
      </main>
    </Layout>
  );
}
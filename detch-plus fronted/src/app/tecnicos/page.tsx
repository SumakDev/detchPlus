"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TecnicosTable from "@/components/tecnicos/TecnicosTable";
import TecnicoForm from "@/components/tecnicos/TecnicoForm";
import { fetchTecnicos, createTecnico, updateTecnico, patchTecnicoEstado } from "@/lib/api/tecnicos";
import type { Tecnico } from "@/types/tecnico";
import { getMe } from "@/lib/api/auth/me";
import Layout from "@/components/Layout";

export default function TecnicosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Tecnico[]>([]);
  const [q, setQ] = useState("");
  const [act, setAct] = useState<"" | "true" | "false">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<Tecnico | null>(null);

  // Protección: solo roles administrativos
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
      const data = await fetchTecnicos({ q, act: act || undefined });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar técnicos");
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
    return items.filter((t) => {
      const matchesQ =
        !term ||
        t.NOM_TEC.toLowerCase().includes(term) ||
        (t.TEL_TEC || "").toLowerCase().includes(term) ||
        (t.ESP_TEC || "").toLowerCase().includes(term) ||
        String(t.ID_TEC).includes(term);
      const matchesAct = !act || String(t.EST_TEC) === act;
      return matchesQ && matchesAct;
    });
  }, [items, q, act]);

  return (
    <Layout>
    <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Técnicos</h1>
          <p className="text-gray-600">Gestión de técnicos del servicio técnico</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenNew(true)}>Nuevo técnico</Button>
          <Button variant="outline" onClick={load}>Refrescar</Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-3 items-center">
          <Input
            placeholder="Buscar por nombre, teléfono o especialidad"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <select
            value={act}
            onChange={(e) => setAct(e.target.value as any)}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <Button variant="outline" onClick={load}>Aplicar</Button>
        </div>
      </div>

      {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {error}</div>}

      {!loading && !error && (
        <TecnicosTable
          items={filtered}
          onEdit={(row) => { setEditRow(row); setOpenEdit(true); }}
          onToggleStatus={async (row) => {
            await patchTecnicoEstado(row.ID_TEC, !row.EST_TEC);
            await load();
          }}
        />
      )}

      {/* Crear */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo técnico</DialogTitle>
          </DialogHeader>
          <TecnicoForm
            onCancel={() => setOpenNew(false)}
            onSubmit={async (data) => {
              await createTecnico(data);
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
            <DialogTitle>Editar técnico #{editRow?.ID_TEC}</DialogTitle>
          </DialogHeader>
          {editRow && (
            <TecnicoForm
              initial={{
                NOM_TEC: editRow.NOM_TEC,
                TEL_TEC: editRow.TEL_TEC || "",
                DIR_TEC: editRow.DIR_TEC || "",
                ESP_TEC: editRow.ESP_TEC || "",
                EST_TEC: editRow.EST_TEC,
              }}
              onCancel={() => setOpenEdit(false)}
              onSubmit={async (data) => {
                await updateTecnico(editRow.ID_TEC, data);
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
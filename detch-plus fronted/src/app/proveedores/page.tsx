"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProveedoresTable from "@/components/proveedores/ProveedoresTable";
import ProveedorForm from "@/components/proveedores/ProveedorForm";
import { fetchProveedores, createProveedor, updateProveedor, patchProveedorEstado, removeProveedor } from "@/lib/api/proveedores";
import type { Proveedor } from "@/types/proveedor";
import { getMe } from "@/lib/api/auth/me";
import Layout from "@/components/Layout";


export default function ProveedoresPage() {
  const router = useRouter();
  const [items, setItems] = useState<Proveedor[]>([]);
  const [q, setQ] = useState("");
  const [act, setAct] = useState<"" | "true" | "false">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<Proveedor | null>(null);

  // Protección: bloquear rol 4
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
      const data = await fetchProveedores({ q, act: act || undefined });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQ =
        !term ||
        p.NOM_PRV.toLowerCase().includes(term) ||
        (p.RUC_PRV || "").toLowerCase().includes(term) ||
        (p.TEL_PRV || "").toLowerCase().includes(term) ||
        (p.COR_PRV || "").toLowerCase().includes(term) ||
        (p.CON_PRI_PRV || "").toLowerCase().includes(term);
      const matchesAct = !act || String(p.EST_PRV) === act;
      return matchesQ && matchesAct;
    });
  }, [items, q, act]);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-600">Gestión de proveedores</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenNew(true)}>Nuevo proveedor</Button>
            <Button variant="outline" onClick={load}>Refrescar</Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-3 items-center">
            <Input placeholder="Buscar por nombre, RUC, teléfono, email o contacto"
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
          <ProveedoresTable
            items={filtered}
            onEdit={(row) => { setEditRow(row); setOpenEdit(true); }}
            onToggleStatus={async (row) => {
              await patchProveedorEstado(row.ID_PRV, !row.EST_PRV);
              await load();
            }}
            onDelete={async (row) => {
              if (!confirm(`¿Eliminar proveedor ${row.NOM_PRV}?`)) return;
              await removeProveedor(row.ID_PRV);
              await load();
            }}
          />
        )}

        {/* Crear */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo proveedor</DialogTitle>
            </DialogHeader>
            <ProveedorForm
              onCancel={() => setOpenNew(false)}
              onSubmit={async (data) => {
                await createProveedor(data);
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
              <DialogTitle>Editar proveedor #{editRow?.ID_PRV}</DialogTitle>
            </DialogHeader>
            {editRow && (
              <ProveedorForm
                initial={{
                  NOM_PRV: editRow.NOM_PRV,
                  RUC_PRV: editRow.RUC_PRV || "",
                  TEL_PRV: editRow.TEL_PRV || "",
                  COR_PRV: editRow.COR_PRV || "",
                  DIR_PRV: editRow.DIR_PRV || "",
                  CON_PRI_PRV: editRow.CON_PRI_PRV || "",
                  EST_PRV: editRow.EST_PRV ?? true,
                }}
                onCancel={() => setOpenEdit(false)}
                onSubmit={async (data) => {
                  await updateProveedor(editRow.ID_PRV, data);
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
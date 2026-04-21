"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PreciosTable from "@/components/precios/PreciosTable";
import PrecioForm from "@/components/precios/PrecioForm";
import {
  fetchPrecios,
  createPrecio,
  updatePrecio,
  deletePrecio,
  upsertPrecioPorTipo
} from "@/lib/api/precios";
import { getMe } from "@/lib/api/auth/me";
import  type {Precio} from "@/types/precio";

export default function PreciosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Precio[]>([]);
  const [q, setQ] = useState("");
  const [idPro, setIdPro] = useState("");
  const [tip, setTip] = useState<"" | "COMPRA" | "VENTA" | "PARTE_PAGO">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<Precio | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) { router.replace("/"); return; }
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
      const data = await fetchPrecios({
        q,
        id_pro: idPro ? Number(idPro) : undefined,
        tip: tip || undefined,
      });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar precios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((p) => {
      const marca = (p.producto?.marca?.NOM_MAR || "").toLowerCase();
      const modelo = (p.producto?.modelo?.NOM_MOD || "").toLowerCase();
      const prodName = (p.productoNombre || `${marca} ${modelo}`.trim()).toLowerCase();

      const matchesQ =
        !term ||
        String(p.ID_PRE).includes(term) ||
        String(p.ID_PRO).includes(term) ||
        p.TIP_PRE.toLowerCase().includes(term) ||
        prodName.includes(term) ||
        marca.includes(term) ||
        modelo.includes(term);

      const matchesId = !idPro || String(p.ID_PRO) === idPro;
      const matchesTip = !tip || p.TIP_PRE === tip;
      return matchesQ && matchesId && matchesTip;
    });
  }, [items, q, idPro, tip]);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Precios
            </h1>
            <p className="text-gray-600">
              Gestión de precios por producto y tipo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenNew(true)}>Nuevo precio</Button>
            <Button variant="outline" onClick={load}>
              Refrescar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Buscar por #, producto o tipo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="ID producto"
              value={idPro}
              onChange={(e) => setIdPro(e.target.value)}
              className="w-40"
            />
            <select
              value={tip}
              onChange={(e) => setTip(e.target.value as any)}
              className="border rounded px-2 py-2 text-sm"
            >
              <option value="">Tipo (todos)</option>
              <option value="COMPRA">COMPRA</option>
              <option value="VENTA">VENTA</option>
              <option value="PARTE_PAGO">PARTE_PAGO</option>
            </select>
            <Button variant="outline" onClick={load}>
              Aplicar
            </Button>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="rounded-md border p-4 bg-white">Cargando…</div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {/* Tabla */}
        {!loading && !error && (
          <PreciosTable
            items={filtered}
            onEdit={(row) => {
              setEditRow(row);
              setOpenEdit(true);
            }}
            onDelete={async (row) => {
              if (!confirm(`¿Eliminar precio #${row.ID_PRE}?`)) return;
              await deletePrecio(row.ID_PRE);
              await load();
            }}
          />
        )}

        {/* Crear */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo precio</DialogTitle>
            </DialogHeader>
            <PrecioForm
              onCancel={() => setOpenNew(false)}
              onSubmit={async (data) => {
                await upsertPrecioPorTipo(
                  data.ID_PRO,
                  data.TIP_PRE,
                  data.VAL_PRE
                );
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
              <DialogTitle>
                Editar precio #{editRow?.ID_PRE}
              </DialogTitle>
            </DialogHeader>
            {editRow && (
              <PrecioForm
                initial={{
                  ID_PRO: editRow.ID_PRO,
                  TIP_PRE: editRow.TIP_PRE,
                  VAL_PRE: editRow.VAL_PRE,
                }}
                onCancel={() => setOpenEdit(false)}
                onSubmit={async (data) => {
                  if (
                    data.ID_PRO !== editRow.ID_PRO ||
                    data.TIP_PRE !== editRow.TIP_PRE
                  ) {
                    await upsertPrecioPorTipo(
                      data.ID_PRO,
                      data.TIP_PRE,
                      data.VAL_PRE
                    );
                    await deletePrecio(editRow.ID_PRE);
                  } else {
                    await updatePrecio(editRow.ID_PRE, {
                      VAL_PRE: data.VAL_PRE,
                    });
                  }
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

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
  DialogDescription,
} from "@/components/ui/dialog";
import TelefonosTable from "@/components/telefonos/TelefonosTable";
import {
  fetchTelefonos,
  upsertTelefonoPorProducto
} from "@/lib/api/telefonos";
import type { DetTelefono } from "@/types/telefonos";
import { getMe } from "@/lib/api/auth/me";
import { fetchProductos } from "@/lib/api/products";
import type { Producto } from "@/types/product";

// Formulario embebido para crear/editar DET_TELE
function TelefonoForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DetTelefono;
  onSubmit: (data: {
    ID_PRO: number;
    COL_TEL?: string | null;
    ALM_TEL?: string | null;
    EST_BAT_TEL?: number | null;
    EST_PAN_TEL?: number | null;
    EST_CAR_TEL?: number | null;
    EST_CAM_TEL?: number | null;
    EST_SOF_TEL?: number | null;
    ACC_INC_TEL?: string | null;
  }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);

  const [form, setForm] = useState({
    ID_PRO: initial?.ID_PRO ?? 0,
    COL_TEL: initial?.COL_TEL ?? "",
    ALM_TEL: initial?.ALM_TEL ?? "",
    EST_BAT_TEL: initial?.EST_BAT_TEL ?? 0,
    EST_PAN_TEL: initial?.EST_PAN_TEL ?? 0,
    EST_CAR_TEL: initial?.EST_CAR_TEL ?? 0,
    EST_CAM_TEL: initial?.EST_CAM_TEL ?? 0,
    EST_SOF_TEL: initial?.EST_SOF_TEL ?? 0,
    ACC_INC_TEL: initial?.ACC_INC_TEL ?? "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProds(true);
        const data = await fetchProductos({ activo: "true" });
        if (mounted) setProductos(data || []);
      } finally {
        if (mounted) setLoadingProds(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function productDisplayName(p: any) {
    const direct = p?.NOM_PRO || p?.NOM_MOD || p?.DES_PRO;
    if (direct && String(direct).trim()) return String(direct);
    const marca = p?.marca?.NOM_MAR || p?.NOM_MAR || "";
    const modelo = p?.modelo?.NOM_MOD || p?.NOM_MOD || "";
    const composed = [marca, modelo].filter(Boolean).join(" ").trim();
    if (composed) return composed;
    const codigo = p?.COD_PRO || p?.SKU || "";
    return codigo ? `${p.ID_PRO} - ${codigo}` : `${p.ID_PRO}`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_PRO) {
      alert("Debe seleccionar un producto");
      return;
    }
    onSubmit({
      ID_PRO: Number(form.ID_PRO),
      COL_TEL: form.COL_TEL || null,
      ALM_TEL: form.ALM_TEL || null,
      EST_BAT_TEL: Number(form.EST_BAT_TEL) ?? 0,
      EST_PAN_TEL: Number(form.EST_PAN_TEL) ?? 0,
      EST_CAR_TEL: Number(form.EST_CAR_TEL) ?? 0,
      EST_CAM_TEL: Number(form.EST_CAM_TEL) ?? 0,
      EST_SOF_TEL: Number(form.EST_SOF_TEL) ?? 0,
      ACC_INC_TEL: form.ACC_INC_TEL || null,
    });
  }

  const editing = Boolean(initial?.ID_PRO);
  const hasInitialInList =
    !form.ID_PRO || productos.some((p: any) => Number(p.ID_PRO) === Number(form.ID_PRO));
  const initialGhost =
    form.ID_PRO && !hasInitialInList
      ? { ID_PRO: form.ID_PRO, NOM_PRO: `(No listado) ${form.ID_PRO}` }
      : null;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Producto</label>
          <select
            className="border rounded px-2 py-2 text-sm"
            value={form.ID_PRO}
            onChange={(e) => setForm((f) => ({ ...f, ID_PRO: Number(e.target.value) }))}
            required
            disabled={loadingProds || editing}
          >
            <option value={0}>{loadingProds ? "Cargando productos…" : "Seleccionar"}</option>
            {initialGhost && (
              <option value={initialGhost.ID_PRO}>{productDisplayName(initialGhost)}</option>
            )}
            {productos.map((p: any) => (
              <option key={p.ID_PRO} value={p.ID_PRO}>
                {productDisplayName(p)}
              </option>
            ))}
          </select>
          {editing && (
            <p className="text-xs text-gray-500">
              Para cambiar de producto elimina este detalle y crea uno nuevo.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Color</label>
          <Input
            value={form.COL_TEL}
            onChange={(e) => setForm((f) => ({ ...f, COL_TEL: e.target.value }))}
            placeholder="Ej: Negro"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Almacenamiento</label>
          <Input
            value={form.ALM_TEL}
            onChange={(e) => setForm((f) => ({ ...f, ALM_TEL: e.target.value }))}
            placeholder="Ej: 128GB"
          />
        </div>

        {/* Estados 0–100 */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Batería (0–100)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.EST_BAT_TEL}
            onChange={(e) =>
              setForm((f) => ({ ...f, EST_BAT_TEL: Number(e.target.value || 0) }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Pantalla (0–100)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.EST_PAN_TEL}
            onChange={(e) =>
              setForm((f) => ({ ...f, EST_PAN_TEL: Number(e.target.value || 0) }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Cargador (0–100)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.EST_CAR_TEL}
            onChange={(e) =>
              setForm((f) => ({ ...f, EST_CAR_TEL: Number(e.target.value || 0) }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Cámara (0–100)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.EST_CAM_TEL}
            onChange={(e) =>
              setForm((f) => ({ ...f, EST_CAM_TEL: Number(e.target.value || 0) }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Software (0–100)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={form.EST_SOF_TEL}
            onChange={(e) =>
              setForm((f) => ({ ...f, EST_SOF_TEL: Number(e.target.value || 0) }))
            }
          />
        </div>

        <div className="grid gap-2 md:col-span-3">
          <label className="text-sm font-medium text-gray-700">Accesorios incluidos</label>
          <textarea
            className="min-h-[80px] border rounded px-3 py-2 text-sm"
            value={form.ACC_INC_TEL}
            onChange={(e) => setForm((f) => ({ ...f, ACC_INC_TEL: e.target.value }))}
            placeholder="Ej: Cable, cargador, funda…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

export default function TelefonosPage() {
  const router = useRouter();
  const [items, setItems] = useState<DetTelefono[]>([]);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<DetTelefono | null>(null);

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
      const data = await fetchTelefonos({ q });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar teléfonos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((t) => {
      const marca = (t.producto?.marca?.NOM_MAR || "").toLowerCase();
      const modelo = (t.producto?.modelo?.NOM_MOD || "").toLowerCase();
      const acc = (t.ACC_INC_TEL || "").toLowerCase();
      return (
        !term ||
        String(t.ID_PRO).includes(term) ||
        marca.includes(term) ||
        modelo.includes(term) ||
        (t.COL_TEL || "").toLowerCase().includes(term) ||
        (t.ALM_TEL || "").toLowerCase().includes(term) ||
        acc.includes(term)
      );
    });
  }, [items, q]);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Teléfonos</h1>
            <p className="text-gray-600">(marca, modelo y especificaciones)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenNew(true)}>Nuevo detalle</Button>
            <Button variant="outline" onClick={load}>
              Refrescar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Buscar por ID producto, marca, modelo, color o accesorios"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-80"
            />
            <Button variant="outline" onClick={load}>
              Aplicar
            </Button>
          </div>
        </div>

        {/* Estado */}
        {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {/* Tabla */}
        {!loading && !error && (
          <TelefonosTable
            items={filtered}
            onEdit={(row) => {
              setEditRow(row);
              setOpenEdit(true);
            }}
            // Si deseas soportar eliminación, añade onDelete y el API correspondiente
            // onDelete={async (row) => { ... }}
          />
        )}

        {/* Crear */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nuevo detalle de teléfono</DialogTitle>
              <DialogDescription>
                Selecciona un producto y completa la información del teléfono.
              </DialogDescription>
            </DialogHeader>
            <TelefonoForm
              onCancel={() => setOpenNew(false)}
              onSubmit={async (data) => {
                await upsertTelefonoPorProducto(data.ID_PRO, data);
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
              <DialogTitle>Editar teléfono de producto {editRow?.ID_PRO}</DialogTitle>
              <DialogDescription>
                Actualiza las características del teléfono. El producto no puede cambiarse
                aquí.
              </DialogDescription>
            </DialogHeader>
            {editRow && (
              <TelefonoForm
                initial={editRow}
                onCancel={() => setOpenEdit(false)}
                onSubmit={async (data) => {
                  await upsertTelefonoPorProducto(editRow.ID_PRO, data);
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
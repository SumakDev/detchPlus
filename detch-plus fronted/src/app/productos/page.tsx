"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "@/components/products/ProductTable";
import ProductUpsertDialog from "@/components/products/ProductUpsertDialog";
import type { Producto, ProductoFormData } from "@/types/product";
import { fetchProductos, createProducto, updateProducto, deleteProducto } from "@/lib/api/products";
import { Plus } from "lucide-react";

export default function ProductosPage() {
  const [items, setItems] = useState<Producto[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openUpsert, setOpenUpsert] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductos({ q });
      setItems(data as Producto[]);
    } catch (e: any) {
      setError(e?.message || "Error al cargar productos");
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
      if (!term) return true;
      const byNombre = (p.NOMBRE || "").toLowerCase().includes(term);
      const byCodBar = (p.COD_BAR_PRO || "").toLowerCase().includes(term);
      const byImei = (p.IME_PRO || "").toLowerCase().includes(term);
      const byId = String(p.ID_PRO).toLowerCase().includes(term);
      return byNombre || byCodBar || byImei || byId;
    });
  }, [items, q]);

  function toFormData(data: ProductoFormData): FormData {
    const fd = new FormData();
    if (data.COD_BAR_PRO) fd.append("COD_BAR_PRO", data.COD_BAR_PRO);
    if (data.IME_PRO) fd.append("IME_PRO", data.IME_PRO);
    fd.append("ID_CAT", String(data.ID_CAT));
    fd.append("ID_MAR", String(data.ID_MAR));
    if (data.ID_MOD) fd.append("ID_MOD", String(data.ID_MOD));
    if (data.DES_PRO) fd.append("DES_PRO", data.DES_PRO);
    fd.append("ORG_PRO", data.ORG_PRO);
    fd.append("EST_PRO", data.EST_PRO);
    fd.append("ACT_PRO", String(!!data.ACT_PRO));
    if (data.imageFile) fd.append("image", data.imageFile);
    return fd;
  }

  async function handleCreate(data: ProductoFormData) {
    const created = await createProducto(toFormData(data));
    setItems((prev) => [created as Producto, ...prev]);
  }

  async function handleUpdate(data: ProductoFormData) {
    if (!editing) return;
    const updated = await updateProducto(editing.ID_PRO, toFormData(data));
    setItems((prev) => prev.map((x) => (x.ID_PRO === (updated as Producto).ID_PRO ? (updated as Producto) : x)));
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteProducto(id);
    setItems((prev) => prev.filter((x) => x.ID_PRO !== id));
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600">Gestiona productos, relaciones y sus imágenes</p>
          </div>
          <Button onClick={() => { setEditing(null); setOpenUpsert(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Agregar
          </Button>
        </div>

        <div className="bg-white border rounded-lg p-3 flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, código de barras, IMEI o ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={load}>Aplicar</Button>
        </div>

        {loading && <div className="rounded border bg-white p-4">Cargando…</div>}
        {error && <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {error}</div>}

        {!loading && !error && (
          <ProductTable
            productos={filtered}
            onEdit={(p) => { setEditing(p); setOpenUpsert(true); }}
            onDelete={handleDelete}
          />
        )}

        <ProductUpsertDialog
          open={openUpsert}
          onOpenChange={(o) => { if (!o) setEditing(null); setOpenUpsert(o); }}
          producto={editing || undefined}
          isEditing={!!editing}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      </div>
    </Layout>
  );
}
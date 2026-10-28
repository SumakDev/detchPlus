"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "@/components/products/ProductTable";
import ProductUpsertDialog from "@/components/products/ProductUpsertDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Producto, ProductoFormData } from "@/types/product";
import {
  fetchProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "@/lib/api/products";
import { Plus, Trash2 } from "lucide-react";

export default function ProductosPage() {
  const [items, setItems] = useState<Producto[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openUpsert, setOpenUpsert] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const byId = String(p.ID_PRO).toLowerCase().includes(term);
      const byPhoneUnit = (p.detallesTelefono || []).some(
        (d) =>
          (d.IME_TEL || "").toLowerCase().includes(term) ||
          (d.COL_TEL || "").toLowerCase().includes(term) ||
          (d.ALM_TEL || "").toLowerCase().includes(term)
      );
      return byNombre || byCodBar || byId || byPhoneUnit;
    });
  }, [items, q]);

  async function handleCreate(fd: FormData) {
    const created = await createProducto(fd);
    setItems((prev) => [created, ...prev]);
  }

  async function handleUpdate(fd: FormData) {
    if (!editing) return;
    const updated = await updateProducto(editing.ID_PRO, fd);
    setItems((prev) => prev.map((x) => (x.ID_PRO === updated.ID_PRO ? updated : x)));
    setEditing(null);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Productos
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Gestiona productos, relaciones y sus imágenes
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setOpenUpsert(true);
            }}
            className="self-start sm:self-auto text-xs sm:text-sm h-9 sm:h-10"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Agregar producto
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Buscar por nombre, código de barras, IMEI o ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:max-w-sm text-xs sm:text-sm"
          />
          <Button variant="outline" onClick={load} className="text-xs sm:text-sm shrink-0">
            Aplicar filtro
          </Button>
        </div>

        {loading && (
          <div className="rounded border bg-white p-4">Cargando…</div>
        )}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <ProductTable
            productos={filtered}
            onEdit={(p) => {
              setEditing(p);
              setOpenUpsert(true);
            }}
            onDelete={(p) => setDeleteTarget(p)}
          />
        )}

        {/* Modal Crear / Editar Producto */}
        <ProductUpsertDialog
          open={openUpsert}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
            setOpenUpsert(o);
          }}
          producto={editing || undefined}
          isEditing={!!editing}
          onSubmit={editing ? handleUpdate : handleCreate}
        />

        {/* Modal de Eliminación Lógica con diseño del sistema */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-gray-900">
                ¿Eliminar Producto?
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-gray-500 leading-relaxed">
                Esta acción realizará una <strong className="text-gray-700">eliminación lógica</strong> del producto{" "}
                <strong className="text-gray-900 font-semibold">{deleteTarget?.NOMBRE || `Producto #${deleteTarget?.ID_PRO}`}</strong>.
                El registro se conservará en la base de datos para garantizar la integridad histórica de ventas, facturas y movimientos de stock, pero ya no aparecerá activo en el catálogo ni en el sistema.
              </DialogDescription>
            </DialogHeader>

            {deleteTarget && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Código de Barras:</span>
                  <span className="font-mono font-medium">{deleteTarget.COD_BAR_PRO || "Sin código"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Marca / Modelo:</span>
                  <span>{[deleteTarget.marca?.NOM_MAR, deleteTarget.modelo?.NOM_MOD].filter(Boolean).join(" • ") || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio de Venta:</span>
                  <span className="font-bold text-emerald-700 font-mono">${Number(deleteTarget.PRECIO_VENTA || 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                <span>⚠</span> Consistencia de datos:
              </p>
              <p>
                El historial de facturas, pedidos y movimientos previos conservará la referencia del producto sin violar restricciones de clave foránea.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  if (!deleteTarget) return;
                  try {
                    setDeleting(true);
                    await deleteProducto(deleteTarget.ID_PRO);
                    setItems((prev) => prev.filter((x) => x.ID_PRO !== deleteTarget.ID_PRO));
                    setDeleteTarget(null);
                  } catch (err: any) {
                    alert(err?.message || "Error al eliminar producto");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
              >
                {deleting ? "Eliminando..." : "Sí, eliminar producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

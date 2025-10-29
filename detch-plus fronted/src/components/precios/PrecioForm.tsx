"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { fetchProductos } from "@/lib/api/products";
import type { Producto } from "@/types/product";

export default function PrecioForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { ID_PRO?: number; TIP_PRE?: "COMPRA" | "VENTA" | "PARTE_PAGO"; VAL_PRE?: number };
  onSubmit: (data: { ID_PRO: number; TIP_PRE: "COMPRA" | "VENTA" | "PARTE_PAGO"; VAL_PRE: number }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);

  const [form, setForm] = useState({
    ID_PRO: initial?.ID_PRO ?? 0,
    TIP_PRE: (initial?.TIP_PRE as "COMPRA" | "VENTA" | "PARTE_PAGO") ?? "COMPRA",
    VAL_PRE: initial?.VAL_PRE ?? 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProds(true);
        const data = await fetchProductos({ activo: "true" });
        if (mounted) setProductos(data || []);
      } catch {
        if (mounted) setProductos([]);
      } finally {
        if (mounted) setLoadingProds(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function productDisplayName(p: any): string {
    const direct = p?.DES_PRO;
    if (direct && String(direct).trim()) return String(direct);
    const marca = p?.marca?.NOM_MAR || p?.NOM_MAR || "";
    const modelo = p?.modelo?.NOM_MOD || p?.NOM_MOD || "";
    const composed = [marca, modelo].filter(Boolean).join(" ").trim();
    if (composed) return composed;
    const codigo = p?.COD_PRO || p?.SKU || "";
    return codigo ? `#${p.ID_PRO} - ${codigo}` : `#${p.ID_PRO}`;
  }

  const selectedProduct = useMemo(
    () => productos.find((p: any) => Number(p.ID_PRO) === Number(form.ID_PRO)),
    [productos, form.ID_PRO]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ID_PRO) return alert("Debe seleccionar un producto");
    onSubmit({ ID_PRO: Number(form.ID_PRO), TIP_PRE: form.TIP_PRE, VAL_PRE: Number(form.VAL_PRE) });
  }

  const hasInitialInList =
    !form.ID_PRO || productos.some((p: any) => Number(p.ID_PRO) === Number(form.ID_PRO));
  const initialGhost =
    form.ID_PRO && !hasInitialInList
      ? { ID_PRO: form.ID_PRO, DES_PRO: `(No listado) #${form.ID_PRO}` }
      : null;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2 md:col-span-2">
          <Label>Producto</Label>
          <select
            className="border rounded px-2 py-2 text-sm"
            value={form.ID_PRO}
            onChange={(e) => setForm((f) => ({ ...f, ID_PRO: Number(e.target.value) }))}
            required
            disabled={loadingProds}
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
        </div>

        <div className="grid gap-2">
          <Label>Tipo</Label>
          <select
            className="border rounded px-2 py-2 text-sm"
            value={form.TIP_PRE}
            onChange={(e) => setForm((f) => ({ ...f, TIP_PRE: e.target.value as any }))}
          >
            <option value="COMPRA">COMPRA</option>
            <option value="VENTA">VENTA</option>
            <option value="PARTE_PAGO">PARTE_PAGO</option>
          </select>
        </div>

        <div className="grid gap-2 md:col-span-3">
          <Label>Valor</Label>
          <Input
            type="number"
            step="0.01"
            value={form.VAL_PRE}
            onChange={(e) => setForm((f) => ({ ...f, VAL_PRE: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      {/* Preview del producto seleccionado con imagen */}
      {selectedProduct && (
        <div className="flex items-center gap-3 border rounded p-3 bg-gray-50">
          {selectedProduct.IMG_URL ? (
            <Image
              src={selectedProduct.IMG_URL as any}
              alt={productDisplayName(selectedProduct)}
              width={56}
              height={56}
              className="h-14 w-14 rounded object-cover border"
            />
          ) : (
            <div className="h-14 w-14 rounded bg-white border" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{productDisplayName(selectedProduct)}</span>
            <span className="text-xs text-gray-500">#{(selectedProduct as any).ID_PRO}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
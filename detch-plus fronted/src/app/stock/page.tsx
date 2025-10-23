"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockKpis from "@/components/stock/StockKpis";
import StockTable from "@/components/stock/StockTable";
import AdjustStockDialog from "@/components/stock/AdjustStockDialog";
import { StockItem } from "@/types/stock";
import { fetchStock, adjustStock, updateMinStock } from "@/lib/api/stock";

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "criticos" | "agotados" | "ok">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdjust, setOpenAdjust] = useState(false);
  const [rowAdjust, setRowAdjust] = useState<StockItem | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStock({ q, estado });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar stock");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const matchesQ =
        !q ||
        r.NOM_PRO.toLowerCase().includes(q.toLowerCase()) ||
        (r.SKU || "").toLowerCase().includes(q.toLowerCase()) ||
        r.ID_PRO.toString().includes(q);
      const critico = r.STOCK <= r.MIN_STOCK && r.STOCK > 0;
      const agotado = r.STOCK === 0;
      const ok = r.STOCK > r.MIN_STOCK;
      const matchesEstado =
        estado === "todos" ||
        (estado === "criticos" && critico) ||
        (estado === "agotados" && agotado) ||
        (estado === "ok" && ok);
      return matchesQ && matchesEstado;
    });
  }, [items, q, estado]);

  const kpis = useMemo(() => {
    const total = items.length;
    const criticos = items.filter((r) => r.STOCK <= r.MIN_STOCK && r.STOCK > 0).length;
    const agotados = items.filter((r) => r.STOCK === 0).length;
    return { total, criticos, agotados };
  }, [items]);

  function exportCsv() {
    const csv = [
      ["ID_PRO", "SKU", "Nombre", "Ubicación", "Stock", "Mínimo"],
      ...filtered.map((r) => [r.ID_PRO, r.SKU || "", r.NOM_PRO, r.UBICACION || "", r.STOCK, r.MIN_STOCK]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600">Controla existencias, mínimos y ajustes</p>
        </div>

        {/* KPIs */}
        <StockKpis total={kpis.total} criticos={kpis.criticos} agotados={kpis.agotados} />

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Buscar por nombre, SKU o ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              className="border rounded px-2 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="criticos">Críticos</option>
              <option value="agotados">Agotados</option>
              <option value="ok">OK</option>
            </select>
            <Button variant="outline" onClick={load}>Aplicar</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}>Exportar CSV</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Refrescar</Button>
          </div>
        </div>

        {/* Estados */}
        {loading && <div className="rounded-md border p-4 bg-white">Cargando stock…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {/* Tabla */}
        {!loading && !error && (
          <StockTable
            items={filtered}
            onAdjust={(row) => {
              setRowAdjust(row);
              setOpenAdjust(true);
            }}
            onUpdateMin={async (row) => {
              const val = prompt(`Nuevo mínimo para "${row.NOM_PRO}"`, String(row.MIN_STOCK));
              if (val == null) return;
              const num = Number(val);
              if (Number.isNaN(num) || num < 0) return alert("Valor inválido");
              const updated = await updateMinStock(row.ID_PRO, num);
              setItems((prev) => prev.map((r) => (r.ID_PRO === row.ID_PRO ? updated : r)));
            }}
          />
        )}

        {/* Modal de ajuste */}
        <AdjustStockDialog
          open={openAdjust}
          setOpen={setOpenAdjust}
          producto={rowAdjust ? { nombre: rowAdjust.NOM_PRO, stock: rowAdjust.STOCK } : undefined}
          onConfirm={async (delta: any, motivo: any) => {
            if (!rowAdjust) return;
            const updated = await adjustStock({ idPro: rowAdjust.ID_PRO, delta, motivo });
            setItems((prev) => prev.map((r) => (r.ID_PRO === rowAdjust.ID_PRO ? updated : r)));
          }}
        />
      </div>
    </Layout>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockKpis from "@/components/stock/StockKpis";
import StockTable from "@/components/stock/StockTable";
import AdjustStockDialog from "@/components/stock/AdjustStockDialog";
import type { StockItem } from "@/types/stock";
import { fetchStock, postAjusteDisponible, putMinMax } from "@/lib/api/stock";

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
    const term = q.trim().toLowerCase();
    return items.filter((r) => {
      const matchesQ =
        !term ||
        r.producto?.nombre?.toLowerCase().includes(term) ||
        (r.producto?.codigo || "").toLowerCase().includes(term) ||
        r.id.toString().includes(term);

      const matchesEstado =
        estado === "todos" ||
        (estado === "criticos" && r.estado === "CRITICO") ||
        (estado === "agotados" && r.estado === "AGOTADO") ||
        (estado === "ok" && r.estado === "OK");

      return matchesQ && matchesEstado;
    });
  }, [items, q, estado]);

  const kpis = useMemo(() => {
    const total = items.length;
    const criticos = items.filter((r) => r.estado === "CRITICO").length;
    const agotados = items.filter((r) => r.estado === "AGOTADO").length;
    return { total, criticos, agotados };
  }, [items]);

  function exportCsv() {
    const csv = [
      ["ID_PRO", "Código", "Nombre", "Ubicación", "Disponible", "Reservado", "Mínimo"],
      ...filtered.map((r) => [
        r.id,
        r.producto?.codigo || "",
        r.producto?.nombre || "",
        r.ubicacion || "",
        r.disponible,
        r.reservado,
        r.minimo,
      ]),
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
              placeholder="Buscar por nombre, código o ID"
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
              const val = prompt(`Nuevo mínimo para "${row.producto?.nombre || row.id}"`, String(row.minimo));
              if (val == null) return;
              const num = Number(val);
              if (Number.isNaN(num) || num < 0) {
                alert("Valor inválido");
                return;
              }
              try {
                await putMinMax(row.id, num);
                await load();
              } catch (e: any) {
                alert(e?.message || "No se pudo actualizar el mínimo");
              }
            }}
          />
        )}

        {/* Modal de ajuste */}
        <AdjustStockDialog
          open={openAdjust}
          setOpen={setOpenAdjust}
          producto={
            rowAdjust
              ? { nombre: rowAdjust.producto?.nombre || String(rowAdjust.id), stock: rowAdjust.disponible }
              : undefined
          }
          onConfirm={async (delta: number, motivo?: string) => {
            if (!rowAdjust) return;
            try {
              await postAjusteDisponible(rowAdjust.id, delta, { motivo });
              await load();
            } catch (e: any) {
              alert(e?.message || "No se pudo aplicar el ajuste");
            }
          }}
        />
      </div>
    </Layout>
  );
}
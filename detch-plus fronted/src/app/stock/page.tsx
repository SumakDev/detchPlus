"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StockKpis from "@/components/stock/StockKpis";
import StockTable from "@/components/stock/StockTable";
import AdjustStockDialog from "@/components/stock/AdjustStockDialog";
import PhoneUnitsStockDialog from "@/components/stock/PhoneUnitsStockDialog";
import KardexMovimientosDialog from "@/components/stock/KardexMovimientosDialog";
import { History } from "lucide-react";
import type { StockItem } from "@/types/stock";
import { formatEstadoProducto } from "@/types/product";
import { fetchStock, postAjusteDisponible, putMinMax } from "@/lib/api/stock";

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "criticos" | "agotados" | "ok">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdjust, setOpenAdjust] = useState(false);
  const [rowAdjust, setRowAdjust] = useState<StockItem | null>(null);

  const [openPhoneUnits, setOpenPhoneUnits] = useState(false);
  const [phoneUnitsItemId, setPhoneUnitsItemId] = useState<string | null>(null);

  const [openKardex, setOpenKardex] = useState(false);
  const [kardexItem, setKardexItem] = useState<StockItem | null>(null);

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

  const activeItems = useMemo(() => {
    return items.filter((r) => r.producto?.activo !== false);
  }, [items]);

  const currentPhoneUnitsItem = useMemo(() => {
    if (!phoneUnitsItemId) return null;
    return activeItems.find((r) => r.id === phoneUnitsItemId) || null;
  }, [activeItems, phoneUnitsItemId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return activeItems.filter((r) => {
      const matchPhoneUnit = (r.producto?.detallesTelefono || []).some(
        (d) =>
          (d.IME_TEL || "").toLowerCase().includes(term) ||
          (d.COL_TEL || "").toLowerCase().includes(term) ||
          (d.ALM_TEL || "").toLowerCase().includes(term)
      );

      const matchesQ =
        !term ||
        r.producto?.nombre?.toLowerCase().includes(term) ||
        (r.producto?.codigo || "").toLowerCase().includes(term) ||
        (r.producto?.categoria || "").toLowerCase().includes(term) ||
        r.id.toString().includes(term) ||
        matchPhoneUnit;

      const matchesEstado =
        estado === "todos" ||
        (estado === "criticos" && r.estado === "CRITICO") ||
        (estado === "agotados" && r.estado === "AGOTADO") ||
        (estado === "ok" && r.estado === "OK");

      return matchesQ && matchesEstado;
    });
  }, [activeItems, q, estado]);

  const kpis = useMemo(() => {
    const total = activeItems.length;
    const criticos = activeItems.filter((r) => r.estado === "CRITICO").length;
    const agotados = activeItems.filter((r) => r.estado === "AGOTADO").length;
    return { total, criticos, agotados };
  }, [activeItems]);

  function exportCsv() {
    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = [
      [
        "ID",
        "Código",
        "Producto",
        "Categoría",
        "Clasificación",
        "Colores y Almacenamiento",
        "Ubicación",
        "Estado Stock",
        "Disponible",
        "Reservado",
        "Mínimo",
      ],
      ...filtered.map((r) => {
        const desglose =
          (r.producto?.resumenVariantes || [])
            .map(
              (v) =>
                `${v.disponibles}x ${v.color} ${v.almacenamiento} (${formatEstadoProducto(v.estadoFisico)})`
            )
            .join(" | ") || "General";

        return [
          r.id,
          r.producto?.codigo || "S/C",
          r.producto?.nombre || `Producto #${r.id}`,
          r.producto?.categoria || "General",
          formatEstadoProducto(r.producto?.estadoFisico) || "Nuevo",
          desglose,
          r.ubicacion || "Bodega Central",
          r.estado || "OK",
          r.disponible,
          r.reservado,
          r.minimo,
        ];
      }),
    ];

    const csvLines = rows.map((row) => row.map(escapeCsv).join(";"));
    const csvContent = "\uFEFF" + csvLines.join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600">
            Controla existencias, desglose por color/almacenamiento en teléfonos, mínimos y ajustes
          </p>
        </div>

        {/* KPIs */}
        <StockKpis total={kpis.total} criticos={kpis.criticos} agotados={kpis.agotados} />

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Buscar por nombre, color, almacenamiento, IMEI o código..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-80"
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
            <Button variant="outline" onClick={load}>
              Aplicar
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setKardexItem(null);
                setOpenKardex(true);
              }}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
            >
              <History className="w-4 h-4 mr-1.5" />
              Kardex General (MOV_INV)
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={load}>
              Refrescar
            </Button>
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
            onManagePhoneUnits={(row) => {
              setPhoneUnitsItemId(row.id);
              setOpenPhoneUnits(true);
            }}
            onViewKardex={(row) => {
              setKardexItem(row);
              setOpenKardex(true);
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

        {/* Modal de ajuste (para productos generales que no son teléfonos) */}
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

        {/* Modal de Gestión de Equipos de Teléfono (Color / Almacenamiento / Clasificación / IMEI) */}
        <PhoneUnitsStockDialog
          open={openPhoneUnits}
          setOpen={setOpenPhoneUnits}
          item={currentPhoneUnitsItem}
          onUpdated={load}
        />

        {/* Modal de Kardex / Historial de Movimientos de Inventario (MOV_INV) */}
        <KardexMovimientosDialog
          open={openKardex}
          setOpen={setOpenKardex}
          item={kardexItem}
        />
      </div>
    </Layout>
  );
}

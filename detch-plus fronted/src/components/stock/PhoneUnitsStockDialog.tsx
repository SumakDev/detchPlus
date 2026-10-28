"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockItem } from "@/types/stock";
import type { EstadoProducto, OrigenProducto, DisponibilidadTelefono } from "@/types/product";
import { formatEstadoProducto, formatOrigenProducto } from "@/types/product";
import { postCreatePhoneUnits, putUpdatePhoneUnit, deletePhoneUnit } from "@/lib/api/stock";
import { Smartphone, Plus, Trash2, Layers } from "lucide-react";

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLOR_SUGGESTIONS = [
  "Negro",
  "Blanco",
  "Azul",
  "Azul Medianoche",
  "Dorado",
  "Grafito",
  "Plata",
  "Rosa",
  "Verde",
  "Morado",
  "Rojo",
  "Titanio Natural",
];

export default function PhoneUnitsStockDialog({
  open,
  setOpen,
  item,
  onUpdated,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  item: StockItem | null;
  onUpdated: () => Promise<void> | void;
}) {
  const [color, setColor] = useState("");
  const [almacenamiento, setAlmacenamiento] = useState("128GB");
  const [estadoFisico, setEstadoFisico] = useState<EstadoProducto>("NUEVO");
  const [origen, setOrigen] = useState<OrigenProducto>("COMPRA_NUEVA");
  const [cantidad, setCantidad] = useState<number>(1);
  const [imeis, setImeis] = useState("");
  const [bateria, setBateria] = useState<number>(10);
  const [pantalla, setPantalla] = useState<number>(10);
  const [accesorios, setAccesorios] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const unidades = item.producto?.detallesTelefono || [];
  const variantes = item.producto?.resumenVariantes || [];

  async function handleAddUnits(e: React.FormEvent) {
    e.preventDefault();
    if (!item || busy) return;
    if (!color.trim()) {
      setError("Debes indicar el color del teléfono (ej. Azul, Negro, Blanco).");
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await postCreatePhoneUnits({
        ID_PRO: Number(item.id),
        COL_TEL: color.trim(),
        ALM_TEL: almacenamiento,
        EST_FIS_TEL: estadoFisico,
        ORG_TEL: origen,
        cantidad: Math.max(1, Number(cantidad || 1)),
        IME_TEL: imeis.trim() || null,
        EST_BAT_TEL: bateria,
        EST_PAN_TEL: pantalla,
        ACC_INC_TEL: accesorios.trim() || null,
        DIS_TEL: "DISPONIBLE",
      });
      setColor("");
      setImeis("");
      setCantidad(1);
      setAccesorios("");
      await onUpdated();
    } catch (err: any) {
      setError(err?.message || "No se pudo registrar la unidad de teléfono");
    } finally {
      setBusy(false);
    }
  }

  async function handleChangeDisponibilidad(idDetTel: number, nextDis: DisponibilidadTelefono) {
    if (busy) return;
    try {
      setBusy(true);
      setError(null);
      await putUpdatePhoneUnit(idDetTel, { DIS_TEL: nextDis });
      await onUpdated();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la unidad");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteUnit(idDetTel: number) {
    if (busy) return;
    try {
      setBusy(true);
      setError(null);
      await deletePhoneUnit(idDetTel);
      await onUpdated();
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar la unidad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span>Unidades y Variantes de Stock — {item.producto?.nombre}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Para los teléfonos, el stock se compone de unidades físicas individuales (Color, Almacenamiento, Clasificación e IMEI). Cada unidad en estado <strong>DISPONIBLE</strong> suma automáticamente al stock.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Resumen agrupado por Color + Almacenamiento + Clasificación */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Conteo actual por Color, Almacenamiento y Clasificación
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Total Disponible: {item.disponible}
            </span>
          </div>

          {variantes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Aún no hay equipos físicos registrados para este modelo. Utiliza el formulario inferior para ingresar unidades con su color y capacidad.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variantes.map((v, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 shadow-2xs"
                >
                  <span className="font-extrabold text-blue-700 text-sm">{v.disponibles} disp.</span>
                  <span className="font-semibold text-slate-900">{v.color}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono font-bold text-slate-800">{v.almacenamiento}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {formatEstadoProducto(v.estadoFisico)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para ingresar nuevas unidades físicas con Color y Almacenamiento */}
        <form onSubmit={handleAddUnits} className="border border-blue-200 bg-blue-50/30 rounded-xl p-3.5 space-y-3">
          <div className="text-xs font-bold text-blue-950 uppercase tracking-wider">
            + Ingresar Equipos al Stock (DET_TELE)
          </div>

          <datalist id="stock-phone-colors">
            {COLOR_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div>
              <Label className="text-xs">Color *</Label>
              <Input
                list="stock-phone-colors"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Azul, Negro, Blanco..."
                className="h-8 text-xs bg-white"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Almacenamiento *</Label>
              <select
                value={almacenamiento}
                onChange={(e) => setAlmacenamiento(e.target.value)}
                className="w-full h-8 border rounded px-2 text-xs bg-white"
              >
                {STORAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Clasificación / Estado</Label>
              <select
                value={estadoFisico}
                onChange={(e) => setEstadoFisico(e.target.value as EstadoProducto)}
                className="w-full h-8 border rounded px-2 text-xs bg-white"
              >
                <option value="NUEVO">Nuevo</option>
                <option value="USADO_EXCELENTE">Usado - Excelente</option>
                <option value="USADO_BUENO">Usado - Bueno</option>
                <option value="USADO_REGULAR">Usado - Regular</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Cantidad a ingresar</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Number(e.target.value || 1)))}
                className="h-8 text-xs bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="md:col-span-2">
              <Label className="text-xs">IMEI (si ingresas varios, sepáralos por coma)</Label>
              <Input
                value={imeis}
                onChange={(e) => setImeis(e.target.value)}
                placeholder="Ej. 354891029384712, 354891029384999"
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
            <div>
              <Label className="text-xs">Origen</Label>
              <select
                value={origen}
                onChange={(e) => setOrigen(e.target.value as OrigenProducto)}
                className="w-full h-8 border rounded px-2 text-xs bg-white"
              >
                <option value="COMPRA_NUEVA">Compra Nueva</option>
                <option value="PARTE_PAGO">Parte de Pago</option>
                <option value="CONSIGNACION">Consignación</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-xs">Bat (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={bateria}
                  onChange={(e) => setBateria(Number(e.target.value))}
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div>
                <Label className="text-xs">Pant (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={pantalla}
                  onChange={(e) => setPantalla(Number(e.target.value))}
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Input
              value={accesorios}
              onChange={(e) => setAccesorios(e.target.value)}
              placeholder="Accesorios incluidos / observaciones (opcional)..."
              className="h-8 text-xs bg-white max-w-md"
            />
            <Button
              type="submit"
              size="sm"
              disabled={busy}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              {busy ? "Registrando..." : `Añadir ${cantidad} ${cantidad === 1 ? "equipo" : "equipos"} al Stock`}
            </Button>
          </div>
        </form>

        {/* Tabla de unidades físicas existentes */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Unidades individuales registradas ({unidades.length})
          </div>
          {unidades.length === 0 ? (
            <div className="border rounded-lg p-4 text-center text-xs text-gray-500">
              No hay unidades registradas todavía.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-gray-600">
                    <th className="p-2">ID</th>
                    <th className="p-2">Color</th>
                    <th className="p-2">Capacidad</th>
                    <th className="p-2">Clasificación</th>
                    <th className="p-2">Origen</th>
                    <th className="p-2">IMEI</th>
                    <th className="p-2">Bat/Pant</th>
                    <th className="p-2">Disponibilidad</th>
                    <th className="p-2 text-right">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {unidades.map((u) => (
                    <tr key={u.ID_DET_TEL} className="hover:bg-gray-50">
                      <td className="p-2 font-mono text-gray-500">#{u.ID_DET_TEL}</td>
                      <td className="p-2 font-semibold text-gray-900">{u.COL_TEL || "—"}</td>
                      <td className="p-2 font-mono font-semibold text-blue-700">{u.ALM_TEL || "—"}</td>
                      <td className="p-2">{formatEstadoProducto(u.EST_FIS_TEL)}</td>
                      <td className="p-2 text-gray-500">{formatOrigenProducto(u.ORG_TEL)}</td>
                      <td className="p-2 font-mono">{u.IME_TEL || "S/I"}</td>
                      <td className="p-2 text-gray-500">
                        {u.EST_BAT_TEL ?? 10}/10 • {u.EST_PAN_TEL ?? 10}/10
                      </td>
                      <td className="p-2">
                        {u.ID_DET_TEL && (
                          <select
                            disabled={busy}
                            value={u.DIS_TEL || "DISPONIBLE"}
                            onChange={(e) =>
                              handleChangeDisponibilidad(u.ID_DET_TEL!, e.target.value as DisponibilidadTelefono)
                            }
                            className="border rounded px-1.5 py-0.5 text-xs font-medium bg-white"
                          >
                            <option value="DISPONIBLE">DISPONIBLE</option>
                            <option value="RESERVADO">RESERVADO</option>
                            <option value="VENDIDO">VENDIDO</option>
                            <option value="BAJA">BAJA</option>
                          </select>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {u.ID_DET_TEL && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDeleteUnit(u.ID_DET_TEL!)}
                            className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                            title="Eliminar unidad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


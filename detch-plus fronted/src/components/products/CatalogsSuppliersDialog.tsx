"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchProveedores,
  createProveedor,
  deleteProveedor,
  fetchMarcas,
  createMarca,
  fetchModelosByMarca,
  createModelo,
} from "@/lib/api/catalogos";
import type { Proveedor } from "@/types/product";
import { Truck, Tag, Layers, Plus, Trash2 } from "lucide-react";

export default function CatalogsSuppliersDialog({
  open,
  onOpenChange,
  onCatalogChanged,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCatalogChanged?: () => void;
}) {
  const [tab, setTab] = useState<"proveedores" | "marcas" | "modelos">("proveedores");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [marcas, setMarcas] = useState<Array<{ ID_MAR: number; NOM_MAR: string; DES_MAR?: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ ID_MOD: string; NOM_MOD: string; ID_MAR: number; FEC_MOD?: string; marca?: { ID_MAR: number; NOM_MAR: string } }>>([]);

  // Formularios
  const [prvForm, setPrvForm] = useState({
    NOM_PRV: "",
    RUC_PRV: "",
    TEL_PRV: "",
    COR_PRV: "",
    CON_PRI_PRV: "",
    DIR_PRV: "",
  });

  const [marForm, setMarForm] = useState({
    NOM_MAR: "",
    DES_MAR: "",
  });

  const [modForm, setModForm] = useState({
    ID_MOD: "",
    NOM_MOD: "",
    ID_MAR: "" as number | "",
    FEC_MOD: new Date().toISOString().slice(0, 10),
  });

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [prvs, mars, mods] = await Promise.all([
        fetchProveedores().catch(() => []),
        fetchMarcas().catch(() => []),
        fetchModelosByMarca().catch(() => []),
      ]);
      setProveedores(prvs);
      setMarcas(mars);
      setModelos(mods);
    } catch (e: any) {
      setError(e?.message || "Error cargando catálogos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccessMsg(null);
      loadAll();
    }
  }, [open]);

  async function handleCreatePrv(e: React.FormEvent) {
    e.preventDefault();
    if (!prvForm.NOM_PRV.trim()) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await createProveedor({
        NOM_PRV: prvForm.NOM_PRV.trim(),
        RUC_PRV: prvForm.RUC_PRV.trim() || undefined,
        TEL_PRV: prvForm.TEL_PRV.trim() || undefined,
        COR_PRV: prvForm.COR_PRV.trim() || undefined,
        CON_PRI_PRV: prvForm.CON_PRI_PRV.trim() || undefined,
        DIR_PRV: prvForm.DIR_PRV.trim() || undefined,
        EST_PRV: true,
      });
      setPrvForm({ NOM_PRV: "", RUC_PRV: "", TEL_PRV: "", COR_PRV: "", CON_PRI_PRV: "", DIR_PRV: "" });
      setSuccessMsg("Proveedor registrado correctamente.");
      await loadAll();
      onCatalogChanged?.();
    } catch (err: any) {
      setError(err?.message || "No se pudo registrar el proveedor");
    }
  }

  async function handleDeletePrv(idPrv: number) {
    try {
      setError(null);
      await deleteProveedor(idPrv);
      await loadAll();
      onCatalogChanged?.();
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el proveedor (puede tener productos asociados)");
    }
  }

  async function handleCreateMar(e: React.FormEvent) {
    e.preventDefault();
    if (!marForm.NOM_MAR.trim()) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await createMarca({
        NOM_MAR: marForm.NOM_MAR.trim(),
        DES_MAR: marForm.DES_MAR.trim() || undefined,
      });
      setMarForm({ NOM_MAR: "", DES_MAR: "" });
      setSuccessMsg("Marca registrada correctamente.");
      await loadAll();
      onCatalogChanged?.();
    } catch (err: any) {
      setError(err?.message || "No se pudo registrar la marca");
    }
  }

  async function handleCreateMod(e: React.FormEvent) {
    e.preventDefault();
    if (!modForm.ID_MOD.trim() || !modForm.NOM_MOD.trim() || !modForm.ID_MAR) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await createModelo({
        ID_MOD: modForm.ID_MOD.trim().toUpperCase(),
        NOM_MOD: modForm.NOM_MOD.trim(),
        ID_MAR: Number(modForm.ID_MAR),
        FEC_MOD: modForm.FEC_MOD || new Date().toISOString().slice(0, 10),
      });
      setModForm((p) => ({ ...p, ID_MOD: "", NOM_MOD: "" }));
      setSuccessMsg("Modelo registrado correctamente.");
      await loadAll();
      onCatalogChanged?.();
    } catch (err: any) {
      setError(err?.message || "No se pudo registrar el modelo");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Gestión de Proveedores, Marcas y Modelos
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("proveedores");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              tab === "proveedores"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Proveedores ({proveedores.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("marcas");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              tab === "marcas"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Marcas ({marcas.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("modelos");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              tab === "modelos"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Modelos ({modelos.length})
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* TAB PROVEEDORES */}
        {tab === "proveedores" && (
          <div className="space-y-4">
            <form onSubmit={handleCreatePrv} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Registrar Nuevo Proveedor (PROVEEDORES)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <Label className="text-xs">Nombre / Razón Social *</Label>
                  <Input
                    value={prvForm.NOM_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, NOM_PRV: e.target.value }))}
                    placeholder="Ej. Importadora Tech S.A."
                    className="h-8 text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">RUC / Identificación</Label>
                  <Input
                    value={prvForm.RUC_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, RUC_PRV: e.target.value }))}
                    placeholder="1790012345001"
                    className="h-8 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    value={prvForm.TEL_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, TEL_PRV: e.target.value }))}
                    placeholder="0991234567"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs">Correo Electrónico</Label>
                  <Input
                    type="email"
                    value={prvForm.COR_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, COR_PRV: e.target.value }))}
                    placeholder="ventas@proveedor.com"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs">Contacto Principal</Label>
                  <Input
                    value={prvForm.CON_PRI_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, CON_PRI_PRV: e.target.value }))}
                    placeholder="Ej. Ing. Carlos Pérez"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs">Dirección</Label>
                  <Input
                    value={prvForm.DIR_PRV}
                    onChange={(e) => setPrvForm((p) => ({ ...p, DIR_PRV: e.target.value }))}
                    placeholder="Av. Principal y Secundaria"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Guardar Proveedor
                </Button>
              </div>
            </form>

            <div className="border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                  <tr>
                    <th className="p-2.5 text-left">Proveedor</th>
                    <th className="p-2.5 text-left">RUC</th>
                    <th className="p-2.5 text-left">Contacto / Teléfono</th>
                    <th className="p-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {proveedores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        {loading ? "Cargando..." : "No hay proveedores registrados"}
                      </td>
                    </tr>
                  ) : (
                    proveedores.map((p) => (
                      <tr key={p.ID_PRV} className="hover:bg-gray-50">
                        <td className="p-2.5 font-semibold text-gray-900">
                          {p.NOM_PRV}
                          {p.COR_PRV && <div className="text-[11px] text-gray-500 font-normal">{p.COR_PRV}</div>}
                        </td>
                        <td className="p-2.5 font-mono text-gray-600">{p.RUC_PRV || "—"}</td>
                        <td className="p-2.5 text-gray-600">
                          {[p.CON_PRI_PRV, p.TEL_PRV].filter(Boolean).join(" • ") || "—"}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePrv(p.ID_PRV)}
                            className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                            title="Eliminar proveedor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB MARCAS */}
        {tab === "marcas" && (
          <div className="space-y-4">
            <form onSubmit={handleCreateMar} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Registrar Nueva Marca (MARCAS)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-xs">Nombre de la Marca *</Label>
                  <Input
                    value={marForm.NOM_MAR}
                    onChange={(e) => setMarForm((p) => ({ ...p, NOM_MAR: e.target.value }))}
                    placeholder="Ej. Apple, Samsung, Sony, Xiaomi..."
                    className="h-8 text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Descripción (opcional)</Label>
                  <Input
                    value={marForm.DES_MAR}
                    onChange={(e) => setMarForm((p) => ({ ...p, DES_MAR: e.target.value }))}
                    placeholder="Fabricante oficial de dispositivos"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Guardar Marca
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
              {marcas.map((m) => (
                <span
                  key={m.ID_MAR}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white text-xs font-medium text-gray-800 shadow-2xs"
                >
                  <Tag className="w-3 h-3 text-blue-600" />
                  {m.NOM_MAR}
                  <span className="text-[10px] text-gray-400 font-mono">#{m.ID_MAR}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAB MODELOS */}
        {tab === "modelos" && (
          <div className="space-y-4">
            <form onSubmit={handleCreateMod} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Registrar Nuevo Modelo (MODELOS)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <Label className="text-xs">Marca Asociada *</Label>
                  <select
                    value={modForm.ID_MAR}
                    onChange={(e) => setModForm((p) => ({ ...p, ID_MAR: e.target.value ? Number(e.target.value) : "" }))}
                    className="w-full h-8 border rounded px-2 text-xs bg-white"
                    required
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map((m) => (
                      <option key={m.ID_MAR} value={m.ID_MAR}>
                        {m.NOM_MAR}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Código de Modelo (ID_MOD) *</Label>
                  <Input
                    value={modForm.ID_MOD}
                    onChange={(e) => setModForm((p) => ({ ...p, ID_MOD: e.target.value }))}
                    placeholder="Ej. IPH16PM, PS5SLIM, AWU2"
                    className="h-8 text-xs bg-white font-mono uppercase"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Nombre Comercial (NOM_MOD) *</Label>
                  <Input
                    value={modForm.NOM_MOD}
                    onChange={(e) => setModForm((p) => ({ ...p, NOM_MOD: e.target.value }))}
                    placeholder="Ej. iPhone 16 Pro Max, PlayStation 5 Slim"
                    className="h-8 text-xs bg-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Guardar Modelo
                </Button>
              </div>
            </form>

            <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                  <tr>
                    <th className="p-2.5 text-left">Código (ID_MOD)</th>
                    <th className="p-2.5 text-left">Modelo</th>
                    <th className="p-2.5 text-left">Marca</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modelos.map((m) => (
                    <tr key={m.ID_MOD} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono text-gray-600">{m.ID_MOD}</td>
                      <td className="p-2.5 font-semibold text-gray-900">{m.NOM_MOD}</td>
                      <td className="p-2.5 text-gray-600">{m.marca?.NOM_MAR || `Marca #${m.ID_MAR}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

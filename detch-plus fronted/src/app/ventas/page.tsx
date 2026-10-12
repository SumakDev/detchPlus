"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Plus, FileText, CheckCircle2, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Venta = {
  NUM_FAC: number;
  CED_CLI: string;
  FEC_FAC: string;
  SUB_FAC: number;
  IVA_FAC: number;
  TOT_FAC: number;
  EST_FAC: string;
  DIR_FAC?: string;
  cliente?: { NOM_CLI?: string; APE_CLI?: string; NUM_CLI?: string };
};

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);

  // Form nueva venta
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUni, setPrecioUni] = useState(0);
  const [saving, setSaving] = useState(false);

  async function loadVentas() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/ventas`, {
        headers: { ...getAuthHeaders() },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }

  async function loadFormOptions() {
    try {
      const [resCli, resPro] = await Promise.all([
        fetch(`${API}/clientes`, { headers: { ...getAuthHeaders() } }),
        fetch(`${API}/productos`, { headers: { ...getAuthHeaders() } }),
      ]);
      if (resCli.ok) setClientes(await resCli.json());
      if (resPro.ok) setProductos(await resPro.json());
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadVentas();
    loadFormOptions();
  }, []);

  async function handleCreateVenta(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient || !selectedProduct || cantidad <= 0 || precioUni <= 0) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          CED_CLI: selectedClient,
          DIR_FAC: "Venta directa",
          items: [
            {
              ID_PRO: Number(selectedProduct),
              CAN_PRO: cantidad,
              PRE_UNI_FAC: precioUni,
            },
          ],
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al procesar la venta");
      }
      setOpenNew(false);
      setSelectedProduct("");
      setCantidad(1);
      setPrecioUni(0);
      await loadVentas();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalRecaudado = ventas.reduce((acc, v) => acc + Number(v.TOT_FAC || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ventas & Facturación</h1>
            <p className="text-gray-600">Registro de facturas, ventas de productos y comprobantes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setOpenNew(true)} className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-1.5" /> Registrar Venta
            </Button>
            <Button variant="outline" onClick={loadVentas}>
              Refrescar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Facturas</p>
                <p className="text-2xl font-bold text-gray-900">{ventas.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Facturado</p>
                <p className="text-2xl font-bold text-emerald-600">${totalRecaudado.toFixed(2)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-emerald-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado Promedio</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">Al día con SRI / Inventario</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        {loading && <div className="p-6 bg-white border rounded-lg">Cargando ventas...</div>}
        {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="p-3"># Factura</th>
                  <th className="p-3">Cliente / Cédula</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">IVA (15%)</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No hay ventas registradas aún. ¡Registra la primera con el botón superior!
                    </td>
                  </tr>
                ) : (
                  ventas.map((v) => (
                    <tr key={v.NUM_FAC} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">FAC-{String(v.NUM_FAC).padStart(5, "0")}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-800">
                          {v.cliente ? `${v.cliente.NOM_CLI || ""} ${v.cliente.APE_CLI || ""}`.trim() : v.CED_CLI}
                        </div>
                        <div className="text-xs text-gray-500">{v.CED_CLI}</div>
                      </td>
                      <td className="p-3 text-gray-600">{new Date(v.FEC_FAC).toLocaleDateString()}</td>
                      <td className="p-3 text-gray-700">${Number(v.SUB_FAC).toFixed(2)}</td>
                      <td className="p-3 text-gray-700">${Number(v.IVA_FAC).toFixed(2)}</td>
                      <td className="p-3 font-bold text-gray-900">${Number(v.TOT_FAC).toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            v.EST_FAC === "PAGADA"
                              ? "bg-green-100 text-green-700"
                              : v.EST_FAC === "ANULADA"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {v.EST_FAC}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Nueva Venta */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVenta} className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Cliente</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((c) => (
                    <option key={c.CED_CLI} value={c.CED_CLI}>
                      {c.NOM_CLI} {c.APE_CLI} ({c.CED_CLI})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Producto</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const prod = productos.find((p) => String(p.ID_PRO) === e.target.value);
                    if (prod) setPrecioUni(999); // default base o referencia
                  }}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.ID_PRO} value={p.ID_PRO}>
                      {p.NOMBRE || p.DES_PRO || `Producto #${p.ID_PRO}`} ({p.COD_BAR_PRO || "Sin código"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Cantidad</label>
                  <Input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Precio Unitario ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioUni}
                    onChange={(e) => setPrecioUni(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${(cantidad * precioUni).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (15%):</span>
                  <span>${(cantidad * precioUni * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-1">
                  <span>Total estimado:</span>
                  <span>${(cantidad * precioUni * 1.15).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpenNew(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-gray-900 text-white">
                  {saving ? "Procesando..." : "Completar Venta"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

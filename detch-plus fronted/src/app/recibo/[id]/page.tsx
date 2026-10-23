"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Apple, Printer, ArrowLeft, CheckCircle2, PackageCheck, Clock, Truck, ShieldCheck, Mail, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ReciboPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/ped_onl/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos encontrar el recibo solicitado.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err?.message || "Ocurrió un error al cargar el recibo.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium text-sm">Cargando recibo oficial...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recibo no encontrado</h2>
          <p className="text-sm text-gray-500">{error || "El recibo no existe o el enlace es incorrecto."}</p>
          <Button onClick={() => router.push("/")} className="w-full bg-gray-900 text-white rounded-xl">
            Volver a la Tienda
          </Button>
        </div>
      </div>
    );
  }

  const dir = order.direccionEnvio || {};
  const user = order.usuario || {};
  const items = order.items || [];
  const fecha = order.FEC_PED_ONL ? new Date(order.FEC_PED_ONL) : new Date();

  return (
    <div className="min-h-screen bg-gray-100/60 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-gray-800">
      {/* Action Bar (hidden in print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
        </Link>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-gray-900 hover:bg-gray-800 text-white gap-2 shadow-sm rounded-xl px-5"
          >
            <Printer className="w-4 h-4" /> Imprimir Recibo
          </Button>
        </div>
      </div>

      {/* Official Receipt Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200/80 shadow-lg p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs">
              <Apple className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">DetchPlus</h1>
              <p className="text-xs text-gray-500 font-medium">Tecnología Apple & Servicio Técnico Especializado</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
              {order.EST_PED_ONL || "CONFIRMADO"}
            </span>
            <div className="text-sm font-bold text-gray-900 font-mono">{order.NUM_PED_ONL}</div>
            <div className="text-xs text-gray-500">{fecha.toLocaleDateString()} • {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-200 text-sm">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Datos del Cliente</span>
            <div className="font-semibold text-gray-900">{dir.NOM_CON_USU || `${user.NOM_USU || ""} ${user.APE_USU || ""}`.trim() || "Cliente DetchPlus"}</div>
            <div className="text-gray-500 text-xs mt-0.5">{user.COR_USU || dir.COR_USU || "Sin correo"}</div>
            <div className="text-gray-500 text-xs">{dir.TEL_CON_USU || user.TEL_USU || "Sin teléfono"}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Entrega & Seguimiento</span>
            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{dir.DIR_LIN1_USU || "Entrega en Tienda"}</span>
            </div>
            <div className="text-gray-500 text-xs ml-5">{dir.CIU_USU || "Quito"}, {dir.PROV_USU || "Pichincha"}</div>
            <div className="mt-2 text-xs font-mono font-semibold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md inline-block">
              Rastreo: {order.COD_SEG_PED || "DP-TRACK"}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 border-b border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
                <th className="text-left font-bold pb-2">Descripción</th>
                <th className="text-center font-bold pb-2 w-16">Cant.</th>
                <th className="text-right font-bold pb-2 w-28">Precio Unit.</th>
                <th className="text-right font-bold pb-2 w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">Sin productos detallados</td>
                </tr>
              ) : (
                items.map((it: any) => {
                  const cant = Number(it.CAN_PED_ONL || 1);
                  const precio = Number(it.PRE_UNI_PED_ONL || 0);
                  const tot = Number(it.PRE_TOT_PED_ONL || (cant * precio));
                  const desc = it.producto?.DES_PRO || `Producto #${it.ID_PRO}`;
                  return (
                    <tr key={it.ID_DET_PED_ONL || it.ID_PRO} className="py-3">
                      <td className="py-3 pr-4 font-medium text-gray-900">{desc}</td>
                      <td className="py-3 text-center text-gray-600">{cant}</td>
                      <td className="py-3 text-right text-gray-600">${precio.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-gray-900">${tot.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="py-6 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-800">${Number(order.SUB_PED_ONL || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>IVA (15%):</span>
              <span className="font-medium text-gray-800">${Number(order.IMP_PED_ONL || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío:</span>
              <span className="font-medium text-emerald-600 uppercase text-xs">Gratis</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total Oficial:</span>
              <span>${Number(order.TOT_PED_ONL || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment & Footer */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span>Método de pago: <strong className="text-gray-800 uppercase">{order.MET_PAG_PED}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compra asegurada y verificada
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>DetchPlus Soluciones Tecnológicas S.A. • RUC 1792837482001</p>
          <p className="mt-0.5">soporte@detchplus.plus • Ambato / Quito, Ecuador</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wrench, Search, Clock, CheckCircle2, AlertCircle, Smartphone, User, FileText } from "lucide-react";

type ServiceTrackingModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ServiceTrackingModal({ open, setOpen }: ServiceTrackingModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setErrorMsg(null);
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/servicios-tecnicos/seguimiento/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se encontraron registros de servicio técnico.");
      }

      setResults(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al consultar el servicio técnico.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "RECIBIDO":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Recibido en Taller</span>;
      case "EN_PROCESO":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 animate-pulse">En Diagnóstico / Reparación</span>;
      case "TERMINADO":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Listo para Entrega</span>;
      case "ENTREGADO":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Entregado al Cliente</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 mb-2">
            <Wrench className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Seguimiento de Servicio Técnico
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Consulta el estado de reparación de tu iPhone, iPad o dispositivo en tiempo real.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa tu N° de Orden (ej. 1) o Cédula"
              className="pl-10 rounded-xl"
              required
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded-xl px-5 hover:bg-gray-800 transition"
          >
            {loading ? "Buscando..." : "Consultar"}
          </Button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">No se encontró la orden</p>
              <p className="text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="mt-5 space-y-4">
            {results.map((serv) => (
              <div
                key={serv.NUM_SER}
                className="p-5 rounded-2xl border border-gray-200/80 bg-gray-50/50 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">ORDEN TÉCNICA</span>
                    <h3 className="text-lg font-bold text-gray-900">#ST-{String(serv.NUM_SER).padStart(4, "0")}</h3>
                  </div>
                  <div>{getStatusBadge(serv.EST_SER)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Dispositivo</p>
                      <p className="font-semibold text-gray-800">{serv.equipo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Técnico Asignado</p>
                      <p className="font-semibold text-gray-800">{serv.tecnicoNombre}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Falla Reportada</p>
                      <p className="text-gray-700">{serv.fallaReportada}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Diagnóstico / Solución</p>
                      <p className="text-gray-700">{serv.solucion}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Ingreso: {new Date(serv.FEC_SER).toLocaleDateString("es-EC")}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    Total: ${Number(serv.PRE_VEN_SER || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

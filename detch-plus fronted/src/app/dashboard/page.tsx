"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import KpiCard from "@/components/dashboard/KpiCard";
import RecentClients from "@/components/dashboard/RecentClients";
import QuickActions from "@/components/dashboard/QuickActions";
import SalesSummary from "@/components/dashboard/SalesSummary";
import StockSummary from "@/components/dashboard/StockSummary";
import ReportsPanel from "@/components/dashboard/ReportsPanel";
import {
  fetchClientesListado,
  fetchVentasResumen,
  fetchStockResumen,
  fetchReportesResumen,
  type ClienteUI,
  type VentasResumen,
  type StockResumen,
  type ReportesResumen,
} from "@/lib/api/dashboard";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [errorVentas, setErrorVentas] = useState<string | null>(null);
  const [errorStock, setErrorStock] = useState<string | null>(null);
  const [errorReportes, setErrorReportes] = useState<string | null>(null);

  const [clientes, setClientes] = useState<ClienteUI[]>([]);
  const [ventas, setVentas] = useState<VentasResumen | null>(null);
  const [stock, setStock] = useState<StockResumen | null>(null);
  const [reportes, setReportes] = useState<ReportesResumen | null>(null);

  const [userName, setUserName] = useState<string>("");

  // Protección de ruta + saludo
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    const userStr = localStorage.getItem("auth_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserName(u?.nombres || u?.usuario || "");
      } catch {}
    }
  }, [router]);

  // Cargar datos
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      setErrorClientes(null);
      setErrorVentas(null);
      setErrorStock(null);
      setErrorReportes(null);
      try {
        const [c, v, s, r] = await Promise.allSettled([
          fetchClientesListado(),
          fetchVentasResumen(),
          fetchStockResumen(),
          fetchReportesResumen(),
        ]);

        if (mounted) {
          if (c.status === "fulfilled") setClientes(c.value);
          else setErrorClientes(c.reason?.message || "Error clientes");

          if (v.status === "fulfilled") setVentas(v.value);
          else setErrorVentas(v.reason?.message || "Error ventas");

          if (s.status === "fulfilled") setStock(s.value);
          else setErrorStock(s.reason?.message || "Error stock");

          if (r.status === "fulfilled") setReportes(r.value);
          else setErrorReportes(r.reason?.message || "Error reportes");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const statsClientes = useMemo(() => {
    const total = clientes.length;
    const activos = clientes.filter((c) => c.ACTIVO).length;
    const inactivos = total - activos;
    const hoy = new Date();
    const nuevosEsteMes = clientes.filter((c) => {
      const f = new Date(c.FECHA_REGISTRO);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;
    const actividad = Math.min(100, Math.round((activos / Math.max(1, total)) * 100));
    return { total, activos, inactivos, nuevosEsteMes, actividad };
  }, [clientes]);

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/");
  }

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {userName ? `Hola, ${userName} 👋` : "Dashboard"}
          </h1>
          <p className="text-gray-600">Resumen general, ventas, stock y reportes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/clientes">
            <Button className="bg-gray-900 hover:bg-gray-800">Ir a Clientes</Button>
          </Link>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Clientes"
          value={loading ? "…" : String(statsClientes.total)}
          trendLabel="Activos"
          trendValue={loading ? "…" : `${statsClientes.activos}`}
          color="blue"
        />
        <KpiCard
          title="Ventas hoy"
          value={loading ? "…" : (ventas ? ventas.totalHoyFmt : "—")}
          trendLabel="Tickets"
          trendValue={loading ? "…" : (ventas ? `${ventas.ticketsHoy}` : "—")}
          color="green"
        />
        <KpiCard
          title="Stock crítico"
          value={loading ? "…" : (stock ? String(stock.criticos) : "—")}
          trendLabel="Agotados"
          trendValue={loading ? "…" : (stock ? String(stock.agotados) : "—")}
          color="amber"
        />
        <KpiCard
          title="Reportes generados"
          value={loading ? "…" : (reportes ? String(reportes.generadosMes) : "—")}
          trendLabel="Pendientes"
          trendValue={loading ? "…" : (reportes ? String(reportes.pendientes) : "—")}
          color="purple"
        />
      </div>

      {/* Actividad reciente + Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Actividad reciente de clientes</h2>
              <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>
            {errorClientes && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 mb-4 text-sm">
                Error: {errorClientes}
              </div>
            )}
            <RecentClients
              loading={loading}
              items={[...clientes]
                .sort((a, b) => new Date(b.FECHA_REGISTRO).getTime() - new Date(a.FECHA_REGISTRO).getTime())
                .slice(0, 5)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Resúmenes: Ventas y Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesSummary data={ventas} error={errorVentas} loading={loading} />
        <StockSummary data={stock} error={errorStock} loading={loading} />
      </div>

      {/* Reportes */}
      <ReportsPanel data={reportes} error={errorReportes} loading={loading} />
    </main>
  );
}
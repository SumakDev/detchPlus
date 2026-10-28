"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wallet,
  ArrowLeftRight,
  Users,
  Ticket,
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Star,
  Activity,
  FileText,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type TabKey = "finanzas" | "tradein" | "empleados" | "marketing" | "auditoria";

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("finanzas");
  const [loading, setLoading] = useState(true);

  // Data states
  const [movFin, setMovFin] = useState<any[]>([]);
  const [evaParPag, setEvaParPag] = useState<any[]>([]);
  const [parPagApl, setParPagApl] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [cupones, setCupones] = useState<any[]>([]);
  const [cupUso, setCupUso] = useState<any[]>([]);
  const [resPro, setResPro] = useState<any[]>([]);
  const [obsList, setObsList] = useState<any[]>([]);
  const [logsAct, setLogsAct] = useState<any[]>([]);
  const [sesUsu, setSesUsu] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);

  // 1. Finanzas Form
  const [openMovModal, setOpenMovModal] = useState(false);
  const [movForm, setMovForm] = useState({
    TIP_MOV_FIN: "INGRESO",
    MON_MOV_FIN: "",
    REF_MOV_FIN: "",
    DES_MOV_FIN: "",
    CAT_MOV_FIN: "OPERATIVO",
    CED_EMP: "",
  });

  // 2. Trade-In Form
  const [openEvaModal, setOpenEvaModal] = useState(false);
  const [evaForm, setEvaForm] = useState({
    CED_CLI: "",
    ID_PRO: "",
    VAL_EVA_PAR: "",
    OBS_EVA_PAR: "",
    CED_EMP: "",
    EST_EVA_PAR: "APROBADO",
  });

  // 3. Empleados Form
  const [openEmpModal, setOpenEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [empForm, setEmpForm] = useState({
    CED_EMP: "",
    NOM_EMP: "",
    APE_EMP: "",
    NUM_EMP: "",
    DIR_EMP: "",
    OBS_EMP: "",
    COM_EMP: "0",
    ACT_EMP: true,
  });

  // 4. Cupones Form
  const [openCupModal, setOpenCupModal] = useState(false);
  const [cupForm, setCupForm] = useState({
    COD_CUP: "",
    NOM_CUP: "",
    DES_CUP: "",
    TIP_DES_CUP: "PORCENTAJE",
    VAL_DES_CUP: "10",
    MON_MIN_CUP: "0",
    LIM_USO_CUP: "100",
    FEC_FIN_CUP: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  // 5. Observaciones Form
  const [openObsModal, setOpenObsModal] = useState(false);
  const [obsForm, setObsForm] = useState({
    TIP_OBS: "GENERAL",
    DES_OBS: "",
    CED_CLI: "",
    CED_EMP: "",
    NUM_REF_OBS: "",
  });

  async function loadAll() {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [
        rMov,
        rEva,
        rApl,
        rEmp,
        rCup,
        rCupUso,
        rRes,
        rObs,
        rLog,
        rSes,
        rCli,
        rPro,
      ] = await Promise.all([
        fetch(`${API}/mov_fin`, { headers, cache: "no-store" }),
        fetch(`${API}/eva_par_pag`, { headers, cache: "no-store" }),
        fetch(`${API}/par_pag_apl`, { headers, cache: "no-store" }),
        fetch(`${API}/empleados`, { headers, cache: "no-store" }),
        fetch(`${API}/cupones`, { headers, cache: "no-store" }),
        fetch(`${API}/cup_uso`, { headers, cache: "no-store" }),
        fetch(`${API}/res_pro`, { headers, cache: "no-store" }),
        fetch(`${API}/obs`, { headers, cache: "no-store" }),
        fetch(`${API}/log_act_usu`, { headers, cache: "no-store" }),
        fetch(`${API}/ses_usu`, { headers, cache: "no-store" }),
        fetch(`${API}/clientes`, { headers, cache: "no-store" }),
        fetch(`${API}/productos`, { headers, cache: "no-store" }),
      ]);

      if (rMov.ok) setMovFin(await rMov.json());
      if (rEva.ok) setEvaParPag(await rEva.json());
      if (rApl.ok) setParPagApl(await rApl.json());
      if (rEmp.ok) {
        const emps = await rEmp.json();
        setEmpleados(Array.isArray(emps) ? emps : []);
        if (Array.isArray(emps) && emps.length > 0) {
          setMovForm((p) => ({ ...p, CED_EMP: p.CED_EMP || emps[0].CED_EMP }));
          setEvaForm((p) => ({ ...p, CED_EMP: p.CED_EMP || emps[0].CED_EMP }));
          setObsForm((p) => ({ ...p, CED_EMP: p.CED_EMP || emps[0].CED_EMP }));
        }
      }
      if (rCup.ok) setCupones(await rCup.json());
      if (rCupUso.ok) setCupUso(await rCupUso.json());
      if (rRes.ok) setResPro(await rRes.json());
      if (rObs.ok) setObsList(await rObs.json());
      if (rLog.ok) setLogsAct(await rLog.json());
      if (rSes.ok) setSesUsu(await rSes.json());
      if (rCli.ok) setClientes(await rCli.json());
      if (rPro.ok) setProductos(await rPro.json());
    } catch (e) {
      console.error("Error cargando centro de operaciones:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Financial KPIs
  const totalIngresos = movFin
    .filter((m) => m.TIP_MOV_FIN === "INGRESO")
    .reduce((acc, m) => acc + Number(m.MON_MOV_FIN || 0), 0);
  const totalEgresos = movFin
    .filter((m) => m.TIP_MOV_FIN === "EGRESO")
    .reduce((acc, m) => acc + Number(m.MON_MOV_FIN || 0), 0);
  const totalPorCobrar = movFin
    .filter((m) => m.TIP_MOV_FIN === "POR_COBRAR")
    .reduce((acc, m) => acc + Number(m.MON_MOV_FIN || 0), 0);
  const totalPorPagar = movFin
    .filter((m) => m.TIP_MOV_FIN === "POR_PAGAR")
    .reduce((acc, m) => acc + Number(m.MON_MOV_FIN || 0), 0);
  const balanceNeto = totalIngresos - totalEgresos;

  // Actions: MOV_FIN
  async function handleCreateMov(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/mov_fin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...movForm,
          MON_MOV_FIN: Number(movForm.MON_MOV_FIN),
          CED_EMP: movForm.CED_EMP || null,
          FEC_MOV_FIN: new Date(),
        }),
      });
      if (!res.ok) throw new Error("Error registrando movimiento");
      setOpenMovModal(false);
      setMovForm((p) => ({ ...p, MON_MOV_FIN: "", REF_MOV_FIN: "", DES_MOV_FIN: "" }));
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteMov(id: number) {
    if (!confirm("¿Eliminar este movimiento financiero?")) return;
    await fetch(`${API}/mov_fin/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    await loadAll();
  }

  // Actions: EVA_PAR_PAG
  async function handleCreateEva(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/eva_par_pag`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...evaForm,
          ID_PRO: Number(evaForm.ID_PRO),
          VAL_EVA_PAR: Number(evaForm.VAL_EVA_PAR),
          FEC_EVA_PAR: new Date(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error registrando evaluación de Parte de Pago");
      }
      setOpenEvaModal(false);
      setEvaForm((p) => ({ ...p, VAL_EVA_PAR: "", OBS_EVA_PAR: "" }));
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdateEvaStatus(id: number, EST_EVA_PAR: string) {
    await fetch(`${API}/eva_par_pag/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ EST_EVA_PAR }),
    });
    await loadAll();
  }

  // Actions: EMPLEADOS
  function openCreateEmp() {
    setEditingEmp(null);
    setEmpForm({
      CED_EMP: "",
      NOM_EMP: "",
      APE_EMP: "",
      NUM_EMP: "",
      DIR_EMP: "",
      OBS_EMP: "",
      COM_EMP: "5.00",
      ACT_EMP: true,
    });
    setOpenEmpModal(true);
  }

  function openEditEmp(emp: any) {
    setEditingEmp(emp);
    setEmpForm({
      CED_EMP: emp.CED_EMP,
      NOM_EMP: emp.NOM_EMP || "",
      APE_EMP: emp.APE_EMP || "",
      NUM_EMP: emp.NUM_EMP || "",
      DIR_EMP: emp.DIR_EMP || "",
      OBS_EMP: emp.OBS_EMP || "",
      COM_EMP: String(emp.COM_EMP ?? "0"),
      ACT_EMP: emp.ACT_EMP !== false && emp.ACT_EMP !== 0,
    });
    setOpenEmpModal(true);
  }

  async function handleSaveEmp(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingEmp ? `${API}/empleados/${editingEmp.CED_EMP}` : `${API}/empleados`;
      const method = editingEmp ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...empForm,
          COM_EMP: Number(empForm.COM_EMP || 0),
          FEC_CON_EMP: editingEmp?.FEC_CON_EMP || new Date().toISOString().slice(0, 10),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error guardando empleado");
      }
      setOpenEmpModal(false);
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Actions: CUPONES & RES_PRO
  async function handleCreateCupon(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/cupones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          COD_CUP: cupForm.COD_CUP.trim().toUpperCase(),
          NOM_CUP: cupForm.NOM_CUP,
          DES_CUP: cupForm.DES_CUP,
          TIP_DES_CUP: cupForm.TIP_DES_CUP,
          VAL_DES_CUP: Number(cupForm.VAL_DES_CUP),
          MON_MIN_CUP: Number(cupForm.MON_MIN_CUP || 0),
          LIM_USO_CUP: Number(cupForm.LIM_USO_CUP || 100),
          FEC_INI_CUP: new Date(),
          FEC_FIN_CUP: new Date(cupForm.FEC_FIN_CUP),
          ACT_CUP: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error creando cupón");
      }
      setOpenCupModal(false);
      setCupForm((p) => ({ ...p, COD_CUP: "", NOM_CUP: "", DES_CUP: "" }));
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleToggleCupon(c: any) {
    await fetch(`${API}/cupones/${c.ID_CUP}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ ACT_CUP: !c.ACT_CUP }),
    });
    await loadAll();
  }

  async function handleUpdateReview(id: number, EST_RES_PRO: string) {
    await fetch(`${API}/res_pro/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ EST_RES_PRO }),
    });
    await loadAll();
  }

  async function handleDeleteReview(id: number) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await fetch(`${API}/res_pro/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    await loadAll();
  }

  // Actions: OBS & SES_USU
  async function handleCreateObs(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/obs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          TIP_OBS: obsForm.TIP_OBS,
          DES_OBS: obsForm.DES_OBS,
          CED_CLI: obsForm.CED_CLI || null,
          CED_EMP: obsForm.CED_EMP,
          NUM_REF_OBS: obsForm.NUM_REF_OBS || null,
          FEC_OBS: new Date(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error guardando observación");
      }
      setOpenObsModal(false);
      setObsForm((p) => ({ ...p, DES_OBS: "", NUM_REF_OBS: "" }));
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRevokeSession(idSes: string) {
    await fetch(`${API}/ses_usu/${idSes}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ ACT_SES_USU: false }),
    });
    await loadAll();
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Centro de Operaciones, Finanzas & Auditoría
            </h1>
            <p className="text-gray-600 text-sm">
              Gestión integral de Flujo de Caja, Parte de Pago (Trade-In), Personal, Cupones, Reseñas y Seguridad
            </p>
          </div>
          <Button variant="outline" onClick={loadAll} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sincronizar Todo
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 gap-1">
          {[
            { id: "finanzas", label: "Flujo Financiero", icon: Wallet, count: movFin.length },
            { id: "tradein", label: "Parte de Pago (Trade-In)", icon: ArrowLeftRight, count: evaParPag.length },
            { id: "empleados", label: "Empleados & Comisiones", icon: Users, count: empleados.length },
            { id: "marketing", label: "Cupones & Reseñas", icon: Ticket, count: cupones.length + resPro.length },
            { id: "auditoria", label: "Observaciones & Auditoría", icon: ShieldCheck, count: logsAct.length },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabKey)}
                className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  active
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: FLUJO FINANCIERO (MOV_FIN) */}
        {activeTab === "finanzas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">${totalIngresos.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Egresos Totales</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">${totalEgresos.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Cuentas Por Cobrar</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">${totalPorCobrar.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">Cuentas Por Pagar</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">${totalPorPagar.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 text-white">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase text-gray-300">Balance Neto Caja</p>
                  <p className="text-2xl font-bold text-white mt-1">${balanceNeto.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Libro Mayor de Movimientos Financieros (MOV_FIN)</h2>
              <Button onClick={() => setOpenMovModal(true)} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-1.5" /> Registrar Movimiento
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600 text-left">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Referencia</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">Responsable</th>
                    <th className="p-3 text-right">Monto</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {movFin.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        Sin movimientos financieros registrados.
                      </td>
                    </tr>
                  ) : (
                    movFin.map((m) => (
                      <tr key={m.ID_MOV_FIN} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs text-gray-500">#{m.ID_MOV_FIN}</td>
                        <td className="p-3 text-gray-600">
                          {m.FEC_MOV_FIN ? new Date(m.FEC_MOV_FIN).toLocaleString() : "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              m.TIP_MOV_FIN === "INGRESO"
                                ? "bg-emerald-100 text-emerald-800"
                                : m.TIP_MOV_FIN === "EGRESO"
                                ? "bg-rose-100 text-rose-800"
                                : m.TIP_MOV_FIN === "POR_COBRAR"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {m.TIP_MOV_FIN}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-gray-700">{m.CAT_MOV_FIN || "GENERAL"}</td>
                        <td className="p-3 font-mono text-xs font-semibold text-blue-600">{m.REF_MOV_FIN || "—"}</td>
                        <td className="p-3 text-gray-800">{m.DES_MOV_FIN || "—"}</td>
                        <td className="p-3 text-xs text-gray-600">
                          {m.empleado ? `${m.empleado.NOM_EMP} ${m.empleado.APE_EMP}` : m.CED_EMP || "Sistema"}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          ${Number(m.MON_MOV_FIN || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteMov(m.ID_MOV_FIN)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* TAB 2: PARTE DE PAGO / TRADE-IN (EVA_PAR_PAG & PAR_PAG_APL) */}
        {activeTab === "tradein" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Evaluaciones de Equipos en Parte de Pago (EVA_PAR_PAG)
                </h2>
                <p className="text-xs text-gray-500">
                  Evalúa dispositivos entregados por clientes como parte de pago para descontar en facturación POS.
                </p>
              </div>
              <Button onClick={() => setOpenEvaModal(true)} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-1.5" /> Nueva Evaluación Trade-In
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600 text-left">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Equipo Recibido</th>
                    <th className="p-3">Valor Tasación</th>
                    <th className="p-3">Observaciones Técnicas</th>
                    <th className="p-3">Evaluador</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Dictamen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {evaParPag.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-500">
                        No hay evaluaciones de Parte de Pago registradas.
                      </td>
                    </tr>
                  ) : (
                    evaParPag.map((ev) => (
                      <tr key={ev.ID_EVA_PAR} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">EVA-{ev.ID_EVA_PAR}</td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">
                            {ev.cliente ? `${ev.cliente.NOM_CLI} ${ev.cliente.APE_CLI}` : ev.CED_CLI}
                          </div>
                          <div className="text-xs text-gray-500">{ev.CED_CLI}</div>
                        </td>
                        <td className="p-3 font-medium text-gray-800">
                          {ev.producto?.DES_PRO || `Producto #${ev.ID_PRO}`}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">${Number(ev.VAL_EVA_PAR).toFixed(2)}</td>
                        <td className="p-3 text-gray-600 max-w-xs truncate">{ev.OBS_EVA_PAR || "—"}</td>
                        <td className="p-3 text-xs text-gray-600">
                          {ev.empleado ? `${ev.empleado.NOM_EMP} ${ev.empleado.APE_EMP}` : ev.CED_EMP}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              ev.EST_EVA_PAR === "APROBADO"
                                ? "bg-emerald-100 text-emerald-800"
                                : ev.EST_EVA_PAR === "RECHAZADO"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ev.EST_EVA_PAR}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={ev.EST_EVA_PAR}
                            onChange={(e) => handleUpdateEvaStatus(ev.ID_EVA_PAR, e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-white font-medium"
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="APROBADO">APROBADO</option>
                            <option value="RECHAZADO">RECHAZADO</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Historial de Partes de Pago Aplicadas en Facturas (PAR_PAG_APL)
              </h3>
              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">ID Aplicación</th>
                      <th className="p-3">Factura Aplicada</th>
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Monto Descontado</th>
                      <th className="p-3">Fecha Aplicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parPagApl.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          Aún no se han aplicado partes de pago a facturas. Puedes aplicarlas al crear una venta en el
                          módulo de Ventas.
                        </td>
                      </tr>
                    ) : (
                      parPagApl.map((ap) => (
                        <tr key={ap.ID_PAR_PAG} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">APL-{ap.ID_PAR_PAG}</td>
                          <td className="p-3 font-bold text-blue-600">
                            FAC-{String(ap.NUM_FAC).padStart(5, "0")}
                          </td>
                          <td className="p-3 text-gray-700">
                            EVA-{ap.ID_EVA_PAR}{" "}
                            {ap.evaluacion?.producto?.DES_PRO ? `(${ap.evaluacion.producto.DES_PRO})` : ""}
                          </td>
                          <td className="p-3 font-bold text-emerald-700">-${Number(ap.VAL_APL_PAR).toFixed(2)}</td>
                          <td className="p-3 text-gray-600">
                            {ap.FEC_APL_PAR ? new Date(ap.FEC_APL_PAR).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLEADOS (EMPLEADOS) */}
        {activeTab === "empleados" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nómina de Empleados & Asesores Comerciales</h2>
                <p className="text-xs text-gray-500">
                  Personal autorizado para facturación en mostrador, tasación de Trade-In y movimientos de inventario.
                </p>
              </div>
              <Button onClick={openCreateEmp} className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-1.5" /> Nuevo Empleado
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600 text-left">
                  <tr>
                    <th className="p-3">Cédula</th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Dirección</th>
                    <th className="p-3">Comisión (%)</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-500">
                        No hay empleados registrados.
                      </td>
                    </tr>
                  ) : (
                    empleados.map((emp) => (
                      <tr key={emp.CED_EMP} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-semibold text-gray-900">{emp.CED_EMP}</td>
                        <td className="p-3 font-medium text-gray-900">
                          {emp.NOM_EMP} {emp.APE_EMP}
                        </td>
                        <td className="p-3 text-gray-600">{emp.NUM_EMP || "—"}</td>
                        <td className="p-3 text-gray-600">{emp.DIR_EMP || "—"}</td>
                        <td className="p-3 font-semibold text-blue-700">{Number(emp.COM_EMP || 0).toFixed(2)}%</td>
                        <td className="p-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              emp.ACT_EMP ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {emp.ACT_EMP ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => openEditEmp(emp)} className="h-7 text-xs">
                            <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CUPONES & RESEÑAS (CUPONES, CUP_USO, RES_PRO) */}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Cupones Promocionales (CUPONES)</h2>
                  <p className="text-xs text-gray-500">
                    Códigos de descuento activos en el Checkout de la tienda online.
                  </p>
                </div>
                <Button onClick={() => setOpenCupModal(true)} className="bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-1.5" /> Crear Cupón
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Campaña</th>
                      <th className="p-3">Descuento</th>
                      <th className="p-3">Compra Mín.</th>
                      <th className="p-3">Usos</th>
                      <th className="p-3">Vence</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cupones.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">
                          No hay cupones creados.
                        </td>
                      </tr>
                    ) : (
                      cupones.map((c) => (
                        <tr key={c.ID_CUP} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-blue-700">{c.COD_CUP}</td>
                          <td className="p-3 font-medium text-gray-900">{c.NOM_CUP}</td>
                          <td className="p-3 font-bold text-emerald-700">
                            {c.TIP_DES_CUP === "PORCENTAJE"
                              ? `${Number(c.VAL_DES_CUP)}%`
                              : `$${Number(c.VAL_DES_CUP).toFixed(2)}`}
                          </td>
                          <td className="p-3 text-gray-600">${Number(c.MON_MIN_CUP || 0).toFixed(2)}</td>
                          <td className="p-3 text-gray-700">
                            {c.USO_ACT_CUP || 0} / {c.LIM_USO_CUP || "∞"}
                          </td>
                          <td className="p-3 text-gray-600">
                            {c.FEC_FIN_CUP ? new Date(c.FEC_FIN_CUP).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                c.ACT_CUP ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {c.ACT_CUP ? "ACTIVO" : "INACTIVO"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCupon(c)}
                              className="h-7 text-xs"
                            >
                              {c.ACT_CUP ? "Desactivar" : "Activar"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CUP_USO */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">Redenciones de Cupones en Pedidos (CUP_USO)</h3>
              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3"># Uso</th>
                      <th className="p-3">ID Cupón</th>
                      <th className="p-3">ID Usuario</th>
                      <th className="p-3">ID Pedido Online</th>
                      <th className="p-3">Descuento Aplicado</th>
                      <th className="p-3">Fecha Redención</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cupUso.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          Ningún cupón ha sido redimido todavía.
                        </td>
                      </tr>
                    ) : (
                      cupUso.map((u) => (
                        <tr key={u.ID_CUP_USO}>
                          <td className="p-3 font-mono text-xs">#{u.ID_CUP_USO}</td>
                          <td className="p-3">Cupón #{u.ID_CUP}</td>
                          <td className="p-3">Usuario #{u.ID_USU}</td>
                          <td className="p-3 font-semibold">Pedido #{u.ID_PED_ONL}</td>
                          <td className="p-3 font-bold text-emerald-700">-${Number(u.MON_DES_CUP_USO).toFixed(2)}</td>
                          <td className="p-3 text-gray-500">
                            {u.FEC_USO_CUP ? new Date(u.FEC_USO_CUP).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RES_PRO */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">Moderación de Reseñas de Productos (RES_PRO)</h3>
              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Calificación</th>
                      <th className="p-3">Título / Comentario</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Moderación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {resPro.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          No hay reseñas de productos registradas.
                        </td>
                      </tr>
                    ) : (
                      resPro.map((r) => (
                        <tr key={r.ID_RES_PRO} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">Producto #{r.ID_PRO}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {r.CAL_RES_PRO}/5
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-gray-900">{r.TIT_RES_PRO || "Sin título"}</div>
                            <div className="text-xs text-gray-600">{r.COM_RES_PRO}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                r.EST_RES_PRO === "APROBADA"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : r.EST_RES_PRO === "RECHAZADA"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.EST_RES_PRO}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateReview(r.ID_RES_PRO, "APROBADA")}
                              className="h-7 text-xs text-emerald-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aprobar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateReview(r.ID_RES_PRO, "RECHAZADA")}
                              className="h-7 text-xs text-amber-700"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Rechazar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReview(r.ID_RES_PRO)}
                              className="h-7 text-xs text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OBSERVACIONES & AUDITORÍA (OBS, LOG_ACT_USU, SES_USU) */}
        {activeTab === "auditoria" && (
          <div className="space-y-8">
            {/* OBS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Bitácora de Observaciones Operativas (OBS)</h2>
                  <p className="text-xs text-gray-500">
                    Incidencias y notas internas asociadas a clientes, productos, taller o administración.
                  </p>
                </div>
                <Button onClick={() => setOpenObsModal(true)} className="bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-1.5" /> Nueva Observación
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Referencia</th>
                      <th className="p-3">Descripción</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Empleado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {obsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">
                          No hay observaciones registradas.
                        </td>
                      </tr>
                    ) : (
                      obsList.map((o) => (
                        <tr key={o.ID_OBS} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-600">
                            {o.FEC_OBS ? new Date(o.FEC_OBS).toLocaleString() : "—"}
                          </td>
                          <td className="p-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                              {o.TIP_OBS}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs">{o.NUM_REF_OBS || "—"}</td>
                          <td className="p-3 text-gray-800">{o.DES_OBS}</td>
                          <td className="p-3 text-xs text-gray-600">
                            {o.cliente ? `${o.cliente.NOM_CLI} ${o.cliente.APE_CLI}` : o.CED_CLI || "—"}
                          </td>
                          <td className="p-3 text-xs text-gray-600">
                            {o.empleado ? `${o.empleado.NOM_EMP} ${o.empleado.APE_EMP}` : o.CED_EMP}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SES_USU */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" /> Sesiones de Usuario Registradas (SES_USU)
              </h3>
              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">IP</th>
                      <th className="p-3">Dispositivo / Navegador</th>
                      <th className="p-3">Inicio</th>
                      <th className="p-3">Expira</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sesUsu.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">
                          No hay sesiones registradas.
                        </td>
                      </tr>
                    ) : (
                      sesUsu.slice(0, 25).map((s) => (
                        <tr key={s.ID_SES_USU} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            {s.usuario ? `${s.usuario.USR_USU} (${s.usuario.COR_USU})` : `Usuario #${s.ID_USU}`}
                          </td>
                          <td className="p-3 font-mono text-xs">{s.IP_SES_USU || "—"}</td>
                          <td className="p-3 text-xs text-gray-500 max-w-xs truncate">{s.UA_SES_USU || "—"}</td>
                          <td className="p-3 text-xs text-gray-600">
                            {s.FEC_INI_SES ? new Date(s.FEC_INI_SES).toLocaleString() : "—"}
                          </td>
                          <td className="p-3 text-xs text-gray-600">
                            {s.EXP_SES_USU ? new Date(s.EXP_SES_USU).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                s.ACT_SES_USU ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {s.ACT_SES_USU ? "ACTIVA" : "CERRADA"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {s.ACT_SES_USU && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSession(s.ID_SES_USU)}
                                className="h-7 text-xs text-rose-600"
                              >
                                Revocar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LOG_ACT_USU */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" /> Auditoría de Actividad de Usuarios (LOG_ACT_USU)
              </h3>
              <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600 text-left">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Acción</th>
                      <th className="p-3">Detalle</th>
                      <th className="p-3">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logsAct.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          Sin registros de auditoría.
                        </td>
                      </tr>
                    ) : (
                      logsAct.slice(0, 50).map((l) => (
                        <tr key={l.ID_LOG_ACT_USU} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs text-gray-500">#{l.ID_LOG_ACT_USU}</td>
                          <td className="p-3 text-xs text-gray-600">
                            {l.FEC_LOG_ACT_USU ? new Date(l.FEC_LOG_ACT_USU).toLocaleString() : "—"}
                          </td>
                          <td className="p-3 font-medium">
                            {l.usuario ? `${l.usuario.USR_USU}` : l.ID_USU ? `Usuario #${l.ID_USU}` : "Sistema"}
                          </td>
                          <td className="p-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                              {l.ACC_LOG_ACT_USU}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700">{l.DES_LOG_ACT_USU || "—"}</td>
                          <td className="p-3 font-mono text-xs text-gray-500">{l.IP_LOG_ACT_USU || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: NUEVO MOVIMIENTO FINANCIERO */}
        <Dialog open={openMovModal} onOpenChange={setOpenMovModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento Financiero</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMov} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tipo</label>
                  <select
                    value={movForm.TIP_MOV_FIN}
                    onChange={(e) => setMovForm({ ...movForm, TIP_MOV_FIN: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="INGRESO">INGRESO</option>
                    <option value="EGRESO">EGRESO</option>
                    <option value="POR_COBRAR">POR COBRAR</option>
                    <option value="POR_PAGAR">POR PAGAR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Monto ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={movForm.MON_MOV_FIN}
                    onChange={(e) => setMovForm({ ...movForm, MON_MOV_FIN: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Categoría</label>
                  <Input
                    placeholder="VENTA, PROVEEDOR, GASTO..."
                    value={movForm.CAT_MOV_FIN}
                    onChange={(e) => setMovForm({ ...movForm, CAT_MOV_FIN: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Referencia / Doc</label>
                  <Input
                    placeholder="FAC-00012 / Comp-99"
                    value={movForm.REF_MOV_FIN}
                    onChange={(e) => setMovForm({ ...movForm, REF_MOV_FIN: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Empleado Responsable</label>
                <select
                  value={movForm.CED_EMP}
                  onChange={(e) => setMovForm({ ...movForm, CED_EMP: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.CED_EMP} value={emp.CED_EMP}>
                      {emp.NOM_EMP} {emp.APE_EMP} ({emp.CED_EMP})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Descripción</label>
                <Input
                  required
                  placeholder="Detalle del ingreso o egreso"
                  value={movForm.DES_MOV_FIN}
                  onChange={(e) => setMovForm({ ...movForm, DES_MOV_FIN: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenMovModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white">
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: NUEVA EVALUACIÓN TRADE-IN */}
        <Dialog open={openEvaModal} onOpenChange={setOpenEvaModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación Parte de Pago (Trade-In)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEva} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cliente</label>
                <select
                  required
                  value={evaForm.CED_CLI}
                  onChange={(e) => setEvaForm({ ...evaForm, CED_CLI: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.CED_CLI} value={c.CED_CLI}>
                      {c.NOM_CLI} {c.APE_CLI} ({c.CED_CLI})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Equipo / Producto Tasado</label>
                <select
                  required
                  value={evaForm.ID_PRO}
                  onChange={(e) => setEvaForm({ ...evaForm, ID_PRO: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((p) => (
                    <option key={p.ID_PRO} value={p.ID_PRO}>
                      {p.NOMBRE || p.DES_PRO} (#{p.ID_PRO})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Valor Aprobado ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={evaForm.VAL_EVA_PAR}
                    onChange={(e) => setEvaForm({ ...evaForm, VAL_EVA_PAR: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Dictamen Inicial</label>
                  <select
                    value={evaForm.EST_EVA_PAR}
                    onChange={(e) => setEvaForm({ ...evaForm, EST_EVA_PAR: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="APROBADO">APROBADO</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="RECHAZADO">RECHAZADO</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Empleado Evaluador</label>
                <select
                  required
                  value={evaForm.CED_EMP}
                  onChange={(e) => setEvaForm({ ...evaForm, CED_EMP: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.CED_EMP} value={emp.CED_EMP}>
                      {emp.NOM_EMP} {emp.APE_EMP} ({emp.CED_EMP})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Observaciones (Batería, estética, IMEI)
                </label>
                <Input
                  placeholder="Ej: Batería 89%, estética 9/10, libre de iCloud"
                  value={evaForm.OBS_EVA_PAR}
                  onChange={(e) => setEvaForm({ ...evaForm, OBS_EVA_PAR: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenEvaModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white">
                  Registrar Evaluación
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 3: EMPLEADO */}
        <Dialog open={openEmpModal} onOpenChange={setOpenEmpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEmp ? "Editar Empleado" : "Registrar Nuevo Empleado"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEmp} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cédula</label>
                <Input
                  required
                  disabled={!!editingEmp}
                  value={empForm.CED_EMP}
                  onChange={(e) => setEmpForm({ ...empForm, CED_EMP: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Nombres</label>
                  <Input
                    required
                    value={empForm.NOM_EMP}
                    onChange={(e) => setEmpForm({ ...empForm, NOM_EMP: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Apellidos</label>
                  <Input
                    required
                    value={empForm.APE_EMP}
                    onChange={(e) => setEmpForm({ ...empForm, APE_EMP: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Teléfono</label>
                  <Input
                    value={empForm.NUM_EMP}
                    onChange={(e) => setEmpForm({ ...empForm, NUM_EMP: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Comisión (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={empForm.COM_EMP}
                    onChange={(e) => setEmpForm({ ...empForm, COM_EMP: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Dirección</label>
                <Input
                  value={empForm.DIR_EMP}
                  onChange={(e) => setEmpForm({ ...empForm, DIR_EMP: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="act_emp"
                  checked={empForm.ACT_EMP}
                  onChange={(e) => setEmpForm({ ...empForm, ACT_EMP: e.target.checked })}
                />
                <label htmlFor="act_emp" className="text-sm text-gray-700">
                  Empleado Activo
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenEmpModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white">
                  Guardar Empleado
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 4: CUPÓN */}
        <Dialog open={openCupModal} onOpenChange={setOpenCupModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Cupón de Descuento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCupon} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Código (Ej: APPLE10)</label>
                  <Input
                    required
                    value={cupForm.COD_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, COD_CUP: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre Campaña</label>
                  <Input
                    required
                    value={cupForm.NOM_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, NOM_CUP: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tipo Descuento</label>
                  <select
                    value={cupForm.TIP_DES_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, TIP_DES_CUP: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="PORCENTAJE">PORCENTAJE (%)</option>
                    <option value="MONTO_FIJO">MONTO FIJO ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Valor</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={cupForm.VAL_DES_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, VAL_DES_CUP: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Compra Mínima ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cupForm.MON_MIN_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, MON_MIN_CUP: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Fecha Vencimiento</label>
                  <Input
                    type="date"
                    required
                    value={cupForm.FEC_FIN_CUP}
                    onChange={(e) => setCupForm({ ...cupForm, FEC_FIN_CUP: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenCupModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white">
                  Crear Cupón
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 5: OBSERVACIÓN */}
        <Dialog open={openObsModal} onOpenChange={setOpenObsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Observación Operativa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateObs} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tipo</label>
                  <select
                    value={obsForm.TIP_OBS}
                    onChange={(e) => setObsForm({ ...obsForm, TIP_OBS: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="PRODUCTO">PRODUCTO</option>
                    <option value="SERVICIO">SERVICIO</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Referencia (Opcional)</label>
                  <Input
                    placeholder="FAC-001 / SER-05"
                    value={obsForm.NUM_REF_OBS}
                    onChange={(e) => setObsForm({ ...obsForm, NUM_REF_OBS: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cliente (Opcional)</label>
                <select
                  value={obsForm.CED_CLI}
                  onChange={(e) => setObsForm({ ...obsForm, CED_CLI: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">Ninguno</option>
                  {clientes.map((c) => (
                    <option key={c.CED_CLI} value={c.CED_CLI}>
                      {c.NOM_CLI} {c.APE_CLI} ({c.CED_CLI})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Empleado Responsable</label>
                <select
                  required
                  value={obsForm.CED_EMP}
                  onChange={(e) => setObsForm({ ...obsForm, CED_EMP: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  {empleados.map((emp) => (
                    <option key={emp.CED_EMP} value={emp.CED_EMP}>
                      {emp.NOM_EMP} {emp.APE_EMP} ({emp.CED_EMP})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Descripción</label>
                <Input
                  required
                  placeholder="Detalle de la observación..."
                  value={obsForm.DES_OBS}
                  onChange={(e) => setObsForm({ ...obsForm, DES_OBS: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenObsModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 text-white">
                  Guardar Observación
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

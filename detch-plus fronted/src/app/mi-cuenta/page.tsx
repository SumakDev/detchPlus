"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import {
  Apple,
  ShoppingBag,
  Wrench,
  User,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  Heart,
  MapPin,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendVerificationApi } from "@/lib/api/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function MiCuentaPage() {
  const { user, loading, logout } = useAuth();
  const cart = useCart();
  const router = useRouter();

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"resumen" | "notificaciones" | "deseos" | "direcciones">("resumen");
  const [notifs, setNotifs] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Formulario de nueva dirección (DIR_USU)
  const [showAddDir, setShowAddDir] = useState(false);
  const [dirForm, setDirForm] = useState({
    TIP_DIR_USU: "ENVIO",
    NOM_CON_USU: "",
    TEL_CON_USU: "",
    DIR_LIN1_USU: "",
    CIU_USU: "Quito",
    PROV_USU: "Pichincha",
    REF_DIR_USU: "",
  });
  const [savingDir, setSavingDir] = useState(false);

  const loadAccountData = useCallback(async (idUsu: number) => {
    try {
      const [notifRes, wishRes, dirRes] = await Promise.all([
        fetch(`${API}/notif?idUsu=${idUsu}`),
        fetch(`${API}/lis_des?idUsu=${idUsu}`),
        fetch(`${API}/dir_usu`),
      ]);
      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotifs(Array.isArray(nData) ? nData : []);
      }
      if (wishRes.ok) {
        const wData = await wishRes.json();
        setWishlist(Array.isArray(wData) ? wData : []);
      }
      if (dirRes.ok) {
        const dData = await dirRes.json();
        if (Array.isArray(dData)) {
          setAddresses(dData.filter((d: any) => Number(d.ID_USU) === Number(idUsu) && d.ACT_DIR_USU !== false));
        }
      }
    } catch (e) {
      console.error("Error cargando datos de cuenta:", e);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    } else if (user?.ID_USU) {
      loadAccountData(Number(user.ID_USU));
    }
  }, [loading, user, router, loadAccountData]);

  async function handleMarkRead(idNotif: number) {
    try {
      const res = await fetch(`${API}/notif/${idNotif}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ LEI_NOTIF: true }),
      });
      if (res.ok) {
        setNotifs((prev) =>
          prev.map((n) => (n.ID_NOTIF === idNotif ? { ...n, LEI_NOTIF: true, FEC_LEI_NOTIF: new Date().toISOString() } : n))
        );
      }
    } catch (e) {
      console.error("Error marcando notificación:", e);
    }
  }

  async function handleRemoveWishlist(idLisDes: number) {
    try {
      const res = await fetch(`${API}/lis_des/${idLisDes}`, { method: "DELETE" });
      if (res.ok) {
        setWishlist((prev) => prev.filter((w) => w.ID_LIS_DES !== idLisDes));
      }
    } catch (e) {
      console.error("Error eliminando de lista de deseos:", e);
    }
  }

  async function handleCreateAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.ID_USU) return;
    setSavingDir(true);
    try {
      const res = await fetch(`${API}/dir_usu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_USU: user.ID_USU,
          ...dirForm,
          ACT_DIR_USU: true,
        }),
      });
      if (res.ok) {
        setShowAddDir(false);
        setDirForm({
          TIP_DIR_USU: "ENVIO",
          NOM_CON_USU: "",
          TEL_CON_USU: "",
          DIR_LIN1_USU: "",
          CIU_USU: "Quito",
          PROV_USU: "Pichincha",
          REF_DIR_USU: "",
        });
        await loadAccountData(Number(user.ID_USU));
      }
    } catch (e) {
      console.error("Error guardando dirección:", e);
    } finally {
      setSavingDir(false);
    }
  }

  async function handleDeleteAddress(idDir: number) {
    try {
      const res = await fetch(`${API}/dir_usu/${idDir}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((d) => d.ID_DIR_USU !== idDir));
      }
    } catch (e) {
      console.error("Error eliminando dirección:", e);
    }
  }

  async function handleResendVerification() {
    try {
      setResending(true);
      setResendStatus(null);
      const res = await resendVerificationApi(user?.EMAIL || user?.COR_USU);
      setResendStatus({
        ok: true,
        msg: res.message || "Correo de verificación reenviado. Revisa tu bandeja de entrada o spam.",
      });
    } catch (err: any) {
      setResendStatus({
        ok: false,
        msg: err?.message || "No se pudo reenviar el correo de verificación.",
      });
    } finally {
      setResending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando tu cuenta...</p>
      </div>
    );
  }

  if (!user) return null;

  const nombreCompleto = [user.NOM_USU, user.APE_USU].filter(Boolean).join(" ").trim() || user.USR_USU || "Cliente";
  const emailUsuario = user.EMAIL || user.COR_USU || "";
  const isVerified = Boolean(user.COR_VER_USU);
  const unreadNotifs = notifs.filter((n) => !n.LEI_NOTIF).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-gray-900">
            <Apple className="h-6 w-6" />
            <span>DetchPlus</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/catalogo" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Catálogo
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.replace("/");
              }}
              className="flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Banner de Estado de Verificación de Correo (si no está verificado) */}
        {!isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-amber-950 text-sm md:text-base">
                  Tu correo electrónico aún no ha sido verificado
                </h3>
                <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                  Confirma tu dirección (<strong className="font-semibold text-amber-950">{emailUsuario}</strong>) para garantizar la seguridad de tus compras, comprobantes fiscales y seguimiento de órdenes.
                </p>
                {resendStatus && (
                  <p
                    className={`text-xs font-semibold pt-1 ${
                      resendStatus.ok ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {resendStatus.msg}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleResendVerification}
              disabled={resending}
              className="bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl shrink-0 shadow-sm flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              {resending ? "Reenviando correo..." : "Reenviar correo de validación"}
            </Button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded-full font-medium mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Portal de Cliente
            </span>
            <h1 className="text-2xl md:text-3xl font-bold">Bienvenido, {nombreCompleto} 👋</h1>
            <p className="text-gray-300 text-sm mt-1">
              Gestiona tu información personal, notificaciones, lista de deseos y direcciones de envío.
            </p>
          </div>
          <Link href="/catalogo">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-sm">
              Explorar Tienda
            </Button>
          </Link>
        </div>

        {/* Pestañas de Navegación del Portal */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab("resumen")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "resumen" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" /> Resumen de Cuenta
          </button>
          <button
            onClick={() => setActiveTab("notificaciones")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "notificaciones" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <Bell className="w-4 h-4" /> Notificaciones
            {unreadNotifs > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white">{unreadNotifs}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("deseos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "deseos" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <Heart className="w-4 h-4" /> Mi Lista de Deseos ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab("direcciones")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "direcciones" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <MapPin className="w-4 h-4" /> Mis Direcciones ({addresses.length})
          </button>
        </div>

        {activeTab === "resumen" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Perfil */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{nombreCompleto}</h2>
                  <p className="text-xs text-gray-500">ID Usuario: #{user.ID_USU}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block">Usuario</span>
                  <span className="font-medium text-gray-800">{user.USR_USU || "No configurado"}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs block">Correo Electrónico</span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" /> No verificado
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-800 block mt-0.5">{emailUsuario || "No configurado"}</span>
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline mt-1.5 inline-flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> {resending ? "Reenviando..." : "Reenviar correo de validación"}
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Rol en el Sistema</span>
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-medium mt-0.5">
                    Cliente Web (Rol #{user.ID_ROL})
                  </span>
                </div>
              </div>
            </div>

            {/* Card Pedidos */}
            <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-gray-900">Tus Pedidos</h2>
                <p className="text-sm text-gray-600">
                  Revisa el historial de tus compras y haz seguimiento de envíos en tiempo real.
                </p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Tienda Online</span>
                <Link href="/catalogo" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                  Comprar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card Servicio Técnico */}
            <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-gray-900">Servicio Técnico</h2>
                <p className="text-sm text-gray-600">
                  Consulta el estado de reparación o diagnóstico de tus dispositivos en nuestro taller.
                </p>
              </div>
              <div className="pt-4 border-t mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Garantía oficial Apple</span>
                <Link href="/#soporte" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                  Consultar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN: NOTIFICACIONES (NOTIF) */}
        {activeTab === "notificaciones" && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Mis Notificaciones
            </h2>
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No tienes notificaciones registradas.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifs.map((n) => (
                  <div
                    key={n.ID_NOTIF}
                    className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !n.LEI_NOTIF ? "bg-blue-50/40 -mx-4 px-4 rounded-xl" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {n.TIP_NOTIF || "INFO"}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900">{n.TIT_NOTIF}</h3>
                      </div>
                      <p className="text-xs text-gray-600">{n.MEN_NOTIF}</p>
                      <span className="text-[11px] text-gray-400 block">
                        {n.FEC_CRE_NOTIF ? new Date(n.FEC_CRE_NOTIF).toLocaleString("es-EC") : ""}
                      </span>
                    </div>
                    {!n.LEI_NOTIF ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkRead(n.ID_NOTIF)}
                        className="text-xs shrink-0 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Marcar como leída
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium shrink-0">Leída</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN: LISTA DE DESEOS (LIS_DES) */}
        {activeTab === "deseos" && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" /> Mi Lista de Deseos
            </h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-gray-500">Aún no has guardado productos en tu lista de deseos.</p>
                <Link href="/catalogo">
                  <Button size="sm" className="bg-gray-900 text-white">Ir al Catálogo</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((w) => {
                  const prod = w.producto || {};
                  const activePrecio = Array.isArray(prod.precios)
                    ? prod.precios.find((p: any) => p.ACT_PRE) || prod.precios[0]
                    : null;
                  const price = Number(activePrecio?.PRE_VEN_PRO || prod.PRE_VEN_PRO || 499);
                  return (
                    <div key={w.ID_LIS_DES} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-blue-600">{prod.marca?.NOM_MAR || "DetchPlus"}</p>
                        <h3 className="text-sm font-bold text-gray-900">{prod.DES_PRO || `Producto #${w.ID_PRO}`}</h3>
                        <p className="text-sm font-extrabold text-gray-900 mt-1">${price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            cart.addToCart({
                              id: Number(w.ID_PRO),
                              name: prod.DES_PRO || `Producto #${w.ID_PRO}`,
                              price,
                            })
                          }
                          className="bg-gray-900 text-white text-xs"
                        >
                          Agregar a Bolsa
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlist(w.ID_LIS_DES)}
                          className="p-2 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-200"
                          title="Quitar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN: DIRECCIONES (DIR_USU) */}
        {activeTab === "direcciones" && (
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Mis Direcciones de Envío
              </h2>
              <Button
                size="sm"
                onClick={() => setShowAddDir((v) => !v)}
                className="bg-gray-900 text-white text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Nueva Dirección
              </Button>
            </div>

            {showAddDir && (
              <form onSubmit={handleCreateAddress} className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre de contacto *"
                  value={dirForm.NOM_CON_USU}
                  onChange={(e) => setDirForm({ ...dirForm, NOM_CON_USU: e.target.value })}
                  required
                />
                <Input
                  placeholder="Teléfono de contacto *"
                  value={dirForm.TEL_CON_USU}
                  onChange={(e) => setDirForm({ ...dirForm, TEL_CON_USU: e.target.value })}
                  required
                />
                <Input
                  placeholder="Provincia *"
                  value={dirForm.PROV_USU}
                  onChange={(e) => setDirForm({ ...dirForm, PROV_USU: e.target.value })}
                  required
                />
                <Input
                  placeholder="Ciudad *"
                  value={dirForm.CIU_USU}
                  onChange={(e) => setDirForm({ ...dirForm, CIU_USU: e.target.value })}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Dirección exacta (Calle principal, número y secundaria) *"
                    value={dirForm.DIR_LIN1_USU}
                    onChange={(e) => setDirForm({ ...dirForm, DIR_LIN1_USU: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Referencia (Opcional)"
                    value={dirForm.REF_DIR_USU}
                    onChange={(e) => setDirForm({ ...dirForm, REF_DIR_USU: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDir(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={savingDir} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {savingDir ? "Guardando..." : "Guardar Dirección"}
                  </Button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No tienes direcciones guardadas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((d) => (
                  <div key={d.ID_DIR_USU} className="p-4 rounded-xl border border-gray-100 flex items-start justify-between gap-3">
                    <div className="space-y-1 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                        {d.TIP_DIR_USU || "ENVIO"}
                      </span>
                      <p className="font-bold text-gray-900 text-sm">{d.NOM_CON_USU}</p>
                      <p className="text-gray-700">{d.DIR_LIN1_USU}</p>
                      <p className="text-gray-500">
                        {d.CIU_USU}, {d.PROV_USU} {d.TEL_CON_USU ? `• Tel: ${d.TEL_CON_USU}` : ""}
                      </p>
                      {d.REF_DIR_USU && <p className="text-gray-400 italic">Ref: {d.REF_DIR_USU}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(d.ID_DIR_USU)}
                      className="p-2 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-200"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

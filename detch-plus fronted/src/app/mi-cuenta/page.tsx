"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationApi } from "@/lib/api/auth";

export default function MiCuentaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

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
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Tienda
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
              Gestiona tu información personal, compras y estado de servicios técnicos.
            </p>
          </div>
          <Link href="/#productos">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-sm">
              Explorar Tienda
            </Button>
          </Link>
        </div>

        {/* User Info & Quick Stats */}
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
              <span className="text-gray-500">Sin pedidos pendientes</span>
              <Link href="/#productos" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
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
              <a href="#soporte" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                Consultar <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

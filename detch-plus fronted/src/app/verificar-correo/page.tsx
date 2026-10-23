"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Apple, CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, Send, ExternalLink } from "lucide-react";
import { verifyEmailApi, resendVerificationApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reenviar correo de verificación
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg("No se proporcionó un token de verificación válido.");
      return;
    }

    let isMounted = true;

    async function doVerify() {
      try {
        await verifyEmailApi(token!);
        if (isMounted) {
          setSuccess(true);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || "Error al verificar el correo electrónico.");
          setLoading(false);
        }
      }
    }

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendStatus({ ok: false, msg: "Por favor, ingresa tu correo electrónico." });
      return;
    }
    setResending(true);
    setResendStatus(null);
    setEmailPreview(null);
    try {
      const res = await resendVerificationApi(resendEmail.trim());
      setResendStatus({
        ok: true,
        msg: res?.message || "¡Enlace de verificación enviado! Revisa tu bandeja de entrada.",
      });
      if (res?.emailPreview) {
        setEmailPreview(res.emailPreview);
      }
    } catch (err: any) {
      setResendStatus({
        ok: false,
        msg: err?.message || "No se pudo reenviar el correo de validación.",
      });
    } finally {
      setResending(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10 space-y-4">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Verificando tu cuenta...</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Estamos validando tu enlace de seguridad. Esto solo tomará unos segundos.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-5">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Cuenta Verificada con Éxito!</h2>
          <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            Tu correo ha sido confirmado correctamente. Ahora tienes acceso completo a todas las funciones de DetchPlus: compras en línea, soporte técnico y seguimiento de tus pedidos.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => router.push("/?login=true")}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
          >
            Ir a la tienda e Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
        <AlertCircle className="w-9 h-9" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">No se pudo verificar el correo</h2>
        <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
          {errorMsg || "El enlace de verificación es inválido o ya ha expirado."}
        </p>
      </div>

      {/* Formulario para reenviar correo de validación */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Mail className="w-4 h-4 text-blue-600" />
          <span>¿Solicitar un nuevo enlace de validación?</span>
        </div>
        <p className="text-xs text-gray-500">
          Ingresa tu dirección de correo electrónico para recibir un nuevo enlace de validación al instante:
        </p>
        <form onSubmit={handleResend} className="space-y-3">
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            required
          />

          {resendStatus && (
            <div
              className={`text-xs p-3 rounded-lg font-medium flex items-start gap-2.5 ${
                resendStatus.ok
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {resendStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{resendStatus.msg}</span>
            </div>
          )}

          {emailPreview && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-blue-950">
                <Mail className="h-3.5 w-3.5" /> Enlace de prueba generado:
              </p>
              <a
                href={emailPreview}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Abrir correo en Ethereal <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <Button
            type="submit"
            disabled={resending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            {resending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reenviando correo...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Reenviar correo de validación</span>
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="pt-2 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-sm text-sm"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Apple className="h-7 w-7 text-gray-900" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">DetchPlus</span>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
              Cargando verificación...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        © 2024 DetchPlus. Plataforma oficial de autenticación.
      </p>
    </div>
  );
}

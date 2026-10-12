"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Apple, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { verifyEmailApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <div className="text-center py-6 space-y-5">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
        <AlertCircle className="w-9 h-9" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">No se pudo verificar el correo</h2>
        <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
          {errorMsg || "El enlace de verificación es inválido o ya ha expirado."}
        </p>
      </div>
      <div className="pt-2 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-md"
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

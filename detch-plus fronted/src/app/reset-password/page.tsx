"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Apple, Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { resetPasswordApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg("El enlace de restablecimiento es inválido o no contiene un token válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al restablecer tu contraseña.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido o incompleto</h2>
        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
          No se encontró el token de seguridad necesario para restablecer la contraseña. Por favor, solicita un nuevo enlace.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña restablecida!</h2>
        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
          Tu contraseña ha sido actualizada correctamente en el sistema. Ya puedes iniciar sesión con tu nueva clave.
        </p>
        <Button
          onClick={() => router.push("/?login=true")}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2"
        >
          Ir al Inicio e Iniciar Sesión <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="new-password" className="font-semibold text-gray-700">
          Nueva Contraseña
        </Label>
        <div className="relative mt-1">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="confirm-password" className="font-semibold text-gray-700">
          Confirmar Nueva Contraseña
        </Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-md"
      >
        {loading ? "Actualizando..." : "Restablecer Contraseña"}
      </Button>

      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 transition">
          Cancelar y volver al inicio
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Apple className="h-7 w-7 text-gray-900" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">DetchPlus</span>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restablecer Contraseña</h1>
          <p className="text-gray-500 text-sm mt-1">Crea una nueva contraseña segura para tu cuenta</p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
              Cargando comprobación de seguridad...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        © 2024 DetchPlus. Protección de cuenta y servicios oficiales.
      </p>
    </div>
  );
}
